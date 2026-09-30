import bs58 from "bs58";
import nacl from "tweetnacl";
import { sql } from "drizzle-orm";
import { createAssociatedTokenAccountIdempotentInstruction, createMintToInstruction } from "@solana/spl-token";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import type { Db } from "@/lib/db/client";
import { businesses, chainSignatures, type DestinationProof } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { toUnits } from "@/lib/money";
import { destinationProofMessage } from "@/lib/solana/proof";
import { ata, buildPaymentTransaction } from "@/lib/solana/tx";
import { chain, connection, isSimulated, sim } from "./chain";
import { createCustomer, createInvoice, createPaymentRequest } from "./invoices";
import { simulatedKeys } from "./sim-keys";

export const DEMO_OWNER_EMAIL = "owner@lumen.test";
export const DEMO_CUSTOMER_EMAIL = "ap@acme.test";

const fromSecret = (s: string | undefined) => (s ? Keypair.fromSecretKey(bs58.decode(s)) : null);

/** Devnet-only (or simulated) demo wallets held by the server. Null outside demo mode. */
export function demoKeys() {
  const e = env();
  if (!e.DEMO_MODE) return null;
  if (isSimulated()) return simulatedKeys();
  return {
    treasury: fromSecret(e.DEMO_TREASURY_SECRET),
    merchant: fromSecret(e.DEMO_MERCHANT_SECRET),
    customer: fromSecret(e.DEMO_CUSTOMER_SECRET),
  };
}

export function demoReady() {
  const k = demoKeys();
  return Boolean(k?.merchant && k.customer && k.treasury && env().PAYFIX_MINT);
}

/** Creates the demo agency, its repeat client, and the two invoices from the demo script. */
export async function seedDemo(db: Db) {
  const existing = await db.select().from(businesses).limit(1);
  if (existing.length) return existing[0].id;
  const keys = demoKeys();
  const mint = env().PAYFIX_MINT;
  if (!keys?.merchant || !mint) throw new Error("Run `npm run setup:devnet` first to create the test mint and demo wallets.");

  const businessId = "biz_lumen";
  await db.insert(businesses).values({
    id: businessId,
    name: "Lumen Studio",
    ownerEmail: DEMO_OWNER_EMAIL,
    walletAddress: keys.merchant.publicKey.toBase58(),
    mint,
  });
  const acme = await createCustomer(db, { businessId, name: "Acme Robotics", email: DEMO_CUSTOMER_EMAIL });
  await createCustomer(db, { businessId, name: "Northwind Coffee", email: "finance@northwind.test" });
  const day = 864e5;
  await createInvoice(db, { businessId, customerId: acme, title: "Brand identity system", amount: toUnits("1000"), dueAt: new Date(Date.now() + 10 * day) });
  await createInvoice(db, { businessId, customerId: acme, title: "Website retainer — October", amount: toUnits("400"), dueAt: new Date(Date.now() + 21 * day) });
  // Earlier demo runs left history on the merchant account; don't re-ingest it into the fresh workspace.
  const history = await chain()
    .getSignatures(ata(mint, keys.merchant.publicKey).toBase58(), 500)
    .catch(() => []);
  if (history.length)
    await db
      .insert(chainSignatures)
      .values(history.map((s) => ({ businessId, signature: s.signature, relevant: false })))
      .onConflictDoNothing();
  return businessId;
}

/** Wipes every table and reseeds the demo workspace. */
export async function resetDemo(db: Db) {
  await db.execute(sql`
    truncate table postings, journal_entries, refund_attempts, refunds, approvals, proposals, resolution_links,
      case_transfers, cases, transfers, chain_signatures, payment_requests, invoices, customers, events,
      otp_codes, sessions, outbox, businesses restart identity cascade`);
  return seedDemo(db);
}

async function waitForConfirmation(signature: string, timeoutMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const status = await chain().getSignatureStatus(signature);
    if (status?.err) throw new Error("The transaction failed on chain.");
    if (status?.confirmed) return;
    await new Promise((r) => setTimeout(r, 1200));
  }
  throw new Error("Timed out waiting for confirmation.");
}

/** The demo customer pays an invoice from its demo wallet. Returns the signature. */
export async function demoPay(db: Db, p: { invoiceId: string; amount: bigint }) {
  const keys = demoKeys();
  if (!keys?.customer) throw new Error("Demo wallets aren't configured.");
  const req = await createPaymentRequest(db, { invoiceId: p.invoiceId, amount: p.amount });
  const [biz] = await db.select().from(businesses).limit(1);
  const { blockhash, lastValidBlockHeight } = await chain().getLatestBlockhash();
  const tx = buildPaymentTransaction({
    payer: keys.customer.publicKey,
    merchant: new PublicKey(biz.walletAddress),
    mint: new PublicKey(biz.mint),
    decimals: env().PAYFIX_MINT_DECIMALS,
    amount: p.amount,
    reference: new PublicKey(req.reference),
    blockhash,
    lastValidBlockHeight,
  });
  tx.sign(keys.customer);
  const signature = await chain().sendRawTransaction(tx.serialize());
  await waitForConfirmation(signature);
  return { signature, reference: req.reference };
}

function signProof(kp: Keypair, caseId: string, method: DestinationProof["method"]) {
  const destination = kp.publicKey.toBase58();
  const message = destinationProofMessage({ caseId, destination, nonce: bs58.encode(nacl.randomBytes(12)) });
  const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey));
  return { destination, proof: { method, message, signature, verifiedAt: new Date().toISOString() } satisfies DestinationProof };
}

/** Demo customer wallets: "primary" pays invoices; "alternate" demonstrates a destination change. */
export function demoCustomerWallets() {
  const keys = demoKeys();
  if (!keys?.customer || !keys.treasury) return null;
  const alternate = Keypair.fromSeed(nacl.hash(keys.treasury.secretKey).slice(0, 32));
  return { primary: keys.customer, alternate };
}

/** Signs the refund-destination proof with one of the demo customer wallets. */
export function demoDestinationProof(caseId: string, which: "primary" | "alternate") {
  const wallets = demoCustomerWallets();
  if (!wallets) throw new Error("Demo wallets aren't configured.");
  return signProof(wallets[which], caseId, "demo_wallet");
}

/** Signs a prepared refund with the demo merchant wallet (only when it is the business wallet). */
export function demoSignRefund(unsignedB64: string, walletAddress: string) {
  const keys = demoKeys();
  if (!keys?.merchant || keys.merchant.publicKey.toBase58() !== walletAddress)
    throw new Error("This business receives into a connected wallet — sign the refund there.");
  const tx = Transaction.from(Buffer.from(unsignedB64, "base64"));
  tx.partialSign(keys.merchant);
  return tx.serialize().toString("base64");
}

/** Test-token faucet: sends test USD (and a little devnet SOL for fees) to any wallet. */
export async function faucet(address: string, amount = toUnits("2000")) {
  const simulator = sim();
  if (simulator) {
    simulator.fund(new PublicKey(address).toBase58(), amount);
    return null;
  }
  const keys = demoKeys();
  const mint = env().PAYFIX_MINT;
  if (!keys?.treasury || !mint) throw new Error("The faucet isn't configured.");
  const owner = new PublicKey(address);
  const mintPk = new PublicKey(mint);
  const conn = connection();
  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(keys.treasury.publicKey, ata(mintPk, owner), owner, mintPk),
    createMintToInstruction(mintPk, ata(mintPk, owner), keys.treasury.publicKey, amount),
  );
  if ((await conn.getBalance(owner)) < 0.01 * LAMPORTS_PER_SOL)
    tx.add(SystemProgram.transfer({ fromPubkey: keys.treasury.publicKey, toPubkey: owner, lamports: 0.02 * LAMPORTS_PER_SOL }));
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = keys.treasury.publicKey;
  tx.sign(keys.treasury);
  const signature = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
  return signature;
}

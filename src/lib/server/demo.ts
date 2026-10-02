import bs58 from "bs58";
import nacl from "tweetnacl";
import { and, eq } from "drizzle-orm";
import { createAssociatedTokenAccountIdempotentInstruction, createMintToInstruction } from "@solana/spl-token";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import type { Db } from "@/lib/db/client";
import { businesses, businessWallets, invoices, type DestinationProof } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { formatUsd, toUnits } from "@/lib/money";
import { destinationProofMessage } from "@/lib/solana/proof";
import { ata, buildPaymentTransaction } from "@/lib/solana/tx";
import { chain, connection, isSimulated, sim } from "./chain";
import { decryptSecret, encryptSecret } from "./crypto";
import { createPaymentRequest, InputError } from "./invoices";
import { simulatedKeys } from "./sim-keys";

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

/**
 * A fresh, server-held devnet wallet for a new demo company, so every visitor's
 * workspace receives into its own account and never sees anyone else's payments.
 * The treasury opens its test-token account and gives it a little SOL for refund fees.
 */
export async function provisionDemoWallet(): Promise<{ address: string; secretEnc: string }> {
  const kp = Keypair.generate();
  const address = kp.publicKey.toBase58();
  const simulator = sim();
  if (simulator) {
    simulator.fund(address, 0n);
  } else {
    const keys = demoKeys();
    const mint = env().PAYFIX_MINT;
    if (!keys?.treasury || !mint) throw new Error("Demo wallets aren't configured. Run `npm run setup:devnet`.");
    const mintPk = new PublicKey(mint);
    const conn = connection();
    const tx = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(keys.treasury.publicKey, ata(mintPk, kp.publicKey), kp.publicKey, mintPk),
      SystemProgram.transfer({ fromPubkey: keys.treasury.publicKey, toPubkey: kp.publicKey, lamports: 0.01 * LAMPORTS_PER_SOL }),
    );
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = keys.treasury.publicKey;
    tx.sign(keys.treasury);
    const signature = await conn.sendRawTransaction(tx.serialize());
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
  }
  return { address, secretEnc: encryptSecret(bs58.encode(kp.secretKey)) };
}

/** Test-token balance of a wallet, in base units (0 if it has no token account). */
export async function tokenBalance(owner: string): Promise<bigint> {
  const simulator = sim();
  if (simulator) return simulator.balance(owner);
  const mint = env().PAYFIX_MINT;
  if (!mint) return 0n;
  try {
    const r = await connection().getTokenAccountBalance(ata(mint, owner), "confirmed");
    return BigInt(r.value.amount);
  } catch {
    return 0n;
  }
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

const DEMO_TOP_UP_LIMIT = toUnits("100000");

/** The demo customer pays an invoice from its demo wallet. Returns the signature. */
export async function demoPay(db: Db, p: { invoiceId: string; amount: bigint }) {
  const keys = demoKeys();
  if (!keys?.customer) throw new Error("Demo wallets aren't configured.");
  // Every visitor's demo pays from this one wallet, so keep it stocked for reasonable
  // amounts (we're the test mint's authority). Absurd amounts get a clear answer instead.
  const customer = keys.customer.publicKey.toBase58();
  let balance = await tokenBalance(customer);
  if (balance < p.amount && p.amount <= DEMO_TOP_UP_LIMIT) {
    await faucet(customer, p.amount - balance + toUnits("5000"));
    balance = await tokenBalance(customer);
  }
  if (balance < p.amount)
    throw new InputError(
      `The demo customer wallet only holds ${formatUsd(balance)} test USD and tops up to at most ${formatUsd(DEMO_TOP_UP_LIMIT)} per payment, so it can’t pay ${formatUsd(p.amount)}. Pay a smaller amount.`,
    );
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, p.invoiceId));
  if (!inv) throw new InputError("Invoice not found.");
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, inv.businessId));
  const req = await createPaymentRequest(db, { invoiceId: p.invoiceId, amount: p.amount });
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

/** The server-held key for one of a company's wallets, if it has one (demo mode only). */
export async function serverHeldKey(db: Db, businessId: string, walletAddress: string): Promise<Keypair | null> {
  if (!env().DEMO_MODE) return null;
  const [w] = await db
    .select()
    .from(businessWallets)
    .where(and(eq(businessWallets.businessId, businessId), eq(businessWallets.address, walletAddress)));
  if (w?.secretEnc) return Keypair.fromSecretKey(bs58.decode(decryptSecret(w.secretEnc)));
  const legacy = demoKeys()?.merchant;
  return legacy && legacy.publicKey.toBase58() === walletAddress ? legacy : null;
}

/** Signs a prepared refund with the company's server-held demo wallet. */
export async function demoSignRefund(db: Db, p: { businessId: string; unsignedB64: string; walletAddress: string }) {
  const kp = await serverHeldKey(db, p.businessId, p.walletAddress);
  if (!kp) throw new InputError("This wallet's key isn't held by PayFix. Sign the refund in that wallet.");
  const tx = Transaction.from(Buffer.from(p.unsignedB64, "base64"));
  tx.partialSign(kp);
  return tx.serialize().toString("base64");
}

/**
 * Demo mode: make sure a wallet has a test-token account, so payments to it can land.
 * The treasury pays the rent. (Customer payments also create it if missing.)
 */
export async function ensureTokenAccount(address: string) {
  const simulator = sim();
  if (simulator) {
    simulator.fund(new PublicKey(address).toBase58(), 0n);
    return;
  }
  const keys = demoKeys();
  const mint = env().PAYFIX_MINT;
  if (!keys?.treasury || !mint) return;
  const owner = new PublicKey(address);
  const mintPk = new PublicKey(mint);
  const conn = connection();
  if (await conn.getAccountInfo(ata(mintPk, owner))) return;
  const tx = new Transaction().add(createAssociatedTokenAccountIdempotentInstruction(keys.treasury.publicKey, ata(mintPk, owner), owner, mintPk));
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = keys.treasury.publicKey;
  tx.sign(keys.treasury);
  const signature = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
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

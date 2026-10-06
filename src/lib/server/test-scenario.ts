// Test helper (not a test): the README's demo scenario, end to end, for tests that need a
// company with real history — $1,100 received, $1,000 to A, $60 to B, $40 refunded.
import bs58 from "bs58";
import nacl from "tweetnacl";
import { Keypair, Transaction } from "@solana/web3.js";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { cases, type DestinationProof } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { toUnits } from "@/lib/money";
import { destinationProofMessage } from "@/lib/solana/proof";
import { syncBusiness } from "./ingest";
import { createCustomer, createInvoice, createPaymentRequest } from "./invoices";
import { prepareRefund, reconcileRefund, submitSignedRefund } from "./refunds";
import { approveProposal, executePlan, submitProposal } from "./resolution";
import { SimChain } from "./sim-chain";
import { createWorkspace, findOrCreateUser } from "./workspaces";

function proof(caseId: string, wallet: Keypair): DestinationProof {
  const message = destinationProofMessage({ caseId, destination: wallet.publicKey.toBase58(), nonce: "n1" });
  const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), wallet.secretKey));
  return { method: "wallet_signature", message, signature, verifiedAt: new Date().toISOString() };
}

export async function runDemoScenario(db: Db, opts: { ownerEmail?: string; chain?: SimChain } = {}) {
  const $ = toUnits;
  const chain = opts.chain ?? new SimChain(env().PAYFIX_MINT!);
  const merchant = Keypair.generate();
  const payer = Keypair.generate();
  const walletA = Keypair.generate();
  const walletB = Keypair.generate();
  chain.fund(payer.publicKey.toBase58(), $("5000"));
  const deps = { db, chain };

  const owner = await findOrCreateUser(db, opts.ownerEmail ?? "owner@lumen.test");
  const businessId = await createWorkspace(db, { userId: owner.id, email: owner.email, name: "Lumen Studio", wallet: { address: merchant.publicKey.toBase58(), label: "Main" } });
  const customerId = await createCustomer(db, { businessId, name: "Acme Robotics", email: "ap@acme.test" });
  const due = new Date(Date.now() + 7 * 864e5);
  const invA = (await createInvoice(db, { businessId, customerId, title: "Brand identity", amount: $("1000"), dueAt: due })).id;
  const invB = (await createInvoice(db, { businessId, customerId, title: "Website retainer", amount: $("400"), dueAt: due })).id;

  const req = await createPaymentRequest(db, { invoiceId: invA, amount: null });
  for (const amount of ["600", "500"]) chain.transfer({ from: payer.publicKey.toBase58(), to: merchant.publicKey.toBase58(), amount: $(amount), reference: req.reference });
  await syncBusiness(deps, businessId);
  const [c] = await db.select().from(cases).where(eq(cases.businessId, businessId));

  const lines = [
    { type: "invoice" as const, invoiceId: invB, amount: "60" },
    { type: "refund" as const, amount: "40" },
  ];
  const v1 = await submitProposal(db, { caseId: c.id, customerId, lines, refundDestination: walletA.publicKey.toBase58(), destinationProof: proof(c.id, walletA) });
  await approveProposal(db, { businessId, caseId: c.id, proposalId: v1.proposalId, approvedBy: owner.email });
  const v2 = await submitProposal(db, { caseId: c.id, customerId, lines, refundDestination: walletB.publicKey.toBase58(), destinationProof: proof(c.id, walletB) });
  await approveProposal(db, { businessId, caseId: c.id, proposalId: v2.proposalId, approvedBy: owner.email });
  const { refundId } = await executePlan(db, { businessId, caseId: c.id });

  const { attemptId, transaction } = await prepareRefund(deps, { businessId, refundId: refundId! });
  const tx = Transaction.from(Buffer.from(transaction, "base64"));
  tx.partialSign(merchant);
  await submitSignedRefund(deps, { businessId, attemptId, signedTransaction: tx.serialize().toString("base64") });
  await reconcileRefund(deps, refundId!);
  await syncBusiness(deps, businessId);

  return { chain, businessId, ownerId: owner.id, customerId, caseId: c.id, invA, invB, merchant, payer, reference: req.reference };
}

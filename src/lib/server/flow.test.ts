import bs58 from "bs58";
import nacl from "tweetnacl";
import { beforeAll, describe, expect, it } from "vitest";
import { Keypair, Transaction } from "@solana/web3.js";
import { eq } from "drizzle-orm";
import { openPglite, type Db } from "@/lib/db/client";
import { businesses, cases, refunds, type DestinationProof } from "@/lib/db/schema";
import { toUnits } from "@/lib/money";
import { destinationProofMessage } from "@/lib/solana/proof";
import { newId } from "@/lib/ids";
import { SimChain } from "./sim-chain";
import { syncBusiness } from "./ingest";
import { createCustomer, createInvoice, createPaymentRequest } from "./invoices";
import { businessBalances, caseAvailable, invoiceWithBalance } from "./queries";
import { approveProposal, executePlan, findLink, sendResolutionLink, submitProposal } from "./resolution";
import { prepareRefund, reconcileRefund, submitSignedRefund } from "./refunds";
import { sendCode, verifyCode } from "./auth";
import { addWallet, listWallets, removeWallet } from "./wallets";
import { outbox } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

const $ = (s: string) => toUnits(s);

function proof(caseId: string, wallet: Keypair): DestinationProof {
  const message = destinationProofMessage({ caseId, destination: wallet.publicKey.toBase58(), nonce: "n1" });
  const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), wallet.secretKey));
  return { method: "wallet_signature", message, signature, verifiedAt: new Date().toISOString() };
}

describe("the demo scenario, end to end", () => {
  let db: Db;
  let chain: SimChain;
  const merchant = Keypair.generate();
  const payer = Keypair.generate();
  const refundWalletA = Keypair.generate();
  const refundWalletB = Keypair.generate();
  const mint = Keypair.generate().publicKey.toBase58();
  const businessId = "biz_test";
  let customerId: string;
  let invA: string;
  let invB: string;
  let caseId: string;
  let refundId: string;
  const deps = () => ({ db, chain });

  beforeAll(async () => {
    db = await openPglite();
    chain = new SimChain(mint);
    chain.fund(payer.publicKey.toBase58(), $("5000"));
    chain.fund(merchant.publicKey.toBase58(), $("0"));
    await db.insert(businesses).values({ id: businessId, name: "Lumen Studio", ownerEmail: "owner@lumen.test", walletAddress: merchant.publicKey.toBase58(), mint });
    customerId = await createCustomer(db, { businessId, name: "Acme Robotics", email: "ap@acme.test" });
    const due = new Date(Date.now() + 7 * 864e5);
    invA = (await createInvoice(db, { businessId, customerId, title: "Brand identity", amount: $("1000"), dueAt: due })).id;
    invB = (await createInvoice(db, { businessId, customerId, title: "Website retainer", amount: $("400"), dueAt: due })).id;
  });

  it("tracks $600 then $500 against a $1,000 invoice, leaving $100 excess", async () => {
    const req = await createPaymentRequest(db, { invoiceId: invA, amount: null });
    chain.transfer({ from: payer.publicKey.toBase58(), to: merchant.publicKey.toBase58(), amount: $("600"), reference: req.reference });
    await syncBusiness(deps(), businessId);
    expect((await invoiceWithBalance(db, invA))!.remaining).toBe($("400"));

    chain.transfer({ from: payer.publicKey.toBase58(), to: merchant.publicKey.toBase58(), amount: $("500"), reference: req.reference });
    await syncBusiness(deps(), businessId);

    const a = (await invoiceWithBalance(db, invA))!;
    expect(a.applied).toBe($("1000"));
    expect(a.remaining).toBe(0n);
    const [c] = await db.select().from(cases).where(eq(cases.businessId, businessId));
    caseId = c.id;
    expect(c.kind).toBe("overpayment");
    expect(await caseAvailable(db, caseId)).toBe($("100"));
  });

  it("never double-counts when the same transfers are processed again", async () => {
    const before = await businessBalances(db, businessId);
    await syncBusiness(deps(), businessId);
    await syncBusiness(deps(), businessId);
    const after = await businessBalances(db, businessId);
    expect(after).toEqual(before);
    expect(after.received).toBe($("1100"));
  });

  it("only lets the invoice customer propose, and only with a proven refund wallet", async () => {
    const other = await createCustomer(db, { businessId, name: "Other Co", email: "other@x.test" });
    const lines = [
      { type: "invoice" as const, invoiceId: invB, amount: "60" },
      { type: "refund" as const, amount: "40" },
    ];
    await expect(
      submitProposal(db, { caseId, customerId: other, lines, refundDestination: refundWalletA.publicKey.toBase58(), destinationProof: proof(caseId, refundWalletA) }),
    ).rejects.toThrow(/can't change/);
    // A signature from a different wallet doesn't prove control of the destination.
    await expect(
      submitProposal(db, { caseId, customerId, lines, refundDestination: refundWalletA.publicKey.toBase58(), destinationProof: proof(caseId, refundWalletB) }),
    ).rejects.toThrow(/Confirm the refund wallet/);
    // Can't allocate more than the excess.
    await expect(
      submitProposal(db, {
        caseId,
        customerId,
        lines: [{ type: "refund", amount: "150" }],
        refundDestination: refundWalletA.publicKey.toBase58(),
        destinationProof: proof(caseId, refundWalletA),
      }),
    ).rejects.toThrow(/more than/);
  });

  it("verifies the customer by email code before a session exists", async () => {
    const url = await sendResolutionLink(db, { businessId, caseId });
    const token = url.split("/r/")[1];
    const found = await findLink(db, token);
    expect(found.ok).toBe(true);
    expect((await findLink(db, "not-a-token")).ok).toBe(false);

    await sendCode(db, { purpose: "customer", subjectId: customerId, email: "ap@acme.test" });
    const [mail] = await db.select().from(outbox).orderBy(desc(outbox.createdAt)).limit(1);
    expect((await verifyCode(db, { purpose: "customer", subjectId: customerId, code: "000000" === mail.code ? "111111" : "000000" })).ok).toBe(false);
    expect((await verifyCode(db, { purpose: "customer", subjectId: customerId, code: mail.code! })).ok).toBe(true);
  });

  it("invalidates an approval when the refund destination changes", async () => {
    const lines = [
      { type: "invoice" as const, invoiceId: invB, amount: "60" },
      { type: "refund" as const, amount: "40" },
    ];
    const v1 = await submitProposal(db, {
      caseId,
      customerId,
      lines,
      refundDestination: refundWalletA.publicKey.toBase58(),
      destinationProof: proof(caseId, refundWalletA),
    });
    await approveProposal(db, { businessId, caseId, proposalId: v1.proposalId, approvedBy: "owner@lumen.test" });

    const v2 = await submitProposal(db, {
      caseId,
      customerId,
      lines,
      refundDestination: refundWalletB.publicKey.toBase58(),
      destinationProof: proof(caseId, refundWalletB),
    });
    expect(v2.version).toBe(2);
    expect(v2.hash).not.toBe(v1.hash);
    await expect(executePlan(db, { businessId, caseId })).rejects.toThrow(/needs an approval/);
    await expect(approveProposal(db, { businessId, caseId, proposalId: v1.proposalId, approvedBy: "owner@lumen.test" })).rejects.toThrow(/newer version/);

    await approveProposal(db, { businessId, caseId, proposalId: v2.proposalId, approvedBy: "owner@lumen.test" });
    const res = await executePlan(db, { businessId, caseId });
    refundId = res.refundId!;
    expect(refundId).toBeTruthy();
    await expect(executePlan(db, { businessId, caseId })).rejects.toThrow();

    expect((await invoiceWithBalance(db, invB))!.remaining).toBe($("340"));
    const b = await businessBalances(db, businessId);
    expect(b.refund_pending).toBe($("40"));
    expect(b.refunded).toBe(0n);
    expect(b.unresolved).toBe(0n);
  });

  it("allows one in-flight refund, confirms it once, and reconciles every dollar", async () => {
    const { attemptId, transaction } = await prepareRefund(deps(), { businessId, refundId });
    const tx = Transaction.from(Buffer.from(transaction, "base64"));
    tx.partialSign(merchant);
    const signed = tx.serialize().toString("base64");

    // A tampered transaction (different signer/message) is rejected.
    const forged = Transaction.from(Buffer.from(transaction, "base64"));
    forged.instructions[1].data[1] = 99;
    await expect(submitSignedRefund(deps(), { businessId, attemptId, signedTransaction: forged.serialize({ requireAllSignatures: false }).toString("base64") })).rejects.toThrow(
      /doesn't match/,
    );

    await submitSignedRefund(deps(), { businessId, attemptId, signedTransaction: signed });
    await expect(submitSignedRefund(deps(), { businessId, attemptId, signedTransaction: signed })).rejects.toThrow(/already submitted/);

    expect(await reconcileRefund(deps(), refundId)).toBe("confirmed");
    expect(await reconcileRefund(deps(), refundId)).toBe("confirmed");
    await expect(prepareRefund(deps(), { businessId, refundId })).rejects.toThrow(/already confirmed/);
    expect(chain.balance(refundWalletB.publicKey.toBase58())).toBe($("40"));

    await syncBusiness(deps(), businessId); // the outgoing transfer is observed but not re-posted
    const b = await businessBalances(db, businessId);
    expect(b.received).toBe($("1100"));
    expect(b.invoice).toBe($("1060"));
    expect(b.refunded).toBe($("40"));
    expect(b.refund_pending).toBe(0n);
    expect(b.unresolved).toBe(0n);
    expect(b.invoice + b.credit + b.refunded + b.refund_pending + b.unresolved).toBe(b.received);
    const [c] = await db.select().from(cases).where(eq(cases.id, caseId));
    expect(c.status).toBe("resolved");
  });

  it("treats an expired, never-landed refund as safe to retry — but not before expiry", async () => {
    // New case: the same payer sends $1,000 to a settled invoice → apparent duplicate.
    const invC = (await createInvoice(db, { businessId, customerId, title: "Photo shoot", amount: $("1000"), dueAt: new Date(Date.now() + 864e5) })).id;
    const req = await createPaymentRequest(db, { invoiceId: invC, amount: $("1000") });
    chain.transfer({ from: payer.publicKey.toBase58(), to: merchant.publicKey.toBase58(), amount: $("1000"), reference: req.reference });
    chain.transfer({ from: payer.publicKey.toBase58(), to: merchant.publicKey.toBase58(), amount: $("1000"), reference: req.reference });
    await syncBusiness(deps(), businessId);
    const dup = (await db.select().from(cases).where(eq(cases.invoiceId, invC)))[0];
    expect(dup.kind).toBe("duplicate");

    const v1 = await submitProposal(db, {
      caseId: dup.id,
      customerId,
      lines: [{ type: "refund", amount: "1000" }],
      refundDestination: refundWalletA.publicKey.toBase58(),
      destinationProof: proof(dup.id, refundWalletA),
    });
    await approveProposal(db, { businessId, caseId: dup.id, proposalId: v1.proposalId, approvedBy: "owner@lumen.test" });
    const { refundId: rid } = await executePlan(db, { businessId, caseId: dup.id });

    const first = await prepareRefund(deps(), { businessId, refundId: rid! });
    const tx = Transaction.from(Buffer.from(first.transaction, "base64"));
    tx.partialSign(merchant);
    chain.dropNextBroadcast = true;
    await submitSignedRefund(deps(), { businessId, attemptId: first.attemptId, signedTransaction: tx.serialize().toString("base64") });

    expect(await reconcileRefund(deps(), rid!)).toBe("submitted");
    await expect(prepareRefund(deps(), { businessId, refundId: rid! })).rejects.toThrow(/in flight/);

    chain.height += 200; // blockhash expired; the dropped transaction can never land now
    expect(await reconcileRefund(deps(), rid!)).toBe("awaiting_signature");
    const retry = await prepareRefund(deps(), { businessId, refundId: rid! });
    expect(retry.attemptId).not.toBe(first.attemptId);

    const [r] = await db.select().from(refunds).where(eq(refunds.id, rid!));
    expect(r.status).toBe("awaiting_signature");
    const b = await businessBalances(db, businessId);
    expect(b.refund_pending).toBe($("1000")); // still reserved and visibly incomplete
  });

  it("parks transfers without a reference as unmatched", async () => {
    chain.transfer({ from: payer.publicKey.toBase58(), to: merchant.publicKey.toBase58(), amount: $("25") });
    await syncBusiness(deps(), businessId);
    const unmatched = (await db.select().from(cases).where(eq(cases.kind, "unmatched")))[0];
    expect(unmatched).toBeTruthy();
    expect(unmatched.customerId).toBeNull();
    expect(await caseAvailable(db, unmatched.id)).toBe($("25"));
    void newId;
  });

  it("keeps watching earlier wallets and refunds from the wallet that received the money", async () => {
    const second = Keypair.generate();
    await addWallet(db, { businessId, address: second.publicKey.toBase58(), label: "MetaMask", makeActive: true });
    const wallets = await listWallets(db, businessId);
    expect(wallets.map((w) => [w.label, w.active])).toEqual([
      ["MetaMask", true],
      ["Primary wallet", false],
    ]);

    const invD = (await createInvoice(db, { businessId, customerId, title: "Retainer", amount: $("100"), dueAt: new Date(Date.now() + 864e5) })).id;
    const req = await createPaymentRequest(db, { invoiceId: invD, amount: null });
    expect(req.url).toContain(`solana:${second.publicKey.toBase58()}?`);

    // One payment lands in the new active wallet, one through an older link into the first wallet.
    chain.transfer({ from: payer.publicKey.toBase58(), to: second.publicKey.toBase58(), amount: $("90"), reference: req.reference });
    chain.transfer({ from: payer.publicKey.toBase58(), to: merchant.publicKey.toBase58(), amount: $("60"), reference: req.reference });
    await syncBusiness(deps(), businessId);
    expect((await invoiceWithBalance(db, invD))!.applied).toBe($("100"));

    const overpaid = (await db.select().from(cases).where(eq(cases.invoiceId, invD)))[0];
    expect(await caseAvailable(db, overpaid.id)).toBe($("50"));
    const v1 = await submitProposal(db, {
      caseId: overpaid.id,
      customerId,
      lines: [{ type: "refund", amount: "50" }],
      refundDestination: refundWalletA.publicKey.toBase58(),
      destinationProof: proof(overpaid.id, refundWalletA),
    });
    await approveProposal(db, { businessId, caseId: overpaid.id, proposalId: v1.proposalId, approvedBy: "owner@lumen.test" });
    const { refundId: rid } = await executePlan(db, { businessId, caseId: overpaid.id });
    const [refund] = await db.select().from(refunds).where(eq(refunds.id, rid!));
    expect(refund.sourceWallet).toBe(merchant.publicKey.toBase58()); // the $60 payment carried the excess

    const before = chain.balance(merchant.publicKey.toBase58());
    const prep = await prepareRefund(deps(), { businessId, refundId: rid! });
    const tx = Transaction.from(Buffer.from(prep.transaction, "base64"));
    expect(tx.feePayer?.toBase58()).toBe(merchant.publicKey.toBase58());
    tx.partialSign(merchant);
    await submitSignedRefund(deps(), { businessId, attemptId: prep.attemptId, signedTransaction: tx.serialize().toString("base64") });
    expect(await reconcileRefund(deps(), rid!)).toBe("confirmed");
    expect(chain.balance(merchant.publicKey.toBase58())).toBe(before - $("50"));

    await expect(removeWallet(db, { businessId, address: second.publicKey.toBase58() })).rejects.toThrow(/active/);
    await expect(removeWallet(db, { businessId, address: merchant.publicKey.toBase58() })).rejects.toThrow(/received payments/);
  });
});

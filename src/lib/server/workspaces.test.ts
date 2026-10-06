import bs58 from "bs58";
import nacl from "tweetnacl";
import { beforeAll, describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { eq } from "drizzle-orm";
import { openPglite, type Db } from "@/lib/db/client";
import { approvals, cases, invoices, proposals, transfers, type DestinationProof } from "@/lib/db/schema";
import { toUnits } from "@/lib/money";
import { can } from "@/lib/roles";
import { destinationProofMessage } from "@/lib/solana/proof";
import { applyCredit } from "./credit";
import { syncBusiness } from "./ingest";
import { createInvoice, createPaymentRequest } from "./invoices";
import { businessBalances, caseAvailable, customerCredit, invoiceWithBalance } from "./queries";
import { approveProposal, executePlan, requestChanges, submitProposal } from "./resolution";
import { SimChain } from "./sim-chain";
import {
  addMember,
  clearWorkspaceData,
  createWorkspace,
  findOrCreateUser,
  listMembers,
  listWorkspaces,
  membershipRole,
  removeMember,
  seedSampleData,
  setMemberRole,
} from "./workspaces";

const $ = (s: string) => toUnits(s);
const env = { mint: "" };

function proof(caseId: string, wallet: Keypair): DestinationProof {
  const message = destinationProofMessage({ caseId, destination: wallet.publicKey.toBase58(), nonce: "n1" });
  const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), wallet.secretKey));
  return { method: "wallet_signature", message, signature, verifiedAt: new Date().toISOString() };
}

describe("companies, members, and isolation", () => {
  let db: Db;
  let chain: SimChain;
  const payer = Keypair.generate();
  const walletA = Keypair.generate();
  const walletB = Keypair.generate();
  let bizA: string;
  let bizB: string;
  let owner: Awaited<ReturnType<typeof findOrCreateUser>>;

  beforeAll(async () => {
    db = await openPglite();
    const { env: getEnv } = await import("@/lib/env");
    env.mint = getEnv().PAYFIX_MINT!;
    chain = new SimChain(env.mint);
    chain.fund(payer.publicKey.toBase58(), $("10000"));
    owner = await findOrCreateUser(db, "Owner@Lumen.test");
    bizA = await createWorkspace(db, { userId: owner.id, email: owner.email, name: "Lumen Studio", wallet: { address: walletA.publicKey.toBase58(), label: "Main" } });
    const other = await findOrCreateUser(db, "someone@else.test");
    bizB = await createWorkspace(db, { userId: other.id, email: other.email, name: "Other Co", wallet: { address: walletB.publicKey.toBase58(), label: "Main" } });
    await seedSampleData(db, bizA);
    await seedSampleData(db, bizB);
  });

  it("gives each user only their own companies, with roles", async () => {
    expect(owner.email).toBe("owner@lumen.test");
    expect(await listWorkspaces(db, owner.id)).toEqual([{ businessId: bizA, name: "Lumen Studio", role: "owner", suspended: false }]);
    expect(await membershipRole(db, owner.id, bizB)).toBeNull();
    expect(can("viewer", "editor")).toBe(false);
    expect(can("editor", "editor")).toBe(true);
    expect(can("owner", "viewer")).toBe(true);
    expect(can(null, "viewer")).toBe(false);
  });

  it("manages the team and never leaves a company without an owner", async () => {
    await addMember(db, { businessId: bizA, email: "viewer@lumen.test", role: "viewer", invitedBy: owner.email });
    await expect(addMember(db, { businessId: bizA, email: "viewer@lumen.test", role: "editor", invitedBy: owner.email })).rejects.toThrow(/already/);
    const viewer = (await listMembers(db, bizA)).find((m) => m.email === "viewer@lumen.test")!;
    expect(viewer.role).toBe("viewer");
    await expect(setMemberRole(db, { businessId: bizA, userId: owner.id, role: "editor" })).rejects.toThrow(/at least one owner/);
    await expect(removeMember(db, { businessId: bizA, userId: owner.id })).rejects.toThrow(/at least one owner/);
    await setMemberRole(db, { businessId: bizA, userId: viewer.userId, role: "owner" });
    await setMemberRole(db, { businessId: bizA, userId: owner.id, role: "editor" }); // allowed now: another owner exists
    await setMemberRole(db, { businessId: bizA, userId: owner.id, role: "owner" });
    await removeMember(db, { businessId: bizA, userId: viewer.userId });
    expect((await listMembers(db, bizA)).map((m) => m.email)).toEqual(["owner@lumen.test"]);
  });

  it("never matches one company's payment reference inside another company", async () => {
    const [invA] = await db.select().from(invoices).where(eq(invoices.businessId, bizA));
    const req = await createPaymentRequest(db, { invoiceId: invA.id, amount: null });
    // A transfer into company B's wallet that (wrongly) carries company A's reference.
    chain.transfer({ from: payer.publicKey.toBase58(), to: walletB.publicKey.toBase58(), amount: $("50"), reference: req.reference });
    await syncBusiness({ db, chain }, bizA);
    await syncBusiness({ db, chain }, bizB);
    expect((await invoiceWithBalance(db, invA.id))!.applied).toBe(0n);
    const [tB] = await db.select().from(transfers).where(eq(transfers.businessId, bizB));
    expect(tB.invoiceId).toBeNull(); // parked as unmatched in B, not credited to A's invoice
    expect(await db.select().from(transfers).where(eq(transfers.businessId, bizA))).toHaveLength(0);
  });

  it("asks for changes, voids the approval, and accepts a revised version", async () => {
    const [invA, invB] = (await db.select().from(invoices).where(eq(invoices.businessId, bizA))).sort((a, b) => a.number.localeCompare(b.number));
    const req = await createPaymentRequest(db, { invoiceId: invA.id, amount: null });
    chain.transfer({ from: payer.publicKey.toBase58(), to: walletA.publicKey.toBase58(), amount: $("1100"), reference: req.reference });
    await syncBusiness({ db, chain }, bizA);
    const [kase] = await db.select().from(cases).where(eq(cases.invoiceId, invA.id));
    expect(await caseAvailable(db, kase.id)).toBe($("100"));

    const refundTo = Keypair.generate();
    const v1 = await submitProposal(db, {
      caseId: kase.id,
      customerId: invA.customerId,
      lines: [{ type: "refund", amount: "100" }],
      refundDestination: refundTo.publicKey.toBase58(),
      destinationProof: proof(kase.id, refundTo),
    });
    await approveProposal(db, { businessId: bizA, caseId: kase.id, proposalId: v1.proposalId, approvedBy: owner.email });
    await expect(requestChanges(db, { businessId: bizB, caseId: kase.id, proposalId: v1.proposalId, note: "nope" })).rejects.toThrow(/not found/);
    await requestChanges(db, { businessId: bizA, caseId: kase.id, proposalId: v1.proposalId, note: "Please keep $40 as credit." });

    const [p1] = await db.select().from(proposals).where(eq(proposals.id, v1.proposalId));
    expect(p1.status).toBe("declined");
    expect(p1.businessNote).toBe("Please keep $40 as credit.");
    const [a1] = await db.select().from(approvals).where(eq(approvals.proposalId, v1.proposalId));
    expect(a1.invalidatedAt).not.toBeNull();
    await expect(executePlan(db, { businessId: bizA, caseId: kase.id })).rejects.toThrow(/needs an approval/);

    const v2 = await submitProposal(db, {
      caseId: kase.id,
      customerId: invA.customerId,
      lines: [
        { type: "invoice", invoiceId: invB.id, amount: "60" },
        { type: "credit", amount: "40" },
      ],
      refundDestination: null,
      destinationProof: null,
    });
    await approveProposal(db, { businessId: bizA, caseId: kase.id, proposalId: v2.proposalId, approvedBy: owner.email });
    expect((await executePlan(db, { businessId: bizA, caseId: kase.id })).refundId).toBeNull();
    expect(await customerCredit(db, invA.customerId)).toBe($("40"));
  });

  it("applies customer credit once, never past the invoice or the credit", async () => {
    const [, invB] = (await db.select().from(invoices).where(eq(invoices.businessId, bizA))).sort((a, b) => a.number.localeCompare(b.number));
    const before = (await invoiceWithBalance(db, invB.id))!.remaining; // $340 after the $60 allocation
    expect(before).toBe($("340"));
    const results = await Promise.allSettled([applyCredit(db, { businessId: bizA, invoiceId: invB.id }), applyCredit(db, { businessId: bizA, invoiceId: invB.id })]);
    const applied = results.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<{ applied: bigint }>).value.applied);
    expect(applied.reduce((a, b) => a + b, 0n)).toBe($("40")); // double click spends the $40 exactly once
    expect((await invoiceWithBalance(db, invB.id))!.remaining).toBe($("300"));
    expect(await customerCredit(db, invB.customerId)).toBe(0n);
    await expect(applyCredit(db, { businessId: bizB, invoiceId: invB.id })).rejects.toThrow(/not found/);
    const b = await businessBalances(db, bizA);
    expect(b.invoice + b.credit + b.refunded + b.refund_pending + b.unresolved).toBe(b.received);
  });

  it("resets one company without touching another", async () => {
    const otherBefore = await db.select().from(transfers).where(eq(transfers.businessId, bizB));
    await clearWorkspaceData(db, bizA);
    expect(await db.select().from(invoices).where(eq(invoices.businessId, bizA))).toHaveLength(0);
    expect(await db.select().from(transfers).where(eq(transfers.businessId, bizA))).toHaveLength(0);
    expect(await db.select().from(transfers).where(eq(transfers.businessId, bizB))).toEqual(otherBefore);
    expect(await db.select().from(invoices).where(eq(invoices.businessId, bizB))).toHaveLength(2);
    expect((await listMembers(db, bizA)).length).toBe(1); // team survives a reset
    await syncBusiness({ db, chain }, bizA); // old chain history isn't re-ingested
    expect(await db.select().from(transfers).where(eq(transfers.businessId, bizA))).toHaveLength(0);
  });

  it("marks seeded invoices as sample data, and only those", async () => {
    const seeded = await db.select().from(invoices).where(eq(invoices.businessId, bizB));
    expect(seeded.map((i) => i.sample)).toEqual([true, true]);
    const own = await createInvoice(db, { businessId: bizB, customerId: seeded[0].customerId, title: "Real work", amount: $("10"), dueAt: new Date() });
    const [row] = await db.select().from(invoices).where(eq(invoices.id, own.id));
    expect(row.sample).toBe(false);
  });
});

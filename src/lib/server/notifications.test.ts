import { beforeAll, describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { and, eq } from "drizzle-orm";
import { openPglite, type Db } from "@/lib/db/client";
import { businessWallets, cases, customers, events, notificationReads } from "@/lib/db/schema";
import { toUnits } from "@/lib/money";
import { applyCredit } from "./credit";
import { syncBusiness } from "./ingest";
import { createCustomer, createInvoice, createPaymentRequest, flagOverdueInvoices } from "./invoices";
import { logEvent } from "./journal";
import { approveProposal, executePlan, submitProposal } from "./resolution";
import { removeWallet } from "./wallets";
import { SimChain } from "./sim-chain";
import { addMember, clearWorkspaceData, createWorkspace, findOrCreateUser, listMembers, removeMember, seedSampleData, setMemberRole } from "./workspaces";

const $ = (s: string) => toUnits(s);

async function company(db: Db, email: string, name: string) {
  const user = await findOrCreateUser(db, email);
  const wallet = Keypair.generate();
  const businessId = await createWorkspace(db, { userId: user.id, email: user.email, name, wallet: { address: wallet.publicKey.toBase58(), label: "Main" } });
  return { user, wallet, businessId };
}

describe("notifications", () => {
  let db: Db;
  let chain: SimChain;
  const payer = Keypair.generate();
  let a: Awaited<ReturnType<typeof company>>;
  let b: Awaited<ReturnType<typeof company>>;
  let editorId: string;

  beforeAll(async () => {
    db = await openPglite();
    const { env } = await import("@/lib/env");
    chain = new SimChain(env().PAYFIX_MINT!);
    chain.fund(payer.publicKey.toBase58(), $("100000"));
    a = await company(db, "owner@lumen.test", "Lumen Studio");
    b = await company(db, "someone@else.test", "Other Co");
    await seedSampleData(db, a.businessId);
    await addMember(db, { businessId: a.businessId, email: "editor@lumen.test", role: "editor", invitedBy: a.user.email });
    editorId = (await listMembers(db, a.businessId)).find((m) => m.email === "editor@lumen.test")!.userId;
  });

  it("logEvent dedupes by key", async () => {
    const e = { businessId: a.businessId, actor: "system" as const, type: "invoice.overdue", message: "x", dedupeKey: "x:1" };
    expect(await logEvent(db, e)).toBe(true);
    expect(await logEvent(db, e)).toBe(false);
    const rows = await db.select().from(events).where(and(eq(events.businessId, a.businessId), eq(events.dedupeKey, "x:1")));
    expect(rows).toHaveLength(1);
  });

  const ofType = async (type: string, where: { invoiceId?: string; businessId?: string } = {}) =>
    (await db.select().from(events).where(eq(events.type, type))).filter(
      (e) => (!where.invoiceId || e.invoiceId === where.invoiceId) && e.businessId === (where.businessId ?? a.businessId),
    );
  const acme = async () => (await db.select().from(customers).where(and(eq(customers.businessId, a.businessId), eq(customers.email, "ap@acme.test"))))[0];
  const pay = async (invoiceId: string, amount: string) => {
    const req = await createPaymentRequest(db, { invoiceId, amount: null });
    chain.transfer({ from: payer.publicKey.toBase58(), to: a.wallet.publicKey.toBase58(), amount: $(amount), reference: req.reference });
    await syncBusiness({ db, chain }, a.businessId);
  };

  it("logs invoice.paid once, on the payment that settles the invoice", async () => {
    const inv = await createInvoice(db, { businessId: a.businessId, customerId: (await acme()).id, title: "Paid in two", amount: $("100"), dueAt: new Date(Date.now() + 864e5) });
    await pay(inv.id, "40");
    expect(await ofType("invoice.paid", { invoiceId: inv.id })).toHaveLength(0);
    await pay(inv.id, "60");
    const paid = await ofType("invoice.paid", { invoiceId: inv.id });
    expect(paid).toHaveLength(1);
    expect(paid[0].message).toBe(`${inv.number} is paid in full`);
    await syncBusiness({ db, chain }, a.businessId);
    expect(await ofType("invoice.paid", { invoiceId: inv.id })).toHaveLength(1);
  });

  it("logs invoice.paid and case.resolved when a plan settles an invoice, and when credit settles one", async () => {
    const customerId = (await acme()).id;
    const x = await createInvoice(db, { businessId: a.businessId, customerId, title: "Overpaid", amount: $("100"), dueAt: new Date(Date.now() + 864e5) });
    const y = await createInvoice(db, { businessId: a.businessId, customerId, title: "Covered by plan", amount: $("20"), dueAt: new Date(Date.now() + 864e5) });
    await pay(x.id, "130");
    expect(await ofType("invoice.paid", { invoiceId: x.id })).toHaveLength(1); // overpayment still settles it
    const [kase] = await db.select().from(cases).where(eq(cases.invoiceId, x.id));
    const v1 = await submitProposal(db, {
      caseId: kase.id,
      customerId,
      lines: [
        { type: "invoice", invoiceId: y.id, amount: "20" },
        { type: "credit", amount: "10" },
      ],
      refundDestination: null,
      destinationProof: null,
    });
    await approveProposal(db, { businessId: a.businessId, caseId: kase.id, proposalId: v1.proposalId, approvedBy: a.user.email });
    await executePlan(db, { businessId: a.businessId, caseId: kase.id, actorUserId: editorId });
    expect(await ofType("invoice.paid", { invoiceId: y.id })).toHaveLength(1);
    const resolved = (await ofType("case.resolved")).filter((e) => e.caseId === kase.id);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].actorUserId).toBe(editorId);

    const z = await createInvoice(db, { businessId: a.businessId, customerId, title: "Covered by credit", amount: $("10"), dueAt: new Date(Date.now() + 864e5) });
    await applyCredit(db, { businessId: a.businessId, invoiceId: z.id, actorUserId: editorId });
    const zPaid = await ofType("invoice.paid", { invoiceId: z.id });
    expect(zPaid).toHaveLength(1);
    expect(zPaid[0].actorUserId).toBe(editorId);
  });

  it("logs invoice.overdue once, only after the due instant and only while unpaid", async () => {
    const customerId = (await acme()).id;
    const due = new Date("2026-01-01T23:59:59Z");
    const late = await createInvoice(db, { businessId: a.businessId, customerId, title: "Late", amount: $("5"), dueAt: due });
    const settled = await createInvoice(db, { businessId: a.businessId, customerId, title: "Paid", amount: $("5"), dueAt: due });
    await pay(settled.id, "5");
    await flagOverdueInvoices(db, a.businessId, new Date("2026-01-01T23:59:58Z"));
    expect(await ofType("invoice.overdue", { invoiceId: late.id })).toHaveLength(0);
    await flagOverdueInvoices(db, a.businessId, new Date("2026-01-02T00:00:00Z"));
    await flagOverdueInvoices(db, a.businessId, new Date("2026-01-03T00:00:00Z"));
    const overdue = await ofType("invoice.overdue", { invoiceId: late.id });
    expect(overdue).toHaveLength(1);
    expect(overdue[0].message).toBe(`${late.number} is overdue: $5.00 remaining`);
    expect(await ofType("invoice.overdue", { invoiceId: settled.id })).toHaveLength(0);
  });

  it("logs customer, team, and wallet changes with the member who made them", async () => {
    await createCustomer(db, { businessId: a.businessId, name: "Globex", email: "ap@globex.test", actorUserId: a.user.id });
    const [cust] = await ofType("customer.created").then((r) => r.filter((e) => e.message.startsWith("Globex")));
    expect(cust.actorUserId).toBe(a.user.id);

    await addMember(db, { businessId: a.businessId, email: "temp@lumen.test", role: "viewer", invitedBy: a.user.email, actorUserId: a.user.id });
    const temp = (await listMembers(db, a.businessId)).find((m) => m.email === "temp@lumen.test")!;
    await setMemberRole(db, { businessId: a.businessId, userId: temp.userId, role: "viewer", actorUserId: a.user.id });
    expect(await ofType("member.role_changed")).toHaveLength(0); // unchanged role, nothing to say
    await setMemberRole(db, { businessId: a.businessId, userId: temp.userId, role: "editor", actorUserId: a.user.id });
    const [changed] = await ofType("member.role_changed");
    expect(changed.message).toBe("temp@lumen.test is now Editor");
    expect(changed.actorUserId).toBe(a.user.id);
    await removeMember(db, { businessId: a.businessId, userId: temp.userId, actorUserId: a.user.id });
    const [removed] = await ofType("member.removed");
    expect(removed.message).toBe("temp@lumen.test was removed from the team");

    const spare = Keypair.generate().publicKey.toBase58();
    await db.insert(businessWallets).values({ id: "bw_spare", businessId: a.businessId, address: spare, label: "Spare" });
    await removeWallet(db, { businessId: a.businessId, address: spare, actorUserId: a.user.id });
    const [gone] = await ofType("wallet.removed");
    expect(gone.message).toMatch(/^Receiving wallet removed: Spare/);
    expect(gone.actorUserId).toBe(a.user.id);
  });

  it("records who caused an event", async () => {
    await logEvent(db, { businessId: a.businessId, actor: "business", type: "invoice.created", message: "by editor", actorUserId: editorId });
    const [row] = await db.select().from(events).where(eq(events.message, "by editor"));
    expect(row.actorUserId).toBe(editorId);
  });
});

describe("workspace reset with notification state", () => {
  it("reset clears read state", async () => {
    const db = await openPglite();
    const a = await company(db, "reset@lumen.test", "Reset Co");
    await seedSampleData(db, a.businessId);
    const [ev] = await db.select().from(events).where(eq(events.businessId, a.businessId)).limit(1);
    await db.insert(notificationReads).values({ userId: a.user.id, eventId: ev.id });
    await expect(clearWorkspaceData(db, a.businessId)).resolves.toBeUndefined();
    expect(await db.select().from(notificationReads)).toHaveLength(0);
  });
});

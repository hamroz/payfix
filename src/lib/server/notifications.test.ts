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
import { getMuted, listNotifications, markAllRead, markRead, setMuted, unreadCount } from "./notifications";
import { CATEGORIES } from "@/lib/domain/notifications";
import { approveProposal, executePlan, submitProposal } from "./resolution";
import { removeWallet } from "./wallets";
import { SimChain } from "./sim-chain";
import { refreshCompany } from "./sync";
import type { ChainClient } from "./chain";
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
    expect(await ofType("invoice.paid", { businessId: b.businessId })).toHaveLength(0);
  });

  it("doesn't call a duplicate payment 'paid in full' for an invoice settled before notifications existed", async () => {
    const inv = await createInvoice(db, { businessId: a.businessId, customerId: (await acme()).id, title: "Settled long ago", amount: $("30"), dueAt: new Date(Date.now() + 864e5) });
    await pay(inv.id, "30");
    await db.delete(events).where(and(eq(events.type, "invoice.paid"), eq(events.invoiceId, inv.id))); // as if paid before this release
    await pay(inv.id, "30");
    expect(await ofType("invoice.paid", { invoiceId: inv.id })).toHaveLength(0);
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

  it("still flags overdue invoices when the chain can't be reached", async () => {
    const down = new Proxy({} as ChainClient, {
      get: () => () => Promise.reject(new Error("fetch failed")),
    });
    const late = await createInvoice(db, { businessId: a.businessId, customerId: (await acme()).id, title: "Late, chain down", amount: $("7"), dueAt: new Date("2026-02-01T00:00:00Z") });
    await expect(refreshCompany({ db, chain: down }, a.businessId, { checkOverdue: true })).rejects.toThrow(/fetch failed/);
    expect(await ofType("invoice.overdue", { invoiceId: late.id })).toHaveLength(1);
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

describe("notification feed", () => {
  let db: Db;
  let a: Awaited<ReturnType<typeof company>>;
  let b: Awaited<ReturnType<typeof company>>;
  let editorId: string;
  const owner = () => ({ businessId: a.businessId, userId: a.user.id });
  const editor = () => ({ businessId: a.businessId, userId: editorId });
  const log = (type: string, message: string, extra: Partial<Parameters<typeof logEvent>[1]> = {}) =>
    logEvent(db, { businessId: a.businessId, actor: "system", type, message, ...extra });

  beforeAll(async () => {
    db = await openPglite();
    a = await company(db, "owner@feed.test", "Feed Co");
    b = await company(db, "other@feed.test", "Other Feed Co");
    await addMember(db, { businessId: a.businessId, email: "editor@feed.test", role: "editor", invitedBy: a.user.email, actorUserId: a.user.id });
    editorId = (await listMembers(db, a.businessId)).find((m) => m.email === "editor@feed.test")!.userId;
    await log("payment.received", "Acme paid $10", { actor: "system" });
    await log("proposal.submitted", "Customer proposed a plan", { actor: "customer", caseId: null });
    await log("invoice.created", "Editor made an invoice", { actor: "business", actorUserId: editorId });
    await log("something.internal", "Not a notification");
  });

  it("shows every category by default and hides the member's own actions", async () => {
    const ownerFeed = (await listNotifications(db, owner())).map((n) => n.message);
    expect(ownerFeed).toEqual(expect.arrayContaining(["Acme paid $10", "Customer proposed a plan", "Editor made an invoice"]));
    expect(ownerFeed).not.toContain("Not a notification");
    expect(ownerFeed).not.toContain(`editor@feed.test joined as Editor`); // the owner added them
    const editorFeed = (await listNotifications(db, editor())).map((n) => n.message);
    expect(editorFeed).toContain("Acme paid $10");
    expect(editorFeed).toContain("editor@feed.test joined as Editor");
    expect(editorFeed).not.toContain("Editor made an invoice");
    const [first] = await listNotifications(db, owner());
    expect(first).toMatchObject({ read: false, category: expect.any(String), href: expect.stringMatching(/^\/app/) });
  });

  it("links each notification to where it happened", async () => {
    await log("member.removed", "x left", { actor: "business" });
    await log("invoice.overdue", "INV-9 overdue", { invoiceId: null });
    const feed = await listNotifications(db, owner());
    expect(feed.find((n) => n.message === "x left")!.href).toBe("/app/settings");
    expect(feed.find((n) => n.message === "Acme paid $10")!.href).toBe("/app");
  });

  it("hides muted categories and rejects unknown ones", async () => {
    await setMuted(db, { ...owner(), muted: ["payments"] });
    expect(await getMuted(db, owner())).toEqual(["payments"]);
    expect((await listNotifications(db, owner())).map((n) => n.message)).not.toContain("Acme paid $10");
    expect((await listNotifications(db, editor())).map((n) => n.message)).toContain("Acme paid $10"); // personal
    await setMuted(db, { ...owner(), muted: [] });
    expect((await listNotifications(db, owner())).map((n) => n.message)).toContain("Acme paid $10");
    await expect(setMuted(db, { ...owner(), muted: ["bogus"] })).rejects.toThrow(/Unknown notification category/);
  });

  it("shows nothing when every category is muted", async () => {
    await setMuted(db, { ...owner(), muted: CATEGORIES.map((c) => c.id) });
    expect(await listNotifications(db, owner())).toEqual([]);
    expect(await unreadCount(db, owner())).toBe(0);
    await setMuted(db, { ...owner(), muted: [] });
  });

  it("marks one notification read, per member, idempotently", async () => {
    const before = await unreadCount(db, owner());
    const target = (await listNotifications(db, owner())).find((n) => n.message === "Acme paid $10")!;
    await markRead(db, { ...owner(), eventId: target.id });
    await markRead(db, { ...owner(), eventId: target.id });
    expect(await unreadCount(db, owner())).toBe(before - 1);
    expect((await listNotifications(db, owner())).find((n) => n.id === target.id)!.read).toBe(true);
    expect((await listNotifications(db, editor())).find((n) => n.id === target.id)!.read).toBe(false);
  });

  it("marks all read, and newer events are unread again", async () => {
    await markAllRead(db, owner());
    expect(await unreadCount(db, owner())).toBe(0);
    const [any] = await listNotifications(db, owner());
    await markRead(db, { ...owner(), eventId: any.id }); // already covered by the cursor: no error
    await new Promise((r) => setTimeout(r, 5));
    await log("refund.failed", "Refund failed");
    expect(await unreadCount(db, owner())).toBe(1);
    expect((await listNotifications(db, owner()))[0]).toMatchObject({ message: "Refund failed", read: false });
  });

  it("starts members added later with the earlier history already read", async () => {
    await addMember(db, { businessId: a.businessId, email: "late@feed.test", role: "viewer", invitedBy: a.user.email, actorUserId: a.user.id });
    const late = { businessId: a.businessId, userId: (await listMembers(db, a.businessId)).find((m) => m.email === "late@feed.test")!.userId };
    const feed = await listNotifications(db, late);
    expect(feed.find((n) => n.message === "Acme paid $10")).toMatchObject({ read: true });
    expect(await unreadCount(db, late)).toBe(0);
    await new Promise((r) => setTimeout(r, 5));
    await log("refund.expired", "Refund expired after join");
    expect(await unreadCount(db, late)).toBe(1);
  });

  it("keeps companies apart", async () => {
    await expect(listNotifications(db, { businessId: a.businessId, userId: b.user.id })).rejects.toThrow(/not a member/);
    const [ev] = await listNotifications(db, owner());
    await expect(markRead(db, { businessId: b.businessId, userId: b.user.id, eventId: ev.id })).rejects.toThrow(/not found/);
    expect(await listNotifications(db, { businessId: b.businessId, userId: b.user.id })).toEqual([]);
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

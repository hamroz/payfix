import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import type { Db, Executor } from "@/lib/db/client";
import {
  approvals,
  businesses,
  businessWallets,
  caseTransfers,
  cases,
  chainSignatures,
  customers,
  events,
  invoices,
  journalEntries,
  memberships,
  notificationReads,
  outbox,
  paymentRequests,
  postings,
  proposals,
  refundAttempts,
  refunds,
  resolutionLinks,
  transfers,
  users,
  type Role,
} from "@/lib/db/schema";
import { env } from "@/lib/env";
import { newId } from "@/lib/ids";
import { toUnits } from "@/lib/money";
import { roleLabel } from "@/lib/roles";
import { createCustomer, createInvoice, InputError } from "./invoices";
import { deliverOutbox, queueEmail } from "./email";
import { logEvent } from "./journal";

const normalizeEmail = (e: string) => e.trim().toLowerCase();
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function findOrCreateUser(db: Executor, email: string) {
  const e = normalizeEmail(email);
  if (!isEmail(e)) throw new InputError("Enter a valid email address.");
  await db.insert(users).values({ id: newId("usr"), email: e }).onConflictDoNothing();
  const [u] = await db.select().from(users).where(eq(users.email, e));
  return u;
}

export async function userById(db: Executor, id: string) {
  const [u] = await db.select().from(users).where(eq(users.id, id));
  return u ?? null;
}

export type Workspace = { businessId: string; name: string; role: Role };

/** Companies a user belongs to, oldest first. */
export async function listWorkspaces(db: Executor, userId: string): Promise<Workspace[]> {
  const rows = await db
    .select({ businessId: businesses.id, name: businesses.name, role: memberships.role })
    .from(memberships)
    .innerJoin(businesses, eq(businesses.id, memberships.businessId))
    .where(eq(memberships.userId, userId))
    .orderBy(asc(memberships.createdAt));
  return rows;
}

export async function membershipRole(db: Executor, userId: string, businessId: string): Promise<Role | null> {
  const [m] = await db.select({ role: memberships.role }).from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.businessId, businessId)));
  return m?.role ?? null;
}

/** Creates a company with its creator as owner and its first receiving wallet. */
export async function createWorkspace(
  db: Db,
  p: { userId: string; email: string; name: string; wallet: { address: string; label: string; secretEnc?: string | null } },
) {
  const name = p.name.trim();
  if (name.length < 2) throw new InputError("Enter your company name.");
  const mint = env().PAYFIX_MINT;
  if (!mint) throw new InputError("This deployment has no test token configured.");
  const businessId = newId("biz");
  await db.transaction(async (t) => {
    await t.insert(businesses).values({ id: businessId, name, ownerEmail: p.email, walletAddress: p.wallet.address, mint });
    await t.insert(memberships).values({ id: newId("mem"), businessId, userId: p.userId, role: "owner", notificationsReadAt: sql`now()` });
    await t.insert(businessWallets).values({ id: newId("bw"), businessId, address: p.wallet.address, label: p.wallet.label, secretEnc: p.wallet.secretEnc ?? null });
  });
  return businessId;
}

/** The demo script's starting point: a repeat client with a $1,000 and a $400 invoice. */
export async function seedSampleData(db: Db, businessId: string, actorUserId?: string) {
  const acme = await createCustomer(db, { businessId, name: "Acme Robotics", email: "ap@acme.test", actorUserId });
  await createCustomer(db, { businessId, name: "Northwind Coffee", email: "finance@northwind.test", actorUserId });
  const day = 864e5;
  await createInvoice(db, { businessId, customerId: acme, title: "Brand identity system", amount: toUnits("1000"), dueAt: new Date(Date.now() + 10 * day), actorUserId });
  await createInvoice(db, { businessId, customerId: acme, title: "Website retainer — October", amount: toUnits("400"), dueAt: new Date(Date.now() + 21 * day), actorUserId });
}

/** Ignore chain history that predates the workspace (e.g. earlier runs on the same wallet). */
export async function markHistorySeen(db: Db, businessId: string, signatures: string[]) {
  if (signatures.length)
    await db
      .insert(chainSignatures)
      .values(signatures.map((signature) => ({ businessId, signature, relevant: false })))
      .onConflictDoNothing();
}

/**
 * Deletes one company's payments, cases, invoices, customers, and history — never
 * another company's — keeping the company, its team, and its wallets.
 */
export async function clearWorkspaceData(db: Db, businessId: string) {
  await db.transaction(async (t) => {
    const caseIds = (await t.select({ id: cases.id }).from(cases).where(eq(cases.businessId, businessId))).map((r) => r.id);
    const refundIds = (await t.select({ id: refunds.id }).from(refunds).where(eq(refunds.businessId, businessId))).map((r) => r.id);
    const proposalIds = caseIds.length ? (await t.select({ id: proposals.id }).from(proposals).where(inArray(proposals.caseId, caseIds))).map((r) => r.id) : [];
    await t.delete(postings).where(eq(postings.businessId, businessId));
    await t.delete(journalEntries).where(eq(journalEntries.businessId, businessId));
    if (refundIds.length) await t.delete(refundAttempts).where(inArray(refundAttempts.refundId, refundIds));
    await t.delete(refunds).where(eq(refunds.businessId, businessId));
    if (proposalIds.length) await t.delete(approvals).where(inArray(approvals.proposalId, proposalIds));
    if (caseIds.length) {
      await t.delete(proposals).where(inArray(proposals.caseId, caseIds));
      await t.delete(resolutionLinks).where(inArray(resolutionLinks.caseId, caseIds));
      await t.delete(caseTransfers).where(inArray(caseTransfers.caseId, caseIds));
    }
    await t.delete(notificationReads).where(inArray(notificationReads.eventId, t.select({ id: events.id }).from(events).where(eq(events.businessId, businessId))));
    await t.delete(events).where(eq(events.businessId, businessId));
    await t.delete(cases).where(eq(cases.businessId, businessId));
    await t.delete(transfers).where(eq(transfers.businessId, businessId));
    await t.delete(paymentRequests).where(eq(paymentRequests.businessId, businessId));
    await t.delete(invoices).where(eq(invoices.businessId, businessId));
    await t.delete(customers).where(eq(customers.businessId, businessId));
    await t.delete(outbox).where(eq(outbox.businessId, businessId));
    // Keep chain_signatures: those payments happened; re-ingesting them would resurrect old demo data.
    await t.update(chainSignatures).set({ relevant: false }).where(eq(chainSignatures.businessId, businessId));
  });
}

// ── Team ───────────────────────────────────────────────────────────────────

export async function listMembers(db: Executor, businessId: string) {
  return db
    .select({ userId: users.id, email: users.email, role: memberships.role, createdAt: memberships.createdAt })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.businessId, businessId))
    .orderBy(asc(memberships.createdAt));
}

export async function addMember(db: Db, p: { businessId: string; email: string; role: Role; invitedBy: string; actorUserId?: string }) {
  const user = await findOrCreateUser(db, p.email);
  const inserted = await db
    .insert(memberships)
    .values({ id: newId("mem"), businessId: p.businessId, userId: user.id, role: p.role })
    .onConflictDoNothing()
    .returning();
  if (inserted.length === 0) throw new InputError("That person is already on the team.");
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, p.businessId));
  await queueEmail(db, {
    businessId: p.businessId,
    to: user.email,
    subject: `You've been added to ${biz.name} on PayFix`,
    body: `${p.invitedBy} added you as ${p.role}. Sign in with this email address to open the workspace.`,
    link: `${env().APP_URL}/login`,
  });
  await logEvent(db, { businessId: p.businessId, actor: "business", actorUserId: p.actorUserId, type: "member.added", message: `${user.email} joined as ${p.role}` });
  // New members start caught up: earlier history (and their own arrival) is already read.
  await db.update(memberships).set({ notificationsReadAt: sql`now()` }).where(eq(memberships.id, inserted[0].id));
  await deliverOutbox(db);
}

async function ownerCount(db: Executor, businessId: string) {
  const [r] = await db.select({ n: count() }).from(memberships).where(and(eq(memberships.businessId, businessId), eq(memberships.role, "owner")));
  return r?.n ?? 0;
}

export async function setMemberRole(db: Db, p: { businessId: string; userId: string; role: Role; actorUserId?: string }) {
  return db.transaction(async (t) => {
    const [m] = await t.select().from(memberships).where(and(eq(memberships.businessId, p.businessId), eq(memberships.userId, p.userId))).for("update");
    if (!m) throw new InputError("That person isn't on the team.");
    if (m.role === "owner" && p.role !== "owner" && (await ownerCount(t, p.businessId)) <= 1) throw new InputError("A company needs at least one owner.");
    if (m.role === p.role) return;
    await t.update(memberships).set({ role: p.role }).where(eq(memberships.id, m.id));
    const user = await userById(t, p.userId);
    await logEvent(t, {
      businessId: p.businessId,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "member.role_changed",
      message: `${user?.email ?? "A member"} is now ${roleLabel(p.role)}`,
    });
  });
}

export async function removeMember(db: Db, p: { businessId: string; userId: string; actorUserId?: string }) {
  return db.transaction(async (t) => {
    const [m] = await t.select().from(memberships).where(and(eq(memberships.businessId, p.businessId), eq(memberships.userId, p.userId))).for("update");
    if (!m) throw new InputError("That person isn't on the team.");
    if (m.role === "owner" && (await ownerCount(t, p.businessId)) <= 1) throw new InputError("A company needs at least one owner.");
    await t.delete(memberships).where(eq(memberships.id, m.id));
    const user = await userById(t, p.userId);
    await logEvent(t, {
      businessId: p.businessId,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "member.removed",
      message: `${user?.email ?? "A member"} was removed from the team`,
    });
  });
}


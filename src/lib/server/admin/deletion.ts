import { and, eq, inArray } from "drizzle-orm";
import type { Db, Executor } from "@/lib/db/client";
import { businesses, businessWallets, chainSignatures, feedbackResponses, memberships, notificationReads, otpCodes, refunds, sessions, users } from "@/lib/db/schema";
import { confirmMatches } from "@/lib/domain/confirm";
import { InputError } from "../invoices";

export { confirmMatches };
import { purgeCompanyData } from "../workspaces";
import { audit } from "./audit";

// Permanent deletion by a platform admin. Each delete runs in one transaction with its audit row,
// which keeps the id and the name or email so the log still says what was removed.

const IN_FLIGHT = ["awaiting_signature", "submitted"] as const;

function reasonOf(reason: string) {
  const r = reason.trim();
  if (!r || r.length > 500) throw new InputError("reasonRequired");
  return r;
}

async function refundInFlight(db: Executor, businessId: string) {
  const [r] = await db.select({ id: refunds.id }).from(refunds).where(and(eq(refunds.businessId, businessId), inArray(refunds.status, [...IN_FLIGHT]))).limit(1);
  return !!r;
}

/** Removes the company and everything in it. Members keep their accounts. */
async function removeCompany(t: Executor, businessId: string) {
  await purgeCompanyData(t, businessId);
  await t.delete(chainSignatures).where(eq(chainSignatures.businessId, businessId));
  await t.delete(memberships).where(eq(memberships.businessId, businessId));
  await t.delete(businessWallets).where(eq(businessWallets.businessId, businessId));
  await t.delete(businesses).where(eq(businesses.id, businessId));
}

/**
 * Permanently deletes a company: customers, invoices, payments, exceptions, ledger, wallets
 * (including demo keys), memberships, its emails and activity. Refused while a refund is in
 * flight, because money would be moving with no record left to reconcile it against.
 */
export async function deleteCompany(db: Db, admin: string, businessId: string, reason: string) {
  const r = reasonOf(reason);
  const [biz] = await db.select({ id: businesses.id, name: businesses.name }).from(businesses).where(eq(businesses.id, businessId));
  if (!biz) throw new InputError("adminTargetMissing");
  if (await refundInFlight(db, businessId)) throw new InputError("deleteRefundInFlight", { company: biz.name });
  await db.transaction(async (t) => {
    await removeCompany(t, businessId);
    await audit(t, { adminEmail: admin, action: "business.delete", targetType: "business", targetId: businessId, reason: r, data: { name: biz.name } });
  });
}

/**
 * What deleting a user would do: the companies only they belong to go with them, and companies
 * they solely own but share with others block the deletion (someone would be left without an owner).
 */
export async function userDeletionPlan(db: Executor, userId: string) {
  const mine = await db
    .select({ id: businesses.id, name: businesses.name, role: memberships.role })
    .from(memberships)
    .innerJoin(businesses, eq(businesses.id, memberships.businessId))
    .where(eq(memberships.userId, userId));
  const deletesCompanies: { id: string; name: string }[] = [];
  const blockedBy: { id: string; name: string }[] = [];
  for (const c of mine) {
    const team = await db.select({ userId: memberships.userId, role: memberships.role }).from(memberships).where(eq(memberships.businessId, c.id));
    if (team.length === 1) deletesCompanies.push({ id: c.id, name: c.name });
    else if (c.role === "owner" && !team.some((m) => m.userId !== userId && m.role === "owner")) blockedBy.push({ id: c.id, name: c.name });
  }
  return { deletesCompanies, blockedBy };
}

/** Permanently deletes an account, with the companies only it belongs to. Feedback it attached stays, anonymous. */
export async function deleteUser(db: Db, admin: string, userId: string, reason: string) {
  const r = reasonOf(reason);
  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId));
  if (!user) throw new InputError("adminTargetMissing");
  const plan = await userDeletionPlan(db, userId);
  if (plan.blockedBy.length) throw new InputError("deleteSoleOwner", { company: plan.blockedBy[0].name });
  for (const c of plan.deletesCompanies) if (await refundInFlight(db, c.id)) throw new InputError("deleteRefundInFlight", { company: c.name });
  await db.transaction(async (t) => {
    for (const c of plan.deletesCompanies) await removeCompany(t, c.id);
    await t.delete(notificationReads).where(eq(notificationReads.userId, userId));
    await t.delete(memberships).where(eq(memberships.userId, userId));
    await t.delete(sessions).where(and(eq(sessions.kind, "business"), eq(sessions.subjectId, userId)));
    await t.delete(otpCodes).where(and(eq(otpCodes.purpose, "business"), eq(otpCodes.subjectId, userId)));
    await t.update(feedbackResponses).set({ userId: null }).where(eq(feedbackResponses.userId, userId));
    await t.delete(users).where(eq(users.id, userId));
    await audit(t, {
      adminEmail: admin,
      action: "user.delete",
      targetType: "user",
      targetId: userId,
      reason: r,
      data: { email: user.email, companies: plan.deletesCompanies.map((c) => c.name) },
    });
  });
}

/** Deletes one survey response. The audit row records that it happened, not what it said. Returns whether anything was deleted. */
export async function deleteFeedback(db: Db, admin: string, id: string) {
  return db.transaction(async (t) => {
    const gone = await t.delete(feedbackResponses).where(eq(feedbackResponses.id, id)).returning({ id: feedbackResponses.id });
    if (gone.length) await audit(t, { adminEmail: admin, action: "feedback.delete", targetType: "feedback", targetId: id });
    return gone.length > 0;
  });
}

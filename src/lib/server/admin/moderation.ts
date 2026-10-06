import { and, desc, eq, gte, isNotNull, isNull, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { blocks, businesses, otpCodes, sessions, users, type BlockKind } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { isWalletAddress } from "@/lib/solana/tx";
import { InputError } from "../invoices";
import { blockTarget } from "../suspension";
import { audit } from "./audit";

// Every action needs a reason and runs in one transaction with its audit row. Repeating an action
// is harmless and changes nothing, so it writes no second audit row. Admin access is separate
// from business accounts (an allowlist plus admin sessions), so moderating the business account
// at an admin's address never locks an admin out.

const MAX_REASON = 500;
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function reasonOf(reason: string) {
  const r = reason.trim();
  if (!r || r.length > MAX_REASON) throw new InputError("reasonRequired");
  return r;
}

async function existingUser(db: Db, userId: string) {
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
  if (!u) throw new InputError("adminTargetMissing");
}

async function existingCompany(db: Db, businessId: string) {
  const [b] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.id, businessId));
  if (!b) throw new InputError("adminTargetMissing");
}

/** Blocks sign-in and ends every business session the user has. */
export async function suspendUser(db: Db, admin: string, userId: string, reason: string) {
  const r = reasonOf(reason);
  await existingUser(db, userId);
  await db.transaction(async (t) => {
    const changed = await t.update(users).set({ suspendedAt: new Date(), suspendedReason: r }).where(and(eq(users.id, userId), isNull(users.suspendedAt))).returning({ id: users.id });
    await t.delete(sessions).where(and(eq(sessions.kind, "business"), eq(sessions.subjectId, userId)));
    if (changed.length) await audit(t, { adminEmail: admin, action: "user.suspend", targetType: "user", targetId: userId, reason: r });
  });
}

export async function restoreUser(db: Db, admin: string, userId: string, reason: string) {
  const r = reasonOf(reason);
  await existingUser(db, userId);
  await db.transaction(async (t) => {
    const changed = await t.update(users).set({ suspendedAt: null, suspendedReason: null }).where(and(eq(users.id, userId), isNotNull(users.suspendedAt))).returning({ id: users.id });
    if (changed.length) await audit(t, { adminEmail: admin, action: "user.restore", targetType: "user", targetId: userId, reason: r });
  });
}

/** Ends every session (e.g. a stolen laptop) without suspending the account. */
export async function signOutUser(db: Db, admin: string, userId: string, reason: string) {
  const r = reasonOf(reason);
  await existingUser(db, userId);
  await db.transaction(async (t) => {
    const ended = await t.delete(sessions).where(and(eq(sessions.kind, "business"), eq(sessions.subjectId, userId))).returning({ id: sessions.id });
    if (ended.length) await audit(t, { adminEmail: admin, action: "user.sign_out", targetType: "user", targetId: userId, reason: r, data: { sessions: ended.length } });
  });
}

/**
 * Members are sent to /suspended, and customer and payment links stop. Nothing on the ledger
 * changes. Nothing polls a suspended company, so payments that still arrive and refunds already
 * submitted are reconciled on the first sync after it is restored.
 */
export async function suspendCompany(db: Db, admin: string, businessId: string, reason: string) {
  const r = reasonOf(reason);
  await existingCompany(db, businessId);
  await db.transaction(async (t) => {
    const changed = await t
      .update(businesses)
      .set({ suspendedAt: new Date(), suspendedReason: r })
      .where(and(eq(businesses.id, businessId), isNull(businesses.suspendedAt)))
      .returning({ id: businesses.id });
    if (changed.length) await audit(t, { adminEmail: admin, action: "business.suspend", targetType: "business", targetId: businessId, reason: r });
  });
}

export async function restoreCompany(db: Db, admin: string, businessId: string, reason: string) {
  const r = reasonOf(reason);
  await existingCompany(db, businessId);
  await db.transaction(async (t) => {
    const changed = await t
      .update(businesses)
      .set({ suspendedAt: null, suspendedReason: null })
      .where(and(eq(businesses.id, businessId), isNotNull(businesses.suspendedAt)))
      .returning({ id: businesses.id });
    if (changed.length) await audit(t, { adminEmail: admin, action: "business.restore", targetType: "business", targetId: businessId, reason: r });
  });
}

/** Blocks sign-in codes to an email, or the test-token faucet for a wallet. One active block per target. */
export async function addBlock(db: Db, admin: string, p: { kind: BlockKind; target: string; reason: string }) {
  const r = reasonOf(p.reason);
  const target = blockTarget(p.kind, p.target);
  if (p.kind === "sign_in" && !isEmail(target)) throw new InputError("invalidEmail");
  if (p.kind === "faucet" && !isWalletAddress(target)) throw new InputError("invalidWalletAddress");
  await db.transaction(async (t) => {
    const [created] = await t.insert(blocks).values({ id: newId("blk"), kind: p.kind, target, reason: r, createdBy: admin }).onConflictDoNothing().returning({ id: blocks.id });
    if (created) await audit(t, { adminEmail: admin, action: "block.add", targetType: "block", targetId: created.id, reason: r, data: { kind: p.kind, target } });
  });
}

export async function liftBlock(db: Db, admin: string, blockId: string, reason: string) {
  const r = reasonOf(reason);
  await db.transaction(async (t) => {
    const [lifted] = await t
      .update(blocks)
      .set({ liftedAt: new Date(), liftedBy: admin })
      .where(and(eq(blocks.id, blockId), isNull(blocks.liftedAt)))
      .returning({ kind: blocks.kind, target: blocks.target });
    if (lifted) await audit(t, { adminEmail: admin, action: "block.lift", targetType: "block", targetId: blockId, reason: r, data: lifted });
  });
}

export type BlockRow = { id: string; kind: BlockKind; target: string; reason: string; createdBy: string; createdAt: string };

export async function listBlocks(db: Db, opts: { active: boolean }): Promise<BlockRow[]> {
  const rows = await db
    .select()
    .from(blocks)
    .where(opts.active ? isNull(blocks.liftedAt) : undefined)
    .orderBy(desc(blocks.createdAt))
    .limit(200);
  return rows.map((b) => ({ id: b.id, kind: b.kind, target: b.target, reason: b.reason, createdBy: b.createdBy, createdAt: b.createdAt.toISOString() }));
}

/**
 * Business accounts that asked for the most sign-in codes recently. Customer codes go to a
 * company's customer on file, so their addresses stay out of admin views (privacy line).
 */
export async function topCodeRequesters(db: Db, hours = 24) {
  const count = sql<number>`count(*)`.mapWith(Number);
  const rows = await db
    .select({ email: otpCodes.email, count, userId: sql<string | null>`(select u.id from users u where u.email = "otp_codes"."email")` })
    .from(otpCodes)
    .where(and(gte(otpCodes.createdAt, new Date(Date.now() - hours * 3600_000)), eq(otpCodes.purpose, "business")))
    .groupBy(otpCodes.email)
    .orderBy(desc(count))
    .limit(20);
  return rows;
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import type { Db } from "@/lib/db/client";
import { businesses, users, type BlockKind } from "@/lib/db/schema";
import { BULK_DELETE_WORD, confirmMatches } from "@/lib/domain/confirm";
import { UserError } from "@/lib/i18n/errors";
import { getI18n } from "@/lib/i18n/server";
import { deleteCompany, deleteFeedback, deleteUser } from "@/lib/server/admin/deletion";
import { InputError } from "@/lib/server/invoices";
import { addBlock, liftBlock, restoreCompany, restoreUser, signOutUser, suspendCompany, suspendUser } from "@/lib/server/admin/moderation";
import { deps, requireAdmin } from "@/lib/server/context";
import { run } from "./result";

/** Every admin action: a signed-in admin (404 otherwise), the service call with its reason, then a refresh. */
const adminAction = (fn: (admin: string, db: Awaited<ReturnType<typeof deps>>["db"]) => Promise<void>) =>
  run(async () => {
    const admin = await requireAdmin();
    const { db } = await deps();
    await fn(admin, db);
    refresh();
    return {};
  });

export const suspendUserAction = async (userId: string, reason: string) => adminAction((admin, db) => suspendUser(db, admin, userId, reason));
export const restoreUserAction = async (userId: string, reason: string) => adminAction((admin, db) => restoreUser(db, admin, userId, reason));
export const signOutUserAction = async (userId: string, reason: string) => adminAction((admin, db) => signOutUser(db, admin, userId, reason));
export const suspendCompanyAction = async (businessId: string, reason: string) => adminAction((admin, db) => suspendCompany(db, admin, businessId, reason));
export const restoreCompanyAction = async (businessId: string, reason: string) => adminAction((admin, db) => restoreCompany(db, admin, businessId, reason));
export const liftBlockAction = async (blockId: string, reason: string) => adminAction((admin, db) => liftBlock(db, admin, blockId, reason));
export const addBlockAction = async (input: { kind: BlockKind; target: string; reason: string }) => adminAction((admin, db) => addBlock(db, admin, input));

// ── Deletion ───────────────────────────────────────────────────────────────

export type BulkKind = "companies" | "users" | "feedback";
export type BulkResult = { deleted: number; skipped: { id: string; label: string; error: string }[] };

/** Deletes a company after the admin typed its exact name. */
export async function deleteCompanyAction(businessId: string, reason: string, typed: string) {
  return adminAction(async (admin, db) => {
    const [biz] = await db.select({ name: businesses.name }).from(businesses).where(eq(businesses.id, businessId));
    if (!biz) throw new InputError("adminTargetMissing");
    if (!confirmMatches(biz.name, typed)) throw new InputError("deleteConfirmMismatch", { expected: biz.name });
    await deleteCompany(db, admin, businessId, reason);
  });
}

/** Deletes an account after the admin typed its exact email. */
export async function deleteUserAction(userId: string, reason: string, typed: string) {
  return adminAction(async (admin, db) => {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    if (!user) throw new InputError("adminTargetMissing");
    if (!confirmMatches(user.email, typed)) throw new InputError("deleteConfirmMismatch", { expected: user.email });
    await deleteUser(db, admin, userId, reason);
  });
}

export async function deleteFeedbackAction(id: string) {
  return adminAction(async (admin, db) => {
    await deleteFeedback(db, admin, id);
  });
}

/**
 * Deletes many items at once after the admin typed DELETE. Each item gets the same checks as on
 * its own page; refusals are reported per item and the rest still go ahead.
 */
export async function bulkDeleteAction(kind: BulkKind, ids: string[], reason: string, typed: string) {
  return run(async (): Promise<BulkResult> => {
    const admin = await requireAdmin();
    if (typed.trim() !== BULK_DELETE_WORD) throw new InputError("deleteConfirmMismatch", { expected: BULK_DELETE_WORD });
    const { db } = await deps();
    const i18n = await getI18n();
    const out: BulkResult = { deleted: 0, skipped: [] };
    for (const id of [...new Set(ids)].slice(0, 200)) {
      const label = await bulkLabel(db, kind, id);
      try {
        if (kind === "companies") await deleteCompany(db, admin, id, reason);
        else if (kind === "users") await deleteUser(db, admin, id, reason);
        else if (!(await deleteFeedback(db, admin, id))) throw new InputError("adminTargetMissing");
        out.deleted += 1;
      } catch (err) {
        if (!(err instanceof UserError)) throw err;
        out.skipped.push({ id, label, error: err.render(i18n) });
      }
    }
    refresh();
    return out;
  });
}

async function bulkLabel(db: Db, kind: BulkKind, id: string) {
  if (kind === "companies") return (await db.select({ v: businesses.name }).from(businesses).where(eq(businesses.id, id)))[0]?.v ?? id;
  if (kind === "users") return (await db.select({ v: users.email }).from(users).where(eq(users.id, id)))[0]?.v ?? id;
  return id;
}

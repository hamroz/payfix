"use server";

import { refresh } from "next/cache";
import type { BlockKind } from "@/lib/db/schema";
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

import { and, eq, isNotNull, isNull } from "drizzle-orm";
import type { Executor } from "@/lib/db/client";
import { blocks, businesses, users, type BlockKind } from "@/lib/db/schema";

// Read-only checks for what platform admins suspended or blocked. Kept free of auth and admin
// imports so the sign-in, payment, and link code paths can call them without import cycles.

/** Normalizes a block target the way it's stored: emails lowercased, wallet addresses as given. */
export const blockTarget = (kind: BlockKind, target: string) => (kind === "sign_in" ? target.trim().toLowerCase() : target.trim());

export async function activeBlock(db: Executor, kind: BlockKind, target: string) {
  const [b] = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(and(eq(blocks.kind, kind), eq(blocks.target, blockTarget(kind, target)), isNull(blocks.liftedAt)))
    .limit(1);
  return !!b;
}

export async function userSuspended(db: Executor, userId: string) {
  const [u] = await db.select({ id: users.id }).from(users).where(and(eq(users.id, userId), isNotNull(users.suspendedAt)));
  return !!u;
}

export async function companySuspended(db: Executor, businessId: string) {
  const [b] = await db.select({ id: businesses.id }).from(businesses).where(and(eq(businesses.id, businessId), isNotNull(businesses.suspendedAt)));
  return !!b;
}

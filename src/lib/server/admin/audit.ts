import { and, desc, eq, gte } from "drizzle-orm";
import type { Executor } from "@/lib/db/client";
import { adminAudit, type AdminAction } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

export type AuditTarget = "user" | "business" | "block" | "feedback" | "export";

/** Records what an admin did or opened. Call it inside the same transaction as the change. */
export async function audit(
  db: Executor,
  e: { adminEmail: string; action: AdminAction; targetType?: AuditTarget; targetId?: string; reason?: string; data?: Record<string, unknown> },
) {
  await db.insert(adminAudit).values({
    id: newId("aud"),
    adminEmail: e.adminEmail,
    action: e.action,
    targetType: e.targetType ?? null,
    targetId: e.targetId ?? null,
    reason: e.reason ?? null,
    data: e.data ?? null,
  });
}

const VIEW_WINDOW_MS = 10 * 60 * 1000;

/** Records that an admin opened a user or company page, at most once per admin and page every 10 minutes. */
export async function auditView(db: Executor, adminEmail: string, targetType: "user" | "business", targetId: string) {
  const action = targetType === "user" ? "user.view" : "business.view";
  const [recent] = await db
    .select({ id: adminAudit.id })
    .from(adminAudit)
    .where(
      and(
        eq(adminAudit.adminEmail, adminEmail),
        eq(adminAudit.action, action),
        eq(adminAudit.targetId, targetId),
        gte(adminAudit.createdAt, new Date(Date.now() - VIEW_WINDOW_MS)),
      ),
    )
    .limit(1);
  if (!recent) await audit(db, { adminEmail, action, targetType, targetId });
}

export type AuditRow = Omit<typeof adminAudit.$inferSelect, "createdAt"> & { createdAt: string };

/** Newest first; optionally only the rows about one user, company, or block. */
export async function listAudit(db: Executor, opts: { limit?: number; targetType?: AuditTarget; targetId?: string }): Promise<AuditRow[]> {
  const where = [
    ...(opts.targetType ? [eq(adminAudit.targetType, opts.targetType)] : []),
    ...(opts.targetId ? [eq(adminAudit.targetId, opts.targetId)] : []),
  ];
  const rows = await db
    .select()
    .from(adminAudit)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(adminAudit.createdAt), desc(adminAudit.id))
    .limit(opts.limit ?? 200);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

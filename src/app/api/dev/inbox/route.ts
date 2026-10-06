import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { outbox } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { currentUser, demoInboxScope, deps } from "@/lib/server/context";
import { listWorkspaces } from "@/lib/server/workspaces";

export const dynamic = "force-dynamic";

/**
 * Demo mode only: the emails PayFix would have sent, newest first — limited to what this
 * browser may see: emails about the signed-in user's companies, plus codes sent to the
 * address this browser asked for. Other visitors' codes and links stay hidden.
 */
export async function GET() {
  if (!env().DEMO_MODE) return new Response("Not found", { status: 404 });
  const { db } = await deps();
  const user = await currentUser();
  const companies = user ? (await listWorkspaces(db, user.id)).map((w) => w.businessId) : [];
  const scope = await demoInboxScope();
  const visible = [
    ...(companies.length ? [inArray(outbox.businessId, companies)] : []),
    ...(user ? [and(eq(outbox.to, user.email), isNull(outbox.businessId))] : []),
    ...(scope.email ? [and(eq(outbox.to, scope.email), scope.businessId ? or(isNull(outbox.businessId), eq(outbox.businessId, scope.businessId)) : isNull(outbox.businessId))] : []),
  ];
  if (!visible.length) return Response.json([]);
  // Only demo mail: admin codes are really emailed (status pending/sent) and must never show here.
  const rows = await db.select().from(outbox).where(and(eq(outbox.status, "demo"), or(...visible))).orderBy(desc(outbox.createdAt)).limit(12);
  return Response.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
}

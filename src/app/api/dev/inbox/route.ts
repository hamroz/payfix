import { desc } from "drizzle-orm";
import { outbox } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { deps } from "@/lib/server/context";

export const dynamic = "force-dynamic";

/** Demo mode only: the emails PayFix would have sent, newest first. */
export async function GET() {
  if (!env().DEMO_MODE) return new Response("Not found", { status: 404 });
  const { db } = await deps();
  const rows = await db.select().from(outbox).orderBy(desc(outbox.createdAt)).limit(12);
  return Response.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
}

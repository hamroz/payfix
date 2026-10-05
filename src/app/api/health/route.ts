import { sql } from "drizzle-orm";
import { env } from "@/lib/env";
import { deps } from "@/lib/server/context";
import { treasurySol } from "@/lib/server/demo";

export const dynamic = "force-dynamic";

/** The Neon region embedded in the database host (e.g. "us-east-2"), never the credentials. */
function databaseRegion() {
  try {
    return new URL(env().DATABASE_URL ?? "").hostname.match(/([a-z]{2}-[a-z]+-\d)\.(?:aws|azure)\.neon\.tech$/)?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Uptime and latency check. Reports the function's region and the database's, plus a warm
 * database round trip, so a cross-region deployment shows up as a large `dbMs`.
 */
export async function GET() {
  const e = env();
  let database: "ok" | "error" = "ok";
  let dbMs: number | null = null;
  try {
    const { db } = await deps();
    await db.execute(sql`select 1`); // opens the connection
    const t = performance.now();
    await db.execute(sql`select 1`);
    dbMs = Math.round(performance.now() - t);
  } catch {
    database = "error";
  }
  const sol = e.DEMO_MODE ? await treasurySol().catch(() => null) : null;
  const body = {
    ok: database === "ok",
    cluster: e.SOLANA_CLUSTER,
    demo: e.DEMO_MODE,
    region: process.env.VERCEL_REGION ?? null,
    database,
    dbRegion: databaseRegion(),
    dbMs,
    ...(e.DEMO_MODE ? { demoTreasurySol: sol, demoTreasuryLow: sol !== null && sol < 0.2 } : {}),
  };
  return Response.json(body, { status: body.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}

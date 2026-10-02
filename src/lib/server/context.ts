import "server-only";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { businesses, events } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { sessionSubject, type SessionKind } from "./auth";
import { chain } from "./chain";
import { demoReady, seedDemo } from "./demo";
import { syncBusiness } from "./ingest";
import { reconcileBusinessRefunds } from "./refunds";

const holder = globalThis as typeof globalThis & { __payfixSeeded?: Promise<unknown>; __payfixLastSync?: number; __payfixSyncing?: Promise<unknown> };

/** Database + chain for request handlers. In demo mode, seeds the demo workspace on first use. */
export async function deps() {
  const db = await getDb();
  if (env().DEMO_MODE && demoReady()) {
    holder.__payfixSeeded ??= seedDemo(db).catch((e) => {
      holder.__payfixSeeded = undefined;
      throw e;
    });
    await holder.__payfixSeeded;
  }
  return { db, chain: chain() };
}

export const resetSeedFlag = () => {
  holder.__payfixSeeded = undefined;
};

export const COOKIES: Record<SessionKind, string> = { business: "pf_b", customer: "pf_c" };

export async function setSessionCookie(kind: SessionKind, token: string, expires: Date) {
  (await cookies()).set(COOKIES[kind], token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure cookies only over https, so the Docker/LAN http setup can still sign in.
    secure: env().APP_URL.startsWith("https://"),
    path: "/",
    expires,
  });
}

// Read the cookie before touching the database: it marks the route as per-request, so
// Next.js never tries to prerender it at build time (when no database is reachable).
export async function currentBusiness() {
  const token = (await cookies()).get(COOKIES.business)?.value;
  if (!token) return null;
  const { db } = await deps();
  const id = await sessionSubject(db, "business", token);
  if (!id) return null;
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, id));
  return biz ?? null;
}

export async function requireBusiness() {
  const biz = await currentBusiness();
  if (!biz) redirect("/login");
  return biz;
}

export async function currentCustomerId() {
  const token = (await cookies()).get(COOKIES.customer)?.value;
  if (!token) return null;
  const { db } = await deps();
  return sessionSubject(db, "customer", token);
}

/**
 * Syncs every business with the chain, at most every ~2.5 seconds per process no matter
 * how many tabs are polling, and reconciles in-flight refunds. Returns a change marker.
 */
export async function syncAll(force = false) {
  const { db, chain: c } = await deps();
  const now = Date.now();
  if (!holder.__payfixSyncing && (force || now - (holder.__payfixLastSync ?? 0) > 2500)) {
    holder.__payfixLastSync = now;
    holder.__payfixSyncing = (async () => {
      const all = await db.select({ id: businesses.id }).from(businesses);
      for (const b of all) {
        await syncBusiness({ db, chain: c }, b.id);
        await reconcileBusinessRefunds({ db, chain: c }, b.id);
      }
    })()
      .catch((err) => console.error("[payfix] sync failed:", err instanceof Error ? err.message : err))
      .finally(() => {
        holder.__payfixSyncing = undefined;
      });
  }
  if (holder.__payfixSyncing) await holder.__payfixSyncing;
  const [row] = await db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(events);
  return { version: row?.n ?? 0 };
}

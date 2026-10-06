import "server-only";
import { eq, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { businesses, events } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { can, type Role } from "@/lib/roles";
import { adminFromToken } from "./admin/access";
import { sessionSubject, type SessionKind } from "./auth";
import { chain } from "./chain";
import { InputError } from "./invoices";
import { refreshCompany } from "./sync";
import { listWorkspaces, userById } from "./workspaces";

/** Database + chain for request handlers. */
export async function deps() {
  return { db: await getDb(), chain: chain() };
}

export const COOKIES: Record<SessionKind, string> = { business: "pf_b", customer: "pf_c", admin: "pf_a" };
const WORKSPACE_COOKIE = "pf_ws";
/** Demo mode: the email this browser asked a sign-in code for, so the demo inbox can show it. */
export const DEMO_INBOX_COOKIE = "pf_inbox";

const cookieOptions = (expires?: Date) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  // Secure cookies only over https, so the Docker/LAN http setup can still sign in.
  secure: env().APP_URL.startsWith("https://"),
  path: "/",
  ...(expires ? { expires } : {}),
});

export async function setSessionCookie(kind: SessionKind, token: string, expires: Date) {
  (await cookies()).set(COOKIES[kind], token, cookieOptions(expires));
}

export async function setWorkspaceCookie(businessId: string) {
  (await cookies()).set(WORKSPACE_COOKIE, businessId, cookieOptions(new Date(Date.now() + 30 * 864e5)));
}

/** Demo inbox scope for a browser without a business session: one address, optionally within one company. */
export async function setDemoInboxCookie(email: string, businessId?: string) {
  (await cookies()).set(DEMO_INBOX_COOKIE, `${email.trim().toLowerCase()}|${businessId ?? ""}`, cookieOptions(new Date(Date.now() + 864e5)));
}

export async function demoInboxScope() {
  const raw = (await cookies()).get(DEMO_INBOX_COOKIE)?.value ?? "";
  const [email, businessId] = raw.split("|");
  return { email: email || null, businessId: businessId || null };
}

// Read cookies before touching the database: it marks the route as per-request, so
// Next.js never tries to prerender it at build time (when no database is reachable).
export async function currentUser() {
  const token = (await cookies()).get(COOKIES.business)?.value;
  if (!token) return null;
  const { db } = await deps();
  const id = await sessionSubject(db, "business", token);
  const user = id ? await userById(db, id) : null;
  // Suspension deletes sessions too; this covers a session created in the same instant.
  return user && !user.suspendedAt ? user : null;
}

/** The signed-in user, the company they're working in, and their role there. */
export async function currentWorkspace() {
  const jar = await cookies();
  const user = await currentUser();
  if (!user) return null;
  const { db } = await deps();
  const workspaces = await listWorkspaces(db, user.id);
  const chosen = workspaces.find((w) => w.businessId === jar.get(WORKSPACE_COOKIE)?.value) ?? workspaces[0];
  if (!chosen) return { user, workspaces, biz: null, role: null };
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, chosen.businessId));
  return { user, workspaces, biz, role: chosen.role as Role };
}

export async function requireWorkspace() {
  const ws = await currentWorkspace();
  if (!ws) redirect("/login");
  if (!ws.biz || !ws.role) redirect("/onboarding");
  // A suspended company stops every business page, action, and export for its members.
  if (ws.biz.suspendedAt) redirect("/suspended");
  return { user: ws.user, workspaces: ws.workspaces, biz: ws.biz, role: ws.role };
}

export async function requireBusiness() {
  return (await requireWorkspace()).biz;
}

/** For mutations: the workspace, if the user's role there is at least `min`. */
export async function requireRole(min: Role) {
  const ws = await requireWorkspace();
  if (!can(ws.role, min)) throw new InputError("roleForbidden", { role: ws.role });
  return ws;
}

/** The signed-in platform admin's email, or null. */
export async function currentAdmin() {
  const token = (await cookies()).get(COOKIES.admin)?.value;
  if (!token) return null;
  const { db } = await deps();
  return adminFromToken(db, token);
}

/** For admin pages, routes, and actions: anyone else gets a plain 404, so the area isn't advertised. */
export async function requireAdmin() {
  const email = await currentAdmin();
  if (!email) notFound();
  return email;
}

export async function currentCustomerId() {
  const token = (await cookies()).get(COOKIES.customer)?.value;
  if (!token) return null;
  const { db } = await deps();
  return sessionSubject(db, "customer", token);
}

type SyncState = { last: number; lastOverdue?: number; running?: Promise<unknown> };
const holder = globalThis as typeof globalThis & { __payfixSync?: Map<string, SyncState> };
holder.__payfixSync ??= new Map();

/**
 * Syncs one company with the chain — at most every ~2.5 seconds per process however many
 * tabs are polling — reconciles its in-flight refunds, and flags overdue invoices about once a
 * minute. Returns a change marker.
 */
export async function syncCompany(businessId: string, force = false) {
  const { db, chain: c } = await deps();
  const state = holder.__payfixSync!.get(businessId) ?? { last: 0 };
  holder.__payfixSync!.set(businessId, state);
  if (!state.running && (force || Date.now() - state.last > 2500)) {
    state.last = Date.now();
    state.running = (async () => {
      // Overdue only changes as time passes, so once a minute per company is plenty.
      const checkOverdue = Date.now() - (state.lastOverdue ?? 0) > 60_000;
      if (checkOverdue) state.lastOverdue = Date.now();
      await refreshCompany({ db, chain: c }, businessId, { checkOverdue });
    })()
      .catch((err) => console.error("[payfix] sync failed:", err instanceof Error ? err.message : err))
      .finally(() => {
        state.running = undefined;
      });
  }
  if (state.running) await state.running;
  const [row] = await db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(events).where(eq(events.businessId, businessId));
  return { version: row?.n ?? 0 };
}

/** The visitor's IP as reported by the platform proxy, for abuse limits only. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

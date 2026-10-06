import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { env } from "@/lib/env";
import type { Locale } from "@/lib/i18n/config";
import { issueCode, maskEmail, verifyCode } from "../auth";
import { adminMailDeliverable } from "../email";
import { InputError } from "../invoices";
import { consume, DAY, MINUTE, rateKey } from "../ratelimit";

/** Admin sessions are short: a stolen cookie is useful for half a day at most. */
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const normalize = (email: string) => email.trim().toLowerCase();
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** True for an address in ADMIN_EMAILS (read fresh, so removing an address takes effect at once). */
export const isAdminEmail = (email: string) => env().ADMIN_EMAILS.includes(normalize(email));

/**
 * Queues an admin sign-in code. Every address gets the same answer at the same speed, so the page
 * doesn't reveal who is an admin: only allowlisted addresses get a code, and the caller delivers
 * it after responding (`deliverOutbox` in `after()`). The code is always really emailed, never
 * put in the demo inbox, because in demo mode anyone can read any address's demo mail.
 */
export async function requestAdminCode(db: Db, email: string, locale?: Locale) {
  const e = normalize(email);
  if (!adminMailDeliverable()) throw new InputError("adminEmailUnavailable");
  await consume(db, [
    { key: rateKey("admin-code", e), max: 5, windowMs: 15 * MINUTE, error: "rateCodes" },
    { key: rateKey("admin-code-day", e), max: 20, windowMs: DAY, error: "rateCodesDay" },
  ]);
  if (isAdminEmail(e)) await issueCode(db, { purpose: "admin", subjectId: e, email: e, locale, deliver: "always" });
  return { maskedEmail: maskEmail(e) };
}

/** Checks an admin code. Addresses not on the allowlist never have one, so they read as expired. */
export async function verifyAdminCode(db: Db, email: string, code: string) {
  const e = normalize(email);
  if (!isAdminEmail(e)) return { ok: false as const, error: "codeExpired" as const };
  return verifyCode(db, { purpose: "admin", subjectId: e, code, ttlMs: ADMIN_SESSION_TTL_MS });
}

/** The admin's email for a session token, if the session is live and the address is still allowlisted. */
export async function adminFromToken(db: Db, token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [s] = await db
    .select({ subjectId: sessions.subjectId })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, sha256(token)), eq(sessions.kind, "admin"), gt(sessions.expiresAt, new Date())));
  return s && isAdminEmail(s.subjectId) ? s.subjectId : null;
}

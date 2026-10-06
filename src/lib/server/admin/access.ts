import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { env } from "@/lib/env";
import type { Locale } from "@/lib/i18n/config";
import { issueCode, maskEmail, verifyCode } from "../auth";
import { deliverOutbox, emailFailed } from "../email";
import { InputError } from "../invoices";
import { consume, MINUTE, rateKey } from "../ratelimit";

/** Admin sessions are short: a stolen cookie is useful for half a day at most. */
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const normalize = (email: string) => email.trim().toLowerCase();
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** True for an address in ADMIN_EMAILS (read fresh, so removing an address takes effect at once). */
export const isAdminEmail = (email: string) => env().ADMIN_EMAILS.includes(normalize(email));

/**
 * Emails an admin sign-in code. Answers every address the same way, so the page doesn't reveal
 * who is an admin; only allowlisted addresses get a code. The code is always really emailed
 * (never the demo inbox), because in demo mode anyone can read any address's demo mail.
 */
export async function requestAdminCode(db: Db, email: string, locale?: Locale) {
  const e = normalize(email);
  await consume(db, [{ key: rateKey("admin-code", e), max: 5, windowMs: 15 * MINUTE, error: "rateCodes" }]);
  if (isAdminEmail(e)) {
    const { mailId } = await issueCode(db, { purpose: "admin", subjectId: e, email: e, locale, deliver: "always" });
    await deliverOutbox(db);
    if (await emailFailed(db, mailId)) throw new InputError("adminEmailUnavailable");
  }
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

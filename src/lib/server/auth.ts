import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { customers, otpCodes, sessions } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { newId, newToken } from "@/lib/ids";
import { deliverOutbox, emailFailed, queueEmail } from "./email";
import { InputError } from "./invoices";
import { consume, DAY, MINUTE, rateKey } from "./ratelimit";

export type SessionKind = "business" | "customer";

const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const codeHash = (id: string, code: string) => createHmac("sha256", env().SESSION_SECRET).update(`${id}:${code}`).digest("hex");

const mask = (email: string) => email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${"•".repeat(Math.min(b.length, 6))}${c}`);

/**
 * Emails a 6-digit sign-in code. Business sign-in codes are for a user (who may belong to
 * several companies). For customers, the subject is fixed by the resolution link, so the
 * code always goes to the invoice customer's address on file.
 */
export async function sendCode(db: Db, p: { purpose: SessionKind; subjectId: string; email: string; businessId?: string | null }) {
  await consume(db, [
    { key: rateKey("code", p.email), max: 5, windowMs: 15 * MINUTE, message: "Too many codes sent to this address. Wait 15 minutes and try again." },
    { key: rateKey("code-day", p.email), max: 20, windowMs: DAY, message: "Too many codes sent to this address today. Try again tomorrow." },
  ]);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const id = newId("otp");
  await db.insert(otpCodes).values({
    id,
    email: p.email,
    purpose: p.purpose,
    subjectId: p.subjectId,
    codeHash: codeHash(id, code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });
  const mailId = await queueEmail(db, {
    businessId: p.businessId ?? null,
    to: p.email,
    subject: `${code} is your PayFix code`,
    body: `Enter ${code} to continue. It expires in 10 minutes. If you didn't ask for this, you can ignore it.`,
    code,
  });
  if (env().DEMO_MODE) console.log(`[payfix] sign-in code for ${p.email}: ${code}`);
  await deliverOutbox(db);
  if (await emailFailed(db, mailId)) throw new InputError("We couldn’t send the email just now. Try again in a minute.");
  return { maskedEmail: mask(p.email) };
}

/** Checks a code and, on success, opens a session. Returns the raw session token for the cookie. */
export async function verifyCode(db: Db, p: { purpose: SessionKind; subjectId: string; code: string }) {
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.purpose, p.purpose),
        eq(otpCodes.subjectId, p.subjectId),
        isNull(otpCodes.consumedAt),
        gt(otpCodes.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  if (!otp) return { ok: false as const, error: "That code has expired. Send a new one." };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false as const, error: "Too many attempts. Send a new code." };

  const expected = Buffer.from(otp.codeHash, "hex");
  const actual = Buffer.from(codeHash(otp.id, p.code.trim()), "hex");
  if (!timingSafeEqual(expected, actual)) {
    await db.update(otpCodes).set({ attempts: otp.attempts + 1 }).where(eq(otpCodes.id, otp.id));
    return { ok: false as const, error: "That code isn't right. Check it and try again." };
  }
  await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, otp.id));
  const token = newToken();
  await db.insert(sessions).values({
    id: newId("ses"),
    kind: p.purpose,
    subjectId: p.subjectId,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return { ok: true as const, token, expiresAt: new Date(Date.now() + SESSION_TTL_MS) };
}

export async function sessionSubject(db: Db, kind: SessionKind, token: string | undefined) {
  if (!token) return null;
  const [s] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, sha256(token)), eq(sessions.kind, kind), gt(sessions.expiresAt, new Date())));
  return s?.subjectId ?? null;
}

export async function endSession(db: Db, token: string | undefined) {
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
}

export async function customerEmail(db: Db, customerId: string) {
  const [c] = await db.select().from(customers).where(eq(customers.id, customerId));
  return c?.email ?? null;
}

import { and, asc, eq, inArray, lt } from "drizzle-orm";
import type { Db, Executor } from "@/lib/db/client";
import { outbox } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { newId } from "@/lib/ids";

export type Email = { businessId?: string | null; to: string; subject: string; body: string; link?: string | null; code?: string | null };

const MAX_ATTEMPTS = 5;

/**
 * Queues an email. Call it inside the same transaction as the change it announces, then call
 * `deliverOutbox` after the transaction commits: a rolled-back change never sends mail, and a
 * failed send never rolls back the change. In demo mode the email stays in the demo inbox.
 */
export async function queueEmail(db: Executor, e: Email): Promise<string> {
  const id = newId("ml");
  await db.insert(outbox).values({
    id,
    businessId: e.businessId ?? null,
    to: e.to,
    subject: e.subject,
    body: e.body,
    link: e.link ?? null,
    code: e.code ?? null,
    status: env().DEMO_MODE ? "demo" : "pending",
  });
  return id;
}

/**
 * Sends queued emails through Resend. Each delivered row has its code and link erased, so
 * the table never keeps a usable sign-in code or resolution link. Failures are retried on
 * the next call, up to five attempts.
 */
export async function deliverOutbox(db: Db) {
  const e = env();
  if (e.DEMO_MODE) return;
  const pending = await db
    .select()
    .from(outbox)
    .where(and(inArray(outbox.status, ["pending"]), lt(outbox.attempts, MAX_ATTEMPTS)))
    .orderBy(asc(outbox.createdAt))
    .limit(20);
  for (const m of pending) {
    if (!e.RESEND_API_KEY) {
      // Local development without an email provider: print instead of sending.
      if (process.env.NODE_ENV !== "production") {
        console.log(`[payfix] email to ${m.to}: ${m.subject}\n${m.body}${m.link ? `\n${m.link}` : ""}`);
        await db.update(outbox).set({ status: "sent", sentAt: new Date(), code: null, link: null }).where(eq(outbox.id, m.id));
      } else {
        console.error("[payfix] RESEND_API_KEY is not set; emails can't be delivered.");
        await db.update(outbox).set({ status: "failed", error: "RESEND_API_KEY is not set" }).where(eq(outbox.id, m.id));
      }
      continue;
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${e.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: e.EMAIL_FROM, to: [m.to], subject: m.subject, text: m.link ? `${m.body}\n\n${m.link}` : m.body }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      await db.update(outbox).set({ status: "sent", sentAt: new Date(), attempts: m.attempts + 1, code: null, link: null, error: null }).where(eq(outbox.id, m.id));
    } catch (err) {
      const attempts = m.attempts + 1;
      await db
        .update(outbox)
        .set({ attempts, error: err instanceof Error ? err.message : String(err), status: attempts >= MAX_ATTEMPTS ? "failed" : "pending" })
        .where(eq(outbox.id, m.id));
    }
  }
}

/** True when this queued email could not be delivered (after `deliverOutbox`). */
export async function emailFailed(db: Db, id: string) {
  const [m] = await db.select({ status: outbox.status, attempts: outbox.attempts }).from(outbox).where(eq(outbox.id, id));
  return m?.status === "failed" || (m?.status === "pending" && m.attempts > 0);
}

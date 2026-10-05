import { createHash } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import type { Executor } from "@/lib/db/client";
import { rateEvents } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { InputError } from "./invoices";

export type Limit = { key: string; max: number; windowMs: number; message: string };

/** Hashes identifiers (emails, IPs) so the table never stores them in the clear. */
export const rateKey = (action: string, subject: string) => `${action}:${createHash("sha256").update(subject.toLowerCase()).digest("hex").slice(0, 32)}`;

/**
 * Records one use of each limit, or throws the first limit's message if it's already used up.
 * Counting then inserting isn't atomic, so a burst can overshoot by a request or two; that's
 * fine for abuse control, which is all this is for.
 */
export async function consume(db: Executor, limits: Limit[]) {
  for (const l of limits) {
    const [row] = await db
      .select({ n: sql<number>`count(*)`.mapWith(Number) })
      .from(rateEvents)
      .where(and(eq(rateEvents.key, l.key), gt(rateEvents.createdAt, new Date(Date.now() - l.windowMs))));
    if ((row?.n ?? 0) >= l.max) throw new InputError(l.message);
  }
  await db.insert(rateEvents).values(limits.map((l) => ({ id: newId("rl"), key: l.key })));
  // Opportunistic cleanup keeps the table small without a cron job.
  if (Math.random() < 0.02) await db.delete(rateEvents).where(lt(rateEvents.createdAt, new Date(Date.now() - 2 * 864e5)));
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

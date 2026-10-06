import { and, desc, eq, gte, isNotNull } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { feedbackResponses, users, type FeedbackAnswers, type FeedbackCompleted } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n/config";
import { newId } from "@/lib/ids";
import { furthestStep, npsScore, rangeStart, type Funnel, type Range } from "./admin/stats";
import { InputError } from "./invoices";
import { consume, DAY, HOUR, rateKey } from "./ratelimit";

/** The open questions, in the order the survey asks them (from docs/tester-walkthrough.md). */
export const ANSWER_KEYS = ["happened", "hesitated", "voidedApproval", "currentProcess", "receiptTrust", "blockers"] as const satisfies readonly (keyof FeedbackAnswers)[];

const text = (max: number) =>
  z
    .string()
    .max(max * 2) // generous before trimming; the real limit is checked after
    .optional()
    .transform((v) => v?.trim() || undefined)
    .refine((v) => v === undefined || v.length <= max);

const input = z.object({
  completed: z.enum(["unaided", "aided", "no"]),
  minutes: z.number().int().min(0).max(240).nullish(),
  ease: z.number().int().min(1).max(5),
  nps: z.number().int().min(0).max(10),
  answers: z
    .object({
      happened: text(2000),
      hesitated: text(2000),
      voidedApproval: text(2000),
      currentProcess: text(2000),
      receiptTrust: text(2000),
      blockers: text(2000),
    })
    .optional(),
  about: text(200),
  device: z.enum(["phone", "tablet", "computer"]).nullish(),
  quoteOk: z.boolean().default(false),
  attachAccount: z.boolean().default(false),
  // A batch tag from ?c=. Anything odd is dropped rather than rejected: it's only a label.
  cohort: z
    .string()
    .nullish()
    .transform((v) => {
      const c = v?.trim().toLowerCase();
      return c && /^[a-z0-9-]{1,40}$/.test(c) ? c : null;
    }),
  // Hidden from people; bots fill it in.
  website: z.string().optional(),
});

export type FeedbackInput = z.input<typeof input>;

/** Saves one survey response. The account is attached only when the tester asked and is signed in. */
export async function saveFeedback(db: Db, raw: unknown, ctx: { userId: string | null; locale: Locale; ip: string }) {
  const parsed = input.safeParse(raw);
  if (!parsed.success) throw new InputError("feedbackInvalid");
  const f = parsed.data;
  if (f.website) return { saved: false };
  await consume(db, [
    { key: rateKey("feedback-ip", ctx.ip), max: 5, windowMs: DAY, error: "rateFeedback" },
    { key: "feedback:global", max: 30, windowMs: HOUR, error: "rateFeedbackGlobal" },
  ]);
  const answers = Object.fromEntries(Object.entries(f.answers ?? {}).filter(([, v]) => v)) as FeedbackAnswers;
  await db.insert(feedbackResponses).values({
    id: newId("fb"),
    cohort: f.cohort,
    locale: ctx.locale,
    completed: f.completed,
    minutes: f.minutes ?? null,
    ease: f.ease,
    nps: f.nps,
    answers,
    about: f.about ?? null,
    device: f.device ?? null,
    quoteOk: f.quoteOk,
    userId: f.attachAccount && ctx.userId ? ctx.userId : null,
  });
  return { saved: true };
}

export type FeedbackFilter = { range: Range; cohort?: string | null };

const where = (f: FeedbackFilter) => {
  const start = rangeStart(f.range);
  return and(start ? gte(feedbackResponses.createdAt, start) : undefined, f.cohort ? eq(feedbackResponses.cohort, f.cohort) : undefined);
};

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export type FeedbackSummary = Awaited<ReturnType<typeof feedbackSummary>>;

/** Headline numbers for the admin feedback page. Every figure carries its sample size through `n`. */
export async function feedbackSummary(db: Db, f: FeedbackFilter) {
  const rows = await db
    .select({ completed: feedbackResponses.completed, minutes: feedbackResponses.minutes, ease: feedbackResponses.ease, nps: feedbackResponses.nps })
    .from(feedbackResponses)
    .where(where(f));
  const completed: Record<FeedbackCompleted, number> = { unaided: 0, aided: 0, no: 0 };
  const easeDist = [0, 0, 0, 0, 0];
  const npsDist = Array<number>(11).fill(0);
  for (const r of rows) {
    completed[r.completed] += 1;
    easeDist[r.ease - 1] += 1;
    npsDist[r.nps] += 1;
  }
  const scores = rows.map((r) => r.nps);
  const cohorts = await db.selectDistinct({ c: feedbackResponses.cohort }).from(feedbackResponses).where(isNotNull(feedbackResponses.cohort));
  return {
    n: rows.length,
    completed,
    medianMinutes: median(rows.flatMap((r) => (r.minutes === null ? [] : [r.minutes]))),
    avgEase: rows.length ? Math.round((rows.reduce((s, r) => s + r.ease, 0) / rows.length) * 10) / 10 : null,
    nps: {
      score: npsScore(scores),
      promoters: scores.filter((s) => s >= 9).length,
      passives: scores.filter((s) => s === 7 || s === 8).length,
      detractors: scores.filter((s) => s <= 6).length,
    },
    easeDist,
    npsDist,
    cohorts: cohorts.map((c) => c.c!).sort(),
  };
}

export type FeedbackRow = Omit<typeof feedbackResponses.$inferSelect, "createdAt" | "userId"> & {
  createdAt: string;
  account: { email: string; furthest: keyof Funnel } | null;
};

/** Responses, newest first, with the attached account's email and progress where the tester chose to share it. */
export async function listFeedback(db: Db, f: FeedbackFilter & { limit?: number }): Promise<FeedbackRow[]> {
  const rows = await db
    .select({ r: feedbackResponses, email: users.email })
    .from(feedbackResponses)
    .leftJoin(users, eq(users.id, feedbackResponses.userId))
    .where(where(f))
    .orderBy(desc(feedbackResponses.createdAt))
    .limit(f.limit ?? 500);
  return Promise.all(
    rows.map(async ({ r, email }) => {
      const { userId, createdAt, ...rest } = r;
      return { ...rest, createdAt: createdAt.toISOString(), account: userId && email ? { email, furthest: await furthestStep(db, userId) } : null };
    }),
  );
}

import { and, eq, gte, sql, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Db } from "@/lib/db/client";
import {
  approvals,
  businesses,
  cases,
  events,
  feedbackResponses,
  invoices,
  memberships,
  otpCodes,
  outbox,
  postings,
  rateEvents,
  refunds,
  transfers,
  users,
  type Account,
  type CaseKind,
  type CaseStatus,
  type RefundStatus,
} from "@/lib/db/schema";
import { balancesFrom } from "@/lib/domain/ledger";
import { env } from "@/lib/env";

export type Range = "7d" | "30d" | "all";
export const RANGES: Range[] = ["7d", "30d", "all"];
export const parseRange = (v: unknown): Range => (RANGES.includes(v as Range) ? (v as Range) : "30d");

const DAY = 864e5;
/** Start of the range, or null for all time. */
export const rangeStart = (range: Range, now = Date.now()): Date | null => (range === "all" ? null : new Date(now - (range === "7d" ? 7 : 30) * DAY));

export type Tile = { total: number; inRange: number };
export type Funnel = { signedUp: number; inCompany: number; invoiced: number; paid: number; resolved: number; refunded: number };
export const FUNNEL_STEPS: (keyof Funnel)[] = ["signedUp", "inCompany", "invoiced", "paid", "resolved", "refunded"];

export type Overview = {
  tiles: {
    users: Tile;
    companies: Tile;
    activeCompanies: number;
    invoices: Tile;
    sampleInvoices: number;
    payments: Tile;
    openCases: number;
    feedback: Tile;
    nps: number | null;
  };
  growth: { day: string; users: number; companies: number }[];
  funnel: Funnel;
  cases: { byKind: Record<CaseKind, number>; byStatus: Record<CaseStatus, number>; medianMinutesToResolve: number | null };
  approvals: { total: number; invalidated: number };
  refunds: Record<RefundStatus, number>;
  /** Platform-wide balances in base units (all time). Never broken down by company. */
  money: { received: string; invoice: string; credit: string; refundPending: string; refunded: string; unresolved: string };
  system: { emailPending: number; emailFailed: number; codes24h: number; faucet24h: number; cluster: string };
};

const n = sql<number>`count(*)`.mapWith(Number);
const since = (col: PgColumn, start: Date | null) => (start ? gte(col, start) : undefined);

async function tile(db: Db, table: PgTable, col: PgColumn, start: Date | null, where?: SQL): Promise<Tile> {
  const inRange = start ? sql<number>`count(*) filter (where ${col} >= ${start.toISOString()}::timestamptz)`.mapWith(Number) : n;
  const [r] = await db.select({ total: n, inRange }).from(table).where(where);
  return { total: r?.total ?? 0, inRange: r?.inRange ?? 0 };
}

/** Net Promoter Score: % promoters (9–10) minus % detractors (0–6). Null without responses. */
export function npsScore(scores: number[]): number | null {
  if (!scores.length) return null;
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

/** Per-user activation, for users who signed up in the range (everyone for "all"). */
async function funnel(db: Db, start: Date | null): Promise<Funnel> {
  const cohort = since(users.createdAt, start);
  const [{ signedUp }] = await db.select({ signedUp: n }).from(users).where(cohort);
  const reached = async (companies: SQL | null) => {
    const [r] = await db
      .select({ v: sql<number>`count(distinct ${memberships.userId})`.mapWith(Number) })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(and(cohort, companies ? sql`${memberships.businessId} in (${companies})` : undefined));
    return r?.v ?? 0;
  };
  return {
    signedUp,
    inCompany: await reached(null),
    invoiced: await reached(sql`select business_id from invoices where sample = false union select business_id from transfers where direction = 'in'`),
    paid: await reached(sql`select business_id from transfers where direction = 'in'`),
    resolved: await reached(sql`select business_id from cases where status = 'resolved'`),
    refunded: await reached(sql`select business_id from refunds where status = 'confirmed'`),
  };
}

async function growth(db: Db, range: Range) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const first = new Date(today - (days - 1) * DAY);
  const perDay = async (table: PgTable, col: PgColumn) => {
    const day = sql<string>`to_char(${col} at time zone 'UTC', 'YYYY-MM-DD')`;
    const rows = await db.select({ day, v: n }).from(table).where(gte(col, first)).groupBy(day);
    return new Map(rows.map((r) => [r.day, r.v]));
  };
  const u = await perDay(users, users.createdAt);
  const c = await perDay(businesses, businesses.createdAt);
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(first.getTime() + i * DAY).toISOString().slice(0, 10);
    return { day, users: u.get(day) ?? 0, companies: c.get(day) ?? 0 };
  });
}

/** Everything on the admin overview. Aggregates only: no row identifies a person or a company's figures. */
export async function overviewStats(db: Db, range: Range): Promise<Overview> {
  const start = rangeStart(range);
  const dayAgo = new Date(Date.now() - DAY);

  const [{ active }] = await db
    .select({ active: sql<number>`count(distinct ${events.businessId})`.mapWith(Number) })
    .from(events)
    .where(since(events.createdAt, start));
  const [{ sample }] = await db.select({ sample: n }).from(invoices).where(eq(invoices.sample, true));
  const [{ open }] = await db.select({ open: n }).from(cases).where(sql`${cases.status} <> 'resolved'`);
  const scores = (await db.select({ nps: feedbackResponses.nps }).from(feedbackResponses).where(since(feedbackResponses.createdAt, start))).map((r) => r.nps);

  const byKind: Record<CaseKind, number> = { overpayment: 0, duplicate: 0, unmatched: 0 };
  const byStatus: Record<CaseStatus, number> = { open: 0, proposed: 0, approved: 0, executing: 0, resolved: 0 };
  for (const r of await db.select({ kind: cases.kind, status: cases.status, v: n }).from(cases).where(since(cases.createdAt, start)).groupBy(cases.kind, cases.status)) {
    byKind[r.kind] += r.v;
    byStatus[r.status] += r.v;
  }
  const [{ median }] = await db
    .select({
      median: sql<number | null>`percentile_cont(0.5) within group (order by extract(epoch from (${cases.resolvedAt} - ${cases.createdAt})) / 60)`.mapWith((v) =>
        v === null ? null : Math.round(Number(v)),
      ),
    })
    .from(cases)
    .where(and(sql`${cases.resolvedAt} is not null`, since(cases.createdAt, start)));

  const [appr] = await db
    .select({ total: n, invalidated: sql<number>`count(*) filter (where ${approvals.invalidatedAt} is not null)`.mapWith(Number) })
    .from(approvals)
    .where(since(approvals.createdAt, start));

  const refundCounts: Record<RefundStatus, number> = { awaiting_signature: 0, submitted: 0, confirmed: 0, failed: 0 };
  for (const r of await db.select({ status: refunds.status, v: n }).from(refunds).where(since(refunds.createdAt, start)).groupBy(refunds.status)) refundCounts[r.status] = r.v;

  const sums = await db
    .select({ account: postings.account, amount: sql<string>`coalesce(sum(${postings.amount}), 0)`.mapWith((v) => BigInt(v)) })
    .from(postings)
    .groupBy(postings.account);
  const b = balancesFrom(sums as { account: Account; amount: bigint }[]);

  const [mail] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${outbox.status} = 'pending')`.mapWith(Number),
      failed: sql<number>`count(*) filter (where ${outbox.status} = 'failed')`.mapWith(Number),
    })
    .from(outbox);
  const [{ codes }] = await db.select({ codes: n }).from(otpCodes).where(gte(otpCodes.createdAt, dayAgo));
  // Every faucet use records one "faucet:global" event (see the faucet action's limits).
  const [{ faucet }] = await db.select({ faucet: n }).from(rateEvents).where(and(eq(rateEvents.key, "faucet:global"), gte(rateEvents.createdAt, dayAgo)));

  return {
    tiles: {
      users: await tile(db, users, users.createdAt, start),
      companies: await tile(db, businesses, businesses.createdAt, start),
      activeCompanies: active,
      invoices: await tile(db, invoices, invoices.createdAt, start, eq(invoices.sample, false)),
      sampleInvoices: sample,
      payments: await tile(db, transfers, transfers.createdAt, start, eq(transfers.direction, "in")),
      openCases: open,
      feedback: await tile(db, feedbackResponses, feedbackResponses.createdAt, start),
      nps: npsScore(scores),
    },
    growth: await growth(db, range),
    funnel: await funnel(db, start),
    cases: { byKind, byStatus, medianMinutesToResolve: median },
    approvals: { total: appr?.total ?? 0, invalidated: appr?.invalidated ?? 0 },
    refunds: refundCounts,
    money: {
      received: b.received.toString(),
      invoice: b.invoice.toString(),
      credit: b.credit.toString(),
      refundPending: b.refund_pending.toString(),
      refunded: b.refunded.toString(),
      unresolved: b.unresolved.toString(),
    },
    system: { emailPending: mail?.pending ?? 0, emailFailed: mail?.failed ?? 0, codes24h: codes, faucet24h: faucet, cluster: env().SOLANA_CLUSTER },
  };
}

/** The last funnel step one user has reached (for feedback from an attached account). */
export async function furthestStep(db: Db, userId: string): Promise<keyof Funnel> {
  const companies = sql`(select business_id from memberships where user_id = ${userId})`;
  const has = async (q: SQL) => ((await db.execute<{ ok: boolean }>(sql`select exists (${q}) as ok`)).rows[0]?.ok ?? false) as boolean;
  if (await has(sql`select 1 from refunds where status = 'confirmed' and business_id in ${companies}`)) return "refunded";
  if (await has(sql`select 1 from cases where status = 'resolved' and business_id in ${companies}`)) return "resolved";
  if (await has(sql`select 1 from transfers where direction = 'in' and business_id in ${companies}`)) return "paid";
  if (await has(sql`select 1 from invoices where sample = false and business_id in ${companies}`)) return "invoiced";
  if (await has(sql`select 1 from memberships where user_id = ${userId}`)) return "inCompany";
  return "signedUp";
}

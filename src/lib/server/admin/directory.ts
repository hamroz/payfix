import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { Db } from "@/lib/db/client";
import { businesses, cases, customers, feedbackResponses, invoices, memberships, otpCodes, refunds, sessions, transfers, users, type Role } from "@/lib/db/schema";
import { isAdminEmail } from "./access";

// What a platform admin may see about accounts and companies: identities and counts. Never a
// company's customers, invoice contents, amounts, wallets, references, or links.

export const PAGE_SIZE = 50;
export type StatusFilter = "all" | "active" | "suspended";
export type DirectoryQuery = { search?: string; status?: StatusFilter; page?: number };

const DAY = 864e5;
/** `search` as a literal substring (its % and _ don't act as wildcards). */
const contains = (search: string) => `%${search.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
const n = sql<number>`count(*)`.mapWith(Number);
/** 1-based page, clamped so odd input (NaN, 1e20) is never an out-of-range database offset. */
const page = (q: DirectoryQuery) => {
  const n = Math.floor(Number(q.page ?? 1));
  return Number.isFinite(n) ? Math.min(Math.max(1, n), 10_000) : 1;
};

export type UserRow = { id: string; email: string; createdAt: string; companies: number; suspended: boolean; codes24h: number; admin: boolean };

export async function listUsers(db: Db, q: DirectoryQuery): Promise<{ rows: UserRow[]; total: number }> {
  const where = and(
    q.search?.trim() ? ilike(users.email, contains(q.search)) : undefined,
    q.status === "suspended" ? isNotNull(users.suspendedAt) : q.status === "active" ? isNull(users.suspendedAt) : undefined,
  );
  const [{ total }] = await db.select({ total: n }).from(users).where(where);
  const dayAgo = new Date(Date.now() - DAY).toISOString();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      suspendedAt: users.suspendedAt,
      companies: sql<number>`(select count(*) from memberships m where m.user_id = "users"."id")`.mapWith(Number),
      codes24h: sql<number>`(select count(*) from otp_codes o where o.email = "users"."email" and o.created_at >= ${dayAgo}::timestamptz)`.mapWith(Number),
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(PAGE_SIZE)
    .offset((page(q) - 1) * PAGE_SIZE);
  return {
    total,
    rows: rows.map((r) => ({
      id: r.id,
      email: r.email,
      createdAt: r.createdAt.toISOString(),
      companies: r.companies,
      suspended: !!r.suspendedAt,
      codes24h: r.codes24h,
      admin: isAdminEmail(r.email),
    })),
  };
}

export async function userDetail(db: Db, id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) return null;
  const companies = await db
    .select({ id: businesses.id, name: businesses.name, role: memberships.role, suspendedAt: businesses.suspendedAt })
    .from(memberships)
    .innerJoin(businesses, eq(businesses.id, memberships.businessId))
    .where(eq(memberships.userId, id))
    .orderBy(asc(memberships.createdAt));
  const codesSince = async (ms: number) =>
    (await db.select({ v: n }).from(otpCodes).where(and(eq(otpCodes.email, user.email), gte(otpCodes.createdAt, new Date(Date.now() - ms)))))[0].v;
  const [{ live }] = await db
    .select({ live: n })
    .from(sessions)
    .where(and(eq(sessions.kind, "business"), eq(sessions.subjectId, id), gte(sessions.expiresAt, new Date())));
  const [{ created }] = await db.select({ created: n }).from(businesses).where(eq(businesses.ownerEmail, user.email));
  const [{ fb }] = await db.select({ fb: n }).from(feedbackResponses).where(eq(feedbackResponses.userId, id));
  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      suspendedAt: user.suspendedAt?.toISOString() ?? null,
      suspendedReason: user.suspendedReason,
      admin: isAdminEmail(user.email),
    },
    companies: companies.map((c) => ({ id: c.id, name: c.name, role: c.role as Role, suspended: !!c.suspendedAt })),
    activeSessions: live,
    codes24h: await codesSince(DAY),
    codes7d: await codesSince(7 * DAY),
    companiesCreated: created,
    feedback: fb,
  };
}

export type CompanyRow = { id: string; name: string; createdAt: string; members: number; invoices: number; payments: number; openCases: number; suspended: boolean; sample: boolean };

export async function listCompanies(db: Db, q: DirectoryQuery): Promise<{ rows: CompanyRow[]; total: number }> {
  const where = and(
    q.search?.trim() ? ilike(businesses.name, contains(q.search)) : undefined,
    q.status === "suspended" ? isNotNull(businesses.suspendedAt) : q.status === "active" ? isNull(businesses.suspendedAt) : undefined,
  );
  const [{ total }] = await db.select({ total: n }).from(businesses).where(where);
  const rows = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      createdAt: businesses.createdAt,
      suspendedAt: businesses.suspendedAt,
      members: sql<number>`(select count(*) from memberships m where m.business_id = "businesses"."id")`.mapWith(Number),
      invoices: sql<number>`(select count(*) from invoices i where i.business_id = "businesses"."id" and i.sample = false)`.mapWith(Number),
      payments: sql<number>`(select count(*) from transfers t where t.business_id = "businesses"."id" and t.direction = 'in')`.mapWith(Number),
      openCases: sql<number>`(select count(*) from cases c where c.business_id = "businesses"."id" and c.status <> 'resolved')`.mapWith(Number),
      sample: sql<boolean>`exists (select 1 from invoices i where i.business_id = "businesses"."id" and i.sample = true)`,
    })
    .from(businesses)
    .where(where)
    .orderBy(desc(businesses.createdAt))
    .limit(PAGE_SIZE)
    .offset((page(q) - 1) * PAGE_SIZE);
  return {
    total,
    rows: rows.map(({ suspendedAt, createdAt, ...r }) => ({ ...r, createdAt: createdAt.toISOString(), suspended: !!suspendedAt, sample: !!r.sample })),
  };
}

export async function companyDetail(db: Db, id: string) {
  const [company] = await db.select({ id: businesses.id, name: businesses.name, createdAt: businesses.createdAt, suspendedAt: businesses.suspendedAt, suspendedReason: businesses.suspendedReason }).from(businesses).where(eq(businesses.id, id));
  if (!company) return null;
  const members = await db
    .select({ userId: users.id, email: users.email, role: memberships.role })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.businessId, id))
    .orderBy(asc(memberships.createdAt));
  const countWhere = async (table: PgTable, where: SQL | undefined) => (await db.select({ v: count() }).from(table).where(where))[0].v;
  return {
    company: { ...company, createdAt: company.createdAt.toISOString(), suspendedAt: company.suspendedAt?.toISOString() ?? null },
    members: members.map((m) => ({ ...m, role: m.role as Role })),
    counts: {
      invoices: await countWhere(invoices, and(eq(invoices.businessId, id), eq(invoices.sample, false))),
      payments: await countWhere(transfers, and(eq(transfers.businessId, id), eq(transfers.direction, "in"))),
      openCases: await countWhere(cases, and(eq(cases.businessId, id), sql`${cases.status} <> 'resolved'`)),
      customers: await countWhere(customers, eq(customers.businessId, id)),
    },
    inFlightRefunds: await countWhere(refunds, and(eq(refunds.businessId, id), inArray(refunds.status, ["awaiting_signature", "submitted"]))),
  };
}

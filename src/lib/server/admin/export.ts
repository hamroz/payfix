import { and, asc, desc, gte } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { adminAudit } from "@/lib/db/schema";
import type { Messages } from "@/lib/i18n/messages";
import { listFeedback } from "../feedback";
import { listCompanies, listUsers, PAGE_SIZE } from "./directory";
import { overviewStats, rangeStart, type Range } from "./stats";

export const EXPORT_KINDS = ["users", "companies", "feedback", "daily", "audit"] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

type Cell = string | number | boolean | null | undefined;

/**
 * RFC 4180 CSV. Text that a spreadsheet would run as a formula (starting with = + - @) gets a
 * leading apostrophe, so a company name or survey answer can't execute in the admin's spreadsheet.
 */
export function toCsv(header: string[], rows: Cell[][]): string {
  const cell = (v: Cell) => {
    if (v === null || v === undefined) return "";
    let s = String(v);
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(cell).join(",")).join("\n") + "\n";
}

/** Every page of a paged directory listing. */
async function everyPage<T>(fetch: (page: number) => Promise<{ rows: T[]; total: number }>) {
  const out: T[] = [];
  for (let page = 1; ; page++) {
    const { rows, total } = await fetch(page);
    out.push(...rows);
    if (rows.length < PAGE_SIZE || out.length >= total) return out;
  }
}

const inRange = (iso: string, start: Date | null) => !start || new Date(iso) >= start;

/** One admin export. Contains only what the admin pages show; headers are in the admin's language. */
export async function exportCsv(db: Db, kind: ExportKind, range: Range, m: Messages, opts: { cohort?: string | null } = {}): Promise<{ csv: string; rows: number }> {
  const c = m.admin.export.columns;
  const a = m.admin;
  const start = rangeStart(range);
  const yesNo = (v: boolean) => (v ? a.yes : a.no);
  const status = (suspended: boolean) => (suspended ? a.status.suspended : a.status.active);
  let header: string[];
  let rows: Cell[][];

  switch (kind) {
    case "users": {
      const users = (await everyPage((page) => listUsers(db, { page }))).filter((u) => inRange(u.createdAt, start));
      header = [c.email, c.joined, c.companies, c.status, c.codes24h];
      rows = users.map((u) => [u.email, u.createdAt, u.companies, status(u.suspended), u.codes24h]);
      break;
    }
    case "companies": {
      const companies = (await everyPage((page) => listCompanies(db, { page }))).filter((x) => inRange(x.createdAt, start));
      header = [c.name, c.created, c.members, c.invoices, c.payments, c.openCases, c.status, c.sample];
      rows = companies.map((x) => [x.name, x.createdAt, x.members, x.invoices, x.payments, x.openCases, status(x.suspended), yesNo(x.sample)]);
      break;
    }
    case "feedback": {
      // Column order follows docs/evidence-log.md so rows paste straight in.
      const q = m.feedback.questions;
      header = [c.date, c.cohort, c.about, c.device, c.completed, c.minutes, c.ease, c.nps, q.hesitated, q.happened, q.voidedApproval, q.currentProcess, q.receiptTrust, q.blockers, c.quoteOk, c.language, c.account, c.furthest];
      const list = await listFeedback(db, { range, cohort: opts.cohort, limit: 100_000 });
      rows = list.map((f) => [
        f.createdAt,
        f.cohort,
        f.about,
        f.device ? m.feedback.device[f.device] : null,
        a.feedback.completed[f.completed],
        f.minutes,
        f.ease,
        f.nps,
        f.answers.hesitated,
        f.answers.happened,
        f.answers.voidedApproval,
        f.answers.currentProcess,
        f.answers.receiptTrust,
        f.answers.blockers,
        yesNo(f.quoteOk),
        f.locale,
        f.account?.email,
        f.account ? a.funnelSteps[f.account.furthest] : null,
      ]);
      break;
    }
    case "daily": {
      const { growth } = await overviewStats(db, range);
      header = [c.day, c.newUsers, c.newCompanies];
      rows = growth.map((g) => [g.day, g.users, g.companies]);
      break;
    }
    case "audit": {
      const list = await db
        .select()
        .from(adminAudit)
        .where(and(start ? gte(adminAudit.createdAt, start) : undefined))
        .orderBy(desc(adminAudit.createdAt), asc(adminAudit.id));
      header = [c.date, c.admin, c.action, c.targetType, c.targetId, c.reason];
      rows = list.map((r) => [r.createdAt.toISOString(), r.adminEmail, r.action, r.targetType, r.targetId, r.reason]);
      break;
    }
  }
  return { csv: toCsv(header, rows), rows: rows.length };
}

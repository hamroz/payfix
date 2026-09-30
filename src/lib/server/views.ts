import "server-only";
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  approvals,
  caseTransfers,
  cases,
  customers,
  events,
  invoices,
  journalEntries,
  postings,
  proposals,
  refundAttempts,
  refunds,
  resolutionLinks,
  transfers,
  type CaseKind,
  type CaseStatus,
} from "@/lib/db/schema";
import { businessBalances, caseAvailable, customerCredit, invoicesWithBalances } from "./queries";

const s = (v: bigint) => v.toString();

export type CaseRow = {
  id: string;
  kind: CaseKind;
  status: CaseStatus;
  customerName: string | null;
  invoiceNumber: string | null;
  available: string;
  original: string;
  createdAt: string;
};

export async function caseRows(db: Db, businessId: string, opts: { openOnly?: boolean } = {}): Promise<CaseRow[]> {
  const rows = await db
    .select({ c: cases, customerName: customers.name, invoiceNumber: invoices.number })
    .from(cases)
    .leftJoin(customers, eq(customers.id, cases.customerId))
    .leftJoin(invoices, eq(invoices.id, cases.invoiceId))
    .where(and(eq(cases.businessId, businessId), opts.openOnly ? sql`${cases.status} <> 'resolved'` : undefined))
    .orderBy(desc(cases.createdAt));
  const out: CaseRow[] = [];
  for (const r of rows) {
    const [orig] = await db
      .select({ v: sql<string>`coalesce(sum(${postings.amount}), 0)`.mapWith((v) => BigInt(v)) })
      .from(postings)
      .innerJoin(journalEntries, eq(journalEntries.id, postings.entryId))
      .where(
        and(
          eq(postings.account, "unresolved"),
          sql`${postings.amount} > 0`,
          sql`${postings.transferId} in (select transfer_id from ${caseTransfers} where case_id = ${r.c.id})`,
        ),
      );
    // Original excess = what landed in unresolved minus what was auto-applied before the case opened.
    const applied = await db
      .select({ v: sql<string>`coalesce(sum(-${postings.amount}), 0)`.mapWith((v) => BigInt(v)) })
      .from(postings)
      .innerJoin(journalEntries, eq(journalEntries.id, postings.entryId))
      .where(
        and(
          eq(postings.account, "unresolved"),
          eq(journalEntries.kind, "apply"),
          sql`${postings.transferId} in (select transfer_id from ${caseTransfers} where case_id = ${r.c.id})`,
        ),
      );
    out.push({
      id: r.c.id,
      kind: r.c.kind,
      status: r.c.status,
      customerName: r.customerName,
      invoiceNumber: r.invoiceNumber,
      available: s(await caseAvailable(db, r.c.id)),
      original: s((orig?.v ?? 0n) - (applied[0]?.v ?? 0n)),
      createdAt: r.c.createdAt.toISOString(),
    });
  }
  return out;
}

export type EventRow = { id: string; type: string; actor: string; message: string; createdAt: string; caseId: string | null; invoiceId: string | null };

export async function recentEvents(db: Db, where: { businessId: string; caseId?: string; invoiceId?: string }, limit = 20): Promise<EventRow[]> {
  const rows = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.businessId, where.businessId),
        where.caseId ? eq(events.caseId, where.caseId) : undefined,
        where.invoiceId ? eq(events.invoiceId, where.invoiceId) : undefined,
      ),
    )
    .orderBy(desc(events.createdAt), desc(events.id))
    .limit(limit);
  return rows.map((e) => ({ id: e.id, type: e.type, actor: e.actor, message: e.message, createdAt: e.createdAt.toISOString(), caseId: e.caseId, invoiceId: e.invoiceId }));
}

export async function dashboardView(db: Db, businessId: string) {
  const balances = await businessBalances(db, businessId);
  const open = await caseRows(db, businessId, { openOnly: true });
  const activity = await recentEvents(db, { businessId }, 14);
  const invs = await invoicesWithBalances(db, { businessId });
  const types = new Set((await db.select({ t: events.type }).from(events).where(eq(events.businessId, businessId))).map((r) => r.t));
  const [firstCase] = await db.select().from(cases).where(eq(cases.businessId, businessId)).orderBy(asc(cases.createdAt)).limit(1);
  return {
    balances: {
      received: s(balances.received),
      invoice: s(balances.invoice),
      credit: s(balances.credit),
      refundPending: s(balances.refund_pending),
      refunded: s(balances.refunded),
      unresolved: s(balances.unresolved),
    },
    open,
    activity,
    invoices: invs.slice(0, 6).map(invoiceRow),
    demo: {
      firstInvoiceId: invs.length ? invs[invs.length - 1].id : null,
      firstCaseId: firstCase?.id ?? null,
      partial: invs.some((i) => i.applied > 0n && i.applied < i.amount) || types.has("payment.received"),
      overpaid: types.has("case.opened"),
      linkSent: types.has("link.sent"),
      proposed: types.has("proposal.submitted"),
      approved: types.has("proposal.approved"),
      invalidated: types.has("approval.invalidated"),
      executed: types.has("plan.executed"),
      refunded: types.has("refund.confirmed"),
    },
  };
}

type InvoiceWithBalance = Awaited<ReturnType<typeof invoicesWithBalances>>[number];

export function invoiceRow(i: InvoiceWithBalance & { customerName?: string }) {
  const status = i.applied >= i.amount ? "paid" : i.applied > 0n ? "partial" : i.dueAt < new Date() ? "overdue" : "open";
  return {
    id: i.id,
    number: i.number,
    title: i.title,
    amount: s(i.amount),
    applied: s(i.applied),
    remaining: s(i.remaining),
    dueAt: i.dueAt.toISOString(),
    status: status as "paid" | "partial" | "overdue" | "open",
    customerId: i.customerId,
    customerName: i.customerName ?? null,
  };
}
export type InvoiceRow = ReturnType<typeof invoiceRow>;

export async function invoiceList(db: Db, businessId: string) {
  const invs = await invoicesWithBalances(db, { businessId });
  const custs = await db.select().from(customers).where(eq(customers.businessId, businessId));
  const names = new Map(custs.map((c) => [c.id, c.name]));
  return invs.map((i) => invoiceRow({ ...i, customerName: names.get(i.customerId) }));
}

export type TransferRow = {
  id: string;
  signature: string;
  direction: "in" | "out";
  amount: string;
  counterparty: string | null;
  flags: string[];
  blockTime: string | null;
  invoiceNumber: string | null;
  appliedHere: string;
};

/** `appliedTo` scopes appliedHere to one invoice; defaults to the invoice being listed. */
export async function transferRows(db: Db, where: { invoiceId?: string; transferIds?: string[]; appliedTo?: string }): Promise<TransferRow[]> {
  const appliedTo = where.appliedTo ?? where.invoiceId;
  if (where.transferIds && where.transferIds.length === 0) return [];
  const rows = await db
    .select({ t: transfers, invoiceNumber: invoices.number })
    .from(transfers)
    .leftJoin(invoices, eq(invoices.id, transfers.invoiceId))
    .where(where.invoiceId ? eq(transfers.invoiceId, where.invoiceId) : inArray(transfers.id, where.transferIds!))
    .orderBy(asc(transfers.slot));
  const out: TransferRow[] = [];
  for (const r of rows) {
    const [applied] = await db
      .select({ v: sql<string>`coalesce(sum(${postings.amount}), 0)`.mapWith((v) => BigInt(v)) })
      .from(postings)
      .where(and(eq(postings.transferId, r.t.id), eq(postings.account, "invoice"), appliedTo ? eq(postings.invoiceId, appliedTo) : undefined));
    out.push({
      id: r.t.id,
      signature: r.t.signature,
      direction: r.t.direction,
      amount: s(r.t.amount),
      counterparty: r.t.counterpartyOwner,
      flags: r.t.flags,
      blockTime: (r.t.blockTime ?? r.t.createdAt).toISOString(),
      invoiceNumber: r.invoiceNumber,
      appliedHere: s(applied?.v ?? 0n),
    });
  }
  return out;
}

export async function invoiceDetail(db: Db, businessId: string, invoiceId: string) {
  const [row] = await db
    .select({ i: invoices, customer: customers })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.businessId, businessId)));
  if (!row) return null;
  const [withBal] = (await invoicesWithBalances(db, { businessId, customerId: row.customer.id })).filter((i) => i.id === invoiceId);
  // Money applied here that came from other sources (e.g. another invoice's excess via a resolution).
  const credited = await db
    .select({ amount: postings.amount, caseId: postings.caseId, memo: journalEntries.memo, createdAt: journalEntries.createdAt })
    .from(postings)
    .innerJoin(journalEntries, eq(journalEntries.id, postings.entryId))
    .where(and(eq(postings.invoiceId, invoiceId), eq(postings.account, "invoice"), eq(journalEntries.kind, "resolution")));
  return {
    invoice: invoiceRow({ ...withBal, customerName: row.customer.name }),
    customer: { id: row.customer.id, name: row.customer.name, email: row.customer.email },
    transfers: await transferRows(db, { invoiceId }),
    allocations: credited.map((c) => ({ amount: s(c.amount), caseId: c.caseId, memo: c.memo, createdAt: c.createdAt.toISOString() })),
    activity: await recentEvents(db, { businessId, invoiceId }, 20),
    cases: (await caseRows(db, businessId)).filter((c) => c.invoiceNumber === row.i.number),
  };
}

export async function caseDetail(db: Db, caseId: string) {
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId));
  if (!c) return null;
  const customer = c.customerId ? (await db.select().from(customers).where(eq(customers.id, c.customerId)))[0] : null;
  const [invoice] = c.invoiceId ? await db.select().from(invoices).where(eq(invoices.id, c.invoiceId)) : [];
  const trIds = (await db.select({ id: caseTransfers.transferId }).from(caseTransfers).where(eq(caseTransfers.caseId, c.id))).map((r) => r.id);
  const props = await db.select().from(proposals).where(eq(proposals.caseId, c.id)).orderBy(desc(proposals.version));
  const aps = props.length ? await db.select().from(approvals).where(inArray(approvals.proposalId, props.map((p) => p.id))).orderBy(desc(approvals.createdAt)) : [];
  const [refund] = await db.select().from(refunds).where(eq(refunds.caseId, c.id)).orderBy(desc(refunds.createdAt)).limit(1);
  const attempts = refund ? await db.select().from(refundAttempts).where(eq(refundAttempts.refundId, refund.id)).orderBy(desc(refundAttempts.createdAt)) : [];
  const openInvoices = customer ? (await invoicesWithBalances(db, { businessId: c.businessId, customerId: customer.id })).map((i) => invoiceRow({ ...i, customerName: customer.name })) : [];
  const allInvoiceNumbers = new Map((await db.select({ id: invoices.id, number: invoices.number }).from(invoices).where(eq(invoices.businessId, c.businessId))).map((i) => [i.id, i.number]));
  const [link] = await db
    .select()
    .from(resolutionLinks)
    .where(and(eq(resolutionLinks.caseId, c.id), isNull(resolutionLinks.revokedAt)))
    .orderBy(desc(resolutionLinks.createdAt))
    .limit(1);
  const trs = await transferRows(db, { transferIds: trIds, appliedTo: invoice?.id });
  const invoicePaid = invoice
    ? (await db.select({ amount: transfers.amount }).from(transfers).where(and(eq(transfers.invoiceId, invoice.id), eq(transfers.direction, "in")))).reduce((a, t) => a + t.amount, 0n)
    : 0n;

  const resolution = await db
    .select({ account: postings.account, amount: postings.amount, invoiceId: postings.invoiceId })
    .from(postings)
    .where(and(eq(postings.caseId, c.id), sql`${postings.amount} > 0`));

  return {
    case: { id: c.id, kind: c.kind, status: c.status, createdAt: c.createdAt.toISOString(), resolvedAt: c.resolvedAt?.toISOString() ?? null, businessId: c.businessId },
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    invoice: invoice ? { id: invoice.id, number: invoice.number, title: invoice.title, amount: s(invoice.amount) } : null,
    available: s(await caseAvailable(db, c.id)),
    credit: customer ? s(await customerCredit(db, customer.id)) : "0",
    transfers: trs,
    received: s(trs.filter((t) => t.direction === "in").reduce((a, t) => a + BigInt(t.amount), 0n)),
    invoicePaid: s(invoicePaid),
    proposals: props.map((p) => ({
      id: p.id,
      version: p.version,
      status: p.status,
      lines: p.lines,
      refundDestination: p.refundDestination,
      proofMethod: p.destinationProof?.method ?? null,
      available: s(p.available),
      hash: p.hash,
      note: p.note,
      createdAt: p.createdAt.toISOString(),
      approvals: aps
        .filter((a) => a.proposalId === p.id)
        .map((a) => ({ id: a.id, approvedBy: a.approvedBy, createdAt: a.createdAt.toISOString(), invalidatedAt: a.invalidatedAt?.toISOString() ?? null, invalidatedReason: a.invalidatedReason, hash: a.proposalHash })),
    })),
    refund: refund
      ? {
          id: refund.id,
          amount: s(refund.amount),
          destination: refund.destinationOwner,
          status: refund.status,
          signature: refund.signature,
          confirmedAt: refund.confirmedAt?.toISOString() ?? null,
          attempts: attempts.map((a) => ({ id: a.id, status: a.status, signature: a.signature, error: a.error, createdAt: a.createdAt.toISOString() })),
        }
      : null,
    applied: resolution.map((r) => ({ account: r.account, amount: s(r.amount), invoiceNumber: r.invoiceId ? (allInvoiceNumbers.get(r.invoiceId) ?? null) : null })),
    openInvoices,
    invoiceNumbers: Object.fromEntries(allInvoiceNumbers),
    linkActive: Boolean(link && link.expiresAt > new Date()),
    activity: await recentEvents(db, { businessId: c.businessId, caseId: c.id }, 40),
  };
}
export type CaseDetail = NonNullable<Awaited<ReturnType<typeof caseDetail>>>;

export async function ledgerView(db: Db, businessId: string) {
  const entries = await db.select().from(journalEntries).where(eq(journalEntries.businessId, businessId)).orderBy(desc(journalEntries.createdAt)).limit(200);
  const ps = entries.length ? await db.select().from(postings).where(inArray(postings.entryId, entries.map((e) => e.id))) : [];
  const nums = new Map((await db.select({ id: invoices.id, number: invoices.number }).from(invoices).where(eq(invoices.businessId, businessId))).map((i) => [i.id, i.number]));
  return entries.map((e) => ({
    id: e.id,
    kind: e.kind,
    memo: e.memo,
    caseId: e.caseId,
    createdAt: e.createdAt.toISOString(),
    postings: ps
      .filter((p) => p.entryId === e.id)
      .map((p) => ({ account: p.account, amount: s(p.amount), invoiceNumber: p.invoiceId ? (nums.get(p.invoiceId) ?? null) : null })),
  }));
}

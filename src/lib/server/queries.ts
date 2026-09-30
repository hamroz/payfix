import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { Executor } from "@/lib/db/client";
import { caseTransfers, cases, customers, invoices, postings, transfers, type Account } from "@/lib/db/schema";
import { balancesFrom } from "@/lib/domain/ledger";

const sumUnits = sql<string>`coalesce(sum(${postings.amount}), 0)`.mapWith((v) => BigInt(v));

/** Business-wide balances by account. received = everything that ever arrived. */
export async function businessBalances(db: Executor, businessId: string) {
  const rows = await db
    .select({ account: postings.account, amount: sumUnits })
    .from(postings)
    .where(eq(postings.businessId, businessId))
    .groupBy(postings.account);
  return balancesFrom(rows as { account: Account; amount: bigint }[]);
}

/** Amount applied to each invoice. */
export async function appliedByInvoice(db: Executor, invoiceIds: string[]): Promise<Map<string, bigint>> {
  if (invoiceIds.length === 0) return new Map();
  const rows = await db
    .select({ invoiceId: postings.invoiceId, amount: sumUnits })
    .from(postings)
    .where(and(eq(postings.account, "invoice"), inArray(postings.invoiceId, invoiceIds)))
    .groupBy(postings.invoiceId);
  return new Map(rows.map((r) => [r.invoiceId!, r.amount]));
}

export async function invoiceWithBalance(db: Executor, invoiceId: string) {
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
  if (!inv) return null;
  const applied = (await appliedByInvoice(db, [inv.id])).get(inv.id) ?? 0n;
  return { ...inv, applied, remaining: inv.amount > applied ? inv.amount - applied : 0n };
}

export async function invoicesWithBalances(db: Executor, where: { businessId: string; customerId?: string }) {
  const rows = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.businessId, where.businessId), where.customerId ? eq(invoices.customerId, where.customerId) : undefined))
    .orderBy(desc(invoices.createdAt));
  const applied = await appliedByInvoice(db, rows.map((r) => r.id));
  return rows.map((inv) => {
    const a = applied.get(inv.id) ?? 0n;
    return { ...inv, applied: a, remaining: inv.amount > a ? inv.amount - a : 0n };
  });
}

/** Unresolved balance still sitting on each of a case's transfers, oldest first. */
export async function caseSources(db: Executor, caseId: string) {
  const rows = await db
    .select({
      transferId: transfers.id,
      createdAt: transfers.createdAt,
      unresolved: sql<string>`coalesce((select sum(p.amount) from ${postings} p where p.transfer_id = ${transfers.id} and p.account = 'unresolved'), 0)`.mapWith(
        (v) => BigInt(v),
      ),
    })
    .from(caseTransfers)
    .innerJoin(transfers, eq(transfers.id, caseTransfers.transferId))
    .where(eq(caseTransfers.caseId, caseId))
    .orderBy(transfers.createdAt);
  return rows;
}

export async function caseAvailable(db: Executor, caseId: string): Promise<bigint> {
  return (await caseSources(db, caseId)).reduce((a, s) => a + s.unresolved, 0n);
}

export async function customerCredit(db: Executor, customerId: string): Promise<bigint> {
  const [row] = await db
    .select({ amount: sumUnits })
    .from(postings)
    .where(and(eq(postings.account, "credit"), eq(postings.customerId, customerId)));
  return row?.amount ?? 0n;
}

export async function openCaseCount(db: Executor, businessId: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(cases)
    .where(and(eq(cases.businessId, businessId), sql`${cases.status} <> 'resolved'`));
  return row?.n ?? 0;
}

export async function customerById(db: Executor, id: string) {
  const [c] = await db.select().from(customers).where(eq(customers.id, id));
  return c ?? null;
}

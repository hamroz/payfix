import { and, count, eq, lt, sql } from "drizzle-orm";
import { Keypair } from "@solana/web3.js";
import type { Db, Executor } from "@/lib/db/client";
import { businesses, customers, events, invoices, paymentRequests } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { UserError } from "@/lib/i18n/errors";
import { formatUsd, fromUnits } from "@/lib/money";
import { solanaPayUrl } from "@/lib/solana/tx";
import { logEvent } from "./journal";
import { appliedByInvoice, invoiceWithBalance } from "./queries";

export class InputError extends UserError {}

export async function createCustomer(db: Db, p: { businessId: string; name: string; email: string; actorUserId?: string }) {
  const name = p.name.trim();
  const email = p.email.trim().toLowerCase();
  if (!name) throw new InputError("customerNameRequired");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError("invalidEmail");
  const [existing] = await db.select().from(customers).where(and(eq(customers.businessId, p.businessId), eq(customers.email, email)));
  if (existing) throw new InputError("customerEmailExists");
  const id = newId("cus");
  await db.transaction(async (t) => {
    await t.insert(customers).values({ id, businessId: p.businessId, name, email });
    await logEvent(t, {
      businessId: p.businessId,
      customerId: id,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "customer.created",
      data: { name, email },
    });
  });
  return id;
}

export async function createInvoice(
  db: Db,
  p: { businessId: string; customerId: string; title: string; amount: bigint; dueAt: Date; actorUserId?: string; sample?: boolean },
) {
  if (p.amount <= 0n) throw new InputError("invoiceAmountPositive");
  if (!p.title.trim()) throw new InputError("invoiceTitleRequired");
  return db.transaction(async (t) => {
    const [cust] = await t.select().from(customers).where(and(eq(customers.id, p.customerId), eq(customers.businessId, p.businessId)));
    if (!cust) throw new InputError("chooseCustomer");
    const [{ n }] = await t.select({ n: count() }).from(invoices).where(eq(invoices.businessId, p.businessId));
    const id = newId("inv");
    const number = `INV-${String(n + 1).padStart(4, "0")}`;
    await t.insert(invoices).values({ id, businessId: p.businessId, customerId: cust.id, number, title: p.title.trim(), amount: p.amount, dueAt: p.dueAt, sample: p.sample ?? false });
    await logEvent(t, {
      businessId: p.businessId,
      invoiceId: id,
      customerId: cust.id,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "invoice.created",
      data: { number, customer: cust.name, amount: formatUsd(p.amount) },
    });
    return { id, number };
  });
}

/**
 * Issues a fresh Solana Pay reference for one payment attempt. `amount` null leaves the
 * amount for the payer to enter (the wallet will ask).
 */
export async function createPaymentRequest(db: Db, p: { invoiceId: string; amount: bigint | null }) {
  const inv = await invoiceWithBalance(db, p.invoiceId);
  if (!inv) throw new InputError("invoiceNotFound");
  if (p.amount !== null && p.amount <= 0n) throw new InputError("paymentAmountPositive");
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, inv.businessId));
  const reference = Keypair.generate().publicKey.toBase58();
  const id = newId("preq");
  await db.insert(paymentRequests).values({ id, businessId: inv.businessId, invoiceId: inv.id, reference, amount: p.amount });
  return {
    id,
    reference,
    url: solanaPayUrl({
      recipient: biz.walletAddress,
      amount: p.amount === null ? null : fromUnits(p.amount),
      mint: biz.mint,
      reference,
      label: biz.name,
      message: `${inv.number} · ${inv.title}`,
    }),
  };
}

/**
 * Logs `invoice.overdue` once for each unpaid invoice whose due time has passed. Runs from the
 * company sync, so it only loads past-due invoices not flagged yet.
 */
export async function flagOverdueInvoices(db: Executor, businessId: string, now = new Date()) {
  const candidates = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.businessId, businessId),
        lt(invoices.dueAt, now),
        sql`not exists (select 1 from ${events} where ${events.businessId} = ${businessId} and ${events.dedupeKey} = 'overdue:' || ${invoices.id})`,
      ),
    );
  if (candidates.length === 0) return 0;
  const applied = await appliedByInvoice(db, candidates.map((i) => i.id));
  let flagged = 0;
  for (const inv of candidates) {
    const remaining = inv.amount - (applied.get(inv.id) ?? 0n);
    if (remaining <= 0n) continue;
    const logged = await logEvent(db, {
      businessId,
      invoiceId: inv.id,
      customerId: inv.customerId,
      actor: "system",
      type: "invoice.overdue",
      data: { number: inv.number, remaining: formatUsd(remaining) },
      dedupeKey: `overdue:${inv.id}`,
    });
    if (logged) flagged++;
  }
  return flagged;
}

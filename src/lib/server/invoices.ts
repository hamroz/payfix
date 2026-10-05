import { and, count, eq } from "drizzle-orm";
import { Keypair } from "@solana/web3.js";
import type { Db, Executor } from "@/lib/db/client";
import { businesses, customers, invoices, paymentRequests } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { formatUsd, fromUnits } from "@/lib/money";
import { solanaPayUrl } from "@/lib/solana/tx";
import { logEvent } from "./journal";
import { invoicesWithBalances, invoiceWithBalance } from "./queries";

export class InputError extends Error {}

export async function createCustomer(db: Db, p: { businessId: string; name: string; email: string; actorUserId?: string }) {
  const name = p.name.trim();
  const email = p.email.trim().toLowerCase();
  if (!name) throw new InputError("Enter the customer's name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError("Enter a valid email address.");
  const [existing] = await db.select().from(customers).where(and(eq(customers.businessId, p.businessId), eq(customers.email, email)));
  if (existing) throw new InputError("A customer with that email already exists.");
  const id = newId("cus");
  await db.transaction(async (t) => {
    await t.insert(customers).values({ id, businessId: p.businessId, name, email });
    await logEvent(t, {
      businessId: p.businessId,
      customerId: id,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "customer.created",
      message: `${name} added as a customer (${email})`,
    });
  });
  return id;
}

export async function createInvoice(db: Db, p: { businessId: string; customerId: string; title: string; amount: bigint; dueAt: Date; actorUserId?: string }) {
  if (p.amount <= 0n) throw new InputError("The amount must be greater than zero.");
  if (!p.title.trim()) throw new InputError("Describe what this invoice is for.");
  return db.transaction(async (t) => {
    const [cust] = await t.select().from(customers).where(and(eq(customers.id, p.customerId), eq(customers.businessId, p.businessId)));
    if (!cust) throw new InputError("Choose a customer.");
    const [{ n }] = await t.select({ n: count() }).from(invoices).where(eq(invoices.businessId, p.businessId));
    const id = newId("inv");
    const number = `INV-${String(n + 1).padStart(4, "0")}`;
    await t.insert(invoices).values({ id, businessId: p.businessId, customerId: cust.id, number, title: p.title.trim(), amount: p.amount, dueAt: p.dueAt });
    await logEvent(t, {
      businessId: p.businessId,
      invoiceId: id,
      customerId: cust.id,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "invoice.created",
      message: `${number} created for ${cust.name}: ${formatUsd(p.amount)}`,
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
  if (!inv) throw new InputError("Invoice not found");
  if (p.amount !== null && p.amount <= 0n) throw new InputError("Enter an amount greater than zero.");
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

/** Logs `invoice.overdue` once for each unpaid invoice whose due time has passed. Runs with every company sync. */
export async function flagOverdueInvoices(db: Executor, businessId: string, now = new Date()) {
  let flagged = 0;
  for (const inv of await invoicesWithBalances(db, { businessId })) {
    if (inv.remaining === 0n || inv.dueAt >= now) continue;
    const logged = await logEvent(db, {
      businessId,
      invoiceId: inv.id,
      customerId: inv.customerId,
      actor: "system",
      type: "invoice.overdue",
      message: `${inv.number} is overdue: ${formatUsd(inv.remaining)} remaining`,
      dedupeKey: `overdue:${inv.id}`,
    });
    if (logged) flagged++;
  }
  return flagged;
}

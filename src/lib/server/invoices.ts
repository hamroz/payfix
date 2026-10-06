import { and, count, eq, lt, sql } from "drizzle-orm";
import { Keypair, PublicKey } from "@solana/web3.js";
import type { Db, Executor } from "@/lib/db/client";
import { businesses, customers, events, invoices, paymentRequests } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { newId } from "@/lib/ids";
import { UserError } from "@/lib/i18n/errors";
import { formatUsd, fromUnits } from "@/lib/money";
import { buildPaymentTransaction, isWalletAddress, solanaPayUrl } from "@/lib/solana/tx";
import type { ChainClient } from "./chain";
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

export async function createInvoice(db: Db, p: { businessId: string; customerId: string; title: string; amount: bigint; dueAt: Date; actorUserId?: string }) {
  if (p.amount <= 0n) throw new InputError("invoiceAmountPositive");
  if (!p.title.trim()) throw new InputError("invoiceTitleRequired");
  return db.transaction(async (t) => {
    const [cust] = await t.select().from(customers).where(and(eq(customers.id, p.customerId), eq(customers.businessId, p.businessId)));
    if (!cust) throw new InputError("chooseCustomer");
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
      data: { number, customer: cust.name, amount: formatUsd(p.amount) },
    });
    return { id, number };
  });
}

/**
 * Issues a fresh Solana Pay reference for one payment attempt. `amount` null leaves the
 * amount for the payer to enter (the wallet will ask).
 *
 * With an amount and a public HTTPS origin the link is a transaction request: the wallet
 * fetches the exact transfer from `/api/pay/<reference>` and only signs it. Phantom can't
 * read balances of an unlisted token like the devnet test USD, so it rejects a plain
 * transfer request as "insufficient balance". Without an amount, or on a local http origin
 * a phone can't reach, it stays a transfer request.
 */
export async function createPaymentRequest(db: Db, p: { invoiceId: string; amount: bigint | null; appUrl?: string }) {
  const inv = await invoiceWithBalance(db, p.invoiceId);
  if (!inv) throw new InputError("invoiceNotFound");
  if (p.amount !== null && p.amount <= 0n) throw new InputError("paymentAmountPositive");
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, inv.businessId));
  const reference = Keypair.generate().publicKey.toBase58();
  const id = newId("preq");
  await db.insert(paymentRequests).values({ id, businessId: inv.businessId, invoiceId: inv.id, reference, amount: p.amount });
  const appUrl = p.appUrl ?? env().APP_URL;
  return {
    id,
    reference,
    url:
      p.amount !== null && appUrl.startsWith("https://")
        ? `solana:${new URL(`/api/pay/${reference}`, appUrl).toString()}`
        : solanaPayUrl({
            recipient: biz.walletAddress,
            amount: p.amount === null ? null : fromUnits(p.amount),
            mint: biz.mint,
            reference,
            label: biz.name,
            message: `${inv.number} · ${inv.title}`,
          }),
  };
}

async function requestedPayment(db: Executor, reference: string) {
  const [req] = await db.select().from(paymentRequests).where(eq(paymentRequests.reference, reference));
  if (!req) return null;
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, req.invoiceId));
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, req.businessId));
  return { req, inv, biz };
}

/** What the wallet shows before asking for the payer's account (Solana Pay transaction request GET). */
export async function paymentRequestLabel(db: Executor, reference: string) {
  return (await requestedPayment(db, reference))?.biz.name ?? null;
}

/**
 * Solana Pay transaction request POST: the exact payment for the wallet that scanned the
 * code, unsigned. Same transaction the in-browser wallet flow builds, so ingestion finds it
 * by the same reference key.
 */
export async function buildRequestedPayment(deps: { db: Executor; chain: ChainClient }, p: { reference: string; account: string }) {
  const found = await requestedPayment(deps.db, p.reference);
  if (!found || found.req.amount === null) throw new InputError("paymentCodeInvalid");
  if (!isWalletAddress(p.account)) throw new InputError("invalidWalletAddress");
  const { req, inv, biz } = found;
  const { blockhash, lastValidBlockHeight } = await deps.chain.getLatestBlockhash();
  const tx = buildPaymentTransaction({
    payer: new PublicKey(p.account),
    merchant: new PublicKey(biz.walletAddress),
    mint: new PublicKey(biz.mint),
    decimals: env().PAYFIX_MINT_DECIMALS,
    amount: req.amount!,
    reference: new PublicKey(req.reference),
    blockhash,
    lastValidBlockHeight,
  });
  return {
    transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
    message: `${inv.number} · ${inv.title}`,
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

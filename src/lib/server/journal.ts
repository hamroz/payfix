import { journalEntries, postings, events } from "@/lib/db/schema";
import { invoiceWithBalance } from "./queries";
import type { Executor } from "@/lib/db/client";
import { assertBalanced, type PostingDraft } from "@/lib/domain/ledger";
import { englishEvent } from "@/lib/i18n/english";
import type { EventType, EventVars } from "@/lib/i18n/events";
import { newId } from "@/lib/ids";

/**
 * Writes a balanced journal entry exactly once per idempotency key.
 * Returns false (and writes nothing) if the key was already used, which makes
 * retries, webhook redelivery, double clicks, and worker restarts harmless.
 */
export async function postEntry(
  db: Executor,
  entry: { businessId: string; key: string; kind: string; memo: string; caseId?: string | null; postings: PostingDraft[] },
): Promise<boolean> {
  assertBalanced(entry.postings);
  const id = newId("je");
  const inserted = await db
    .insert(journalEntries)
    .values({ id, businessId: entry.businessId, idempotencyKey: entry.key, kind: entry.kind, memo: entry.memo, caseId: entry.caseId ?? null })
    .onConflictDoNothing({ target: journalEntries.idempotencyKey })
    .returning({ id: journalEntries.id });
  if (inserted.length === 0) return false;
  await db.insert(postings).values(
    entry.postings.map((p) => ({
      id: newId("po"),
      entryId: id,
      businessId: entry.businessId,
      account: p.account,
      amount: p.amount,
      transferId: p.transferId ?? null,
      invoiceId: p.invoiceId ?? null,
      customerId: p.customerId ?? null,
      refundId: p.refundId ?? null,
      caseId: p.caseId ?? null,
    })),
  );
  return true;
}

type EventBase = {
  businessId: string;
  actor: "system" | "business" | "customer";
  caseId?: string | null;
  invoiceId?: string | null;
  customerId?: string | null;
  actorUserId?: string | null;
  dedupeKey?: string | null;
};

/** A known event type with the data its sentence needs (see `EventVars`), plus anything else worth keeping. */
type TypedEvent = {
  [K in EventType]: { type: K; message?: never } & (Record<string, never> extends EventVars[K]
    ? { data?: EventVars[K] & Record<string, unknown> }
    : { data: EventVars[K] & Record<string, unknown> });
}[EventType];

/** An event with a literal message (tests, or types without a sentence in `m.events`). */
type LiteralEvent = { type: string; message: string; data?: Record<string, unknown> };

/**
 * Appends to the company's activity log, which is also what notifications read. `actorUserId`
 * is the member who caused it (so they aren't notified of it). With a `dedupeKey`, the event
 * is written at most once per company; returns false when it already existed. `data` is kept
 * with the event so `renderEvent` can show it in each viewer's language; the stored `message`
 * is its English sentence.
 */
export async function logEvent(db: Executor, e: EventBase & (TypedEvent | LiteralEvent)): Promise<boolean> {
  const message = e.message ?? englishEvent(e.type, e.data);
  const inserted = await db
    .insert(events)
    .values({
      id: newId("ev"),
      businessId: e.businessId,
      actor: e.actor,
      actorUserId: e.actorUserId ?? null,
      type: e.type,
      message,
      caseId: e.caseId ?? null,
      invoiceId: e.invoiceId ?? null,
      customerId: e.customerId ?? null,
      dedupeKey: e.dedupeKey ?? null,
      data: e.data ?? null,
    })
    .onConflictDoNothing()
    .returning({ id: events.id });
  return inserted.length > 0;
}

/** Logs `invoice.paid` once, the moment an invoice has nothing left to pay. Call after posting to it. */
export async function logInvoicePaid(db: Executor, p: { businessId: string; invoiceId: string; actorUserId?: string | null }) {
  const inv = await invoiceWithBalance(db, p.invoiceId);
  if (!inv || inv.remaining > 0n) return;
  await logEvent(db, {
    businessId: p.businessId,
    invoiceId: inv.id,
    customerId: inv.customerId,
    actor: p.actorUserId ? "business" : "system",
    actorUserId: p.actorUserId,
    type: "invoice.paid",
    data: { number: inv.number },
    dedupeKey: `paid:${inv.id}`,
  });
}

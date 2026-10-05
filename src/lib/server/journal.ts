import { journalEntries, postings, events } from "@/lib/db/schema";
import type { Executor } from "@/lib/db/client";
import { assertBalanced, type PostingDraft } from "@/lib/domain/ledger";
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

/**
 * Appends to the company's activity log, which is also what notifications read. `actorUserId`
 * is the member who caused it (so they aren't notified of it). With a `dedupeKey`, the event
 * is written at most once per company; returns false when it already existed.
 */
export async function logEvent(
  db: Executor,
  e: {
    businessId: string;
    actor: "system" | "business" | "customer";
    type: string;
    message: string;
    caseId?: string | null;
    invoiceId?: string | null;
    customerId?: string | null;
    actorUserId?: string | null;
    dedupeKey?: string | null;
    data?: Record<string, unknown>;
  },
): Promise<boolean> {
  const inserted = await db
    .insert(events)
    .values({
      id: newId("ev"),
      businessId: e.businessId,
      actor: e.actor,
      actorUserId: e.actorUserId ?? null,
      type: e.type,
      message: e.message,
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

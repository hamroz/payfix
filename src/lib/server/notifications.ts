import { and, count, desc, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import type { Db, Executor } from "@/lib/db/client";
import { events, memberships, notificationReads } from "@/lib/db/schema";
import { categoryOf, enabledTypes, isCategoryId, type CategoryId } from "@/lib/domain/notifications";
import { InputError } from "./invoices";

/**
 * A member's notifications are the company's activity-log events in categories they haven't
 * muted, minus the ones they caused. Read state: rows in `notification_reads`, plus everything
 * at or before their "mark all read" cursor.
 */
export type NotificationRow = {
  id: string;
  type: string;
  category: CategoryId;
  actor: string;
  message: string;
  createdAt: string;
  href: string;
  read: boolean;
};

type Viewer = { businessId: string; userId: string };

async function membership(db: Executor, p: Viewer) {
  const [m] = await db
    .select({ id: memberships.id, muted: memberships.notificationMuted })
    .from(memberships)
    .where(and(eq(memberships.businessId, p.businessId), eq(memberships.userId, p.userId)));
  if (!m) throw new InputError("You're not a member of this company.");
  return m;
}

/** Covered by "mark all read". Compared in SQL so microsecond timestamps round-trip exactly. */
const beforeCursor = (membershipId: string) =>
  sql<boolean>`coalesce(${events.createdAt} <= (select ${memberships.notificationsReadAt} from ${memberships} where ${memberships.id} = ${membershipId}), false)`;

const visibleTo = (p: Viewer, types: string[]) =>
  and(eq(events.businessId, p.businessId), inArray(events.type, types), sql`${events.actorUserId} is distinct from ${p.userId}`);

function hrefFor(e: { caseId: string | null; invoiceId: string | null }, category: CategoryId) {
  if (e.caseId) return `/app/exceptions/${e.caseId}`;
  if (e.invoiceId) return `/app/invoices/${e.invoiceId}`;
  if (category === "customers") return "/app/customers";
  if (category === "team") return "/app/settings";
  return "/app";
}

export async function listNotifications(db: Executor, p: Viewer & { limit?: number }): Promise<NotificationRow[]> {
  const m = await membership(db, p);
  const types = enabledTypes(m.muted);
  if (types.length === 0) return [];
  const rows = await db
    .select({ e: events, readId: notificationReads.eventId, covered: beforeCursor(m.id) })
    .from(events)
    .leftJoin(notificationReads, and(eq(notificationReads.eventId, events.id), eq(notificationReads.userId, p.userId)))
    .where(visibleTo(p, types))
    .orderBy(desc(events.createdAt), desc(events.id))
    .limit(p.limit ?? 30);
  return rows.map(({ e, readId, covered }) => {
    const category = categoryOf(e.type)!;
    return {
      id: e.id,
      type: e.type,
      category,
      actor: e.actor,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
      href: hrefFor(e, category),
      read: readId !== null || covered,
    };
  });
}

export async function unreadCount(db: Executor, p: Viewer): Promise<number> {
  const m = await membership(db, p);
  const types = enabledTypes(m.muted);
  if (types.length === 0) return 0;
  const [row] = await db
    .select({ n: count() })
    .from(events)
    .leftJoin(notificationReads, and(eq(notificationReads.eventId, events.id), eq(notificationReads.userId, p.userId)))
    .where(and(visibleTo(p, types), isNull(notificationReads.eventId), sql`not ${beforeCursor(m.id)}`));
  return row?.n ?? 0;
}

export async function markRead(db: Executor, p: Viewer & { eventId: string }) {
  await membership(db, p);
  const [e] = await db.select({ id: events.id }).from(events).where(and(eq(events.id, p.eventId), eq(events.businessId, p.businessId)));
  if (!e) throw new InputError("Notification not found.");
  await db.insert(notificationReads).values({ userId: p.userId, eventId: e.id }).onConflictDoNothing();
}

/** Moves the member's cursor to now; one-by-one read marks it covers are no longer needed. */
export async function markAllRead(db: Db, p: Viewer) {
  await db.transaction(async (t) => {
    const m = await membership(t, p);
    const [{ at }] = await t.update(memberships).set({ notificationsReadAt: sql`now()` }).where(eq(memberships.id, m.id)).returning({ at: memberships.notificationsReadAt });
    await t
      .delete(notificationReads)
      .where(
        and(
          eq(notificationReads.userId, p.userId),
          inArray(notificationReads.eventId, t.select({ id: events.id }).from(events).where(and(eq(events.businessId, p.businessId), lte(events.createdAt, at!)))),
        ),
      );
  });
}

export async function getMuted(db: Executor, p: Viewer): Promise<CategoryId[]> {
  return (await membership(db, p)).muted.filter(isCategoryId);
}

export async function setMuted(db: Executor, p: Viewer & { muted: string[] }) {
  const unknown = p.muted.filter((c) => !isCategoryId(c));
  if (unknown.length) throw new InputError(`Unknown notification category: ${unknown.join(", ")}`);
  const m = await membership(db, p);
  await db.update(memberships).set({ notificationMuted: [...new Set(p.muted)] }).where(eq(memberships.id, m.id));
}

# In-app notifications — design

**Date:** 2026-10-05 · **Branch:** `feat/notifications` · **Status:** approved in chat, awaiting spec review

## Goal

Members of a company see what changed without watching every page: a bell in the app header opens a list of notifications covering payments, exceptions, resolutions, refunds, invoices, customers, and team/wallet changes. Each member chooses which categories they receive in Settings; all categories are on by default.

## Decisions

| Question | Decision |
| --- | --- |
| Who owns preferences | Each member, per company (stored on `memberships`) |
| Delivery | In-app only. Email is out of scope; categories are designed so email could reuse them later |
| Read state | Per item, plus "Mark all read" |
| Source of truth | The existing `events` table. A notification is an event the member hasn't muted and didn't cause themselves. No separate notifications table |
| Own actions | Never notify the member who caused the event |
| Scope | Per company: switching company switches the feed |

## Data model

`events` (existing) gains two nullable columns:

- `actor_user_id text` — the business user who caused the event, when there is one. Used to exclude the member's own actions. Customer and system events leave it null.
- `dedupe_key text` — set only for events that must fire once per subject (e.g. `overdue:<invoiceId>`). Unique index on `(business_id, dedupe_key)` (nulls don't collide). `logEvent` inserts with `onConflictDoNothing` when a key is given.

`memberships` (existing) gains:

- `notification_muted jsonb not null default '[]'` — array of muted category ids. Storing the muted set (not the enabled set) makes every category on by default, including categories added later.
- `notifications_read_at timestamptz` — "mark all read" cursor. Events created at or before it count as read.

New table `notification_reads`:

- `user_id text not null`, `event_id text not null references events(id)`, `created_at`. Primary key `(user_id, event_id)`.

`clearWorkspaceData` must delete `notification_reads` rows for the company's events before deleting the events.

Migration via `npm run db:generate` after editing `src/lib/db/schema.ts`.

## Categories

Defined once in `src/lib/domain/notifications.ts` (isomorphic, no secrets) so server filtering and the Settings UI share it.

| Id | Label | Event types |
| --- | --- | --- |
| `payments` | Payments | `payment.received`, `transfer.unmatched`, `transfer.out` |
| `exceptions` | Exceptions | `case.opened`, `case.assigned`, `case.resolved`* |
| `resolutions` | Resolutions | `link.sent`, `customer.verified`*, `proposal.submitted`, `proposal.approved`, `proposal.declined`, `approval.invalidated`, `plan.executed` |
| `refunds` | Refunds | `refund.submitted`, `refund.confirmed`, `refund.failed`, `refund.expired` |
| `invoices` | Invoices | `invoice.created`, `invoice.paid`*, `invoice.overdue`*, `credit.applied` |
| `customers` | Customers | `customer.created`* |
| `team` | Team and wallets | `member.added`, `member.role_changed`*, `member.removed`*, `wallet.added`, `wallet.activated`, `wallet.removed`* |

\* new event type added by this work. Event types not in the map (e.g. a future type) fall into no category and are not shown as notifications until mapped. A unit test asserts every type the code logs is mapped.

## New events (filling gaps)

All written with `logEvent` inside the same transaction as the change they describe, where one exists.

- `invoice.paid` — when an invoice's remaining balance goes from > 0 to 0. Emitted from payment ingest (`ingest.ts`, where `settled` is already computed), credit application (`credit.ts`), and plan execution (`resolution.ts`, for each invoice line that settles its invoice). Uses `dedupe_key = paid:<invoiceId>` so the three paths can't double-fire.
- `invoice.overdue` — checked in `syncCompany` after the chain sync: invoices of that company with `due_at < now()` and remaining > 0 get one event each, `dedupe_key = overdue:<invoiceId>`. Message: "INV-… is overdue: $X remaining".
- `case.resolved` — when a case reaches `resolved` (plan execution without refund, and refund confirmation). Existing `plan.executed` / `refund.confirmed` stay as they are.
- `customer.verified` — when a customer verifies the email code on a resolution link (`verifyCode` with purpose `customer`). Logged in `verifyCustomerCode` (`src/app/actions/auth.ts`), which already resolves the link and its case; once per link (`dedupe_key = verified:<linkId>`), so re-verifying on another device does not repeat it.
- `customer.created` — in `createCustomer`.
- `member.role_changed`, `member.removed` — in `setMemberRole`, `removeMember`.
- `wallet.removed` — in `removeWallet`.

## Actor attribution

`logEvent` takes an optional `actorUserId`. Service functions that perform business actions take an optional `actorUserId` in their params and pass it through; server actions in `src/app/actions/business.ts` pass `user.id`. Functions that already receive the user (e.g. `approveProposal`'s `approvedBy`, `addMember`'s `invitedBy`) keep that parameter and add `actorUserId` alongside. Customer and system events leave it null, so every member sees them.

## Server API

`src/lib/server/notifications.ts`, services style (`db` first):

- `listNotifications(db, { businessId, userId, limit = 30 })` → `NotificationRow[]` with `{ id, type, category, message, actor, createdAt, href, read }`. Query: company's events, type in the member's enabled types, `actor_user_id is distinct from userId`, newest first. `read` = `createdAt <= notifications_read_at` or a `notification_reads` row exists. `href` = `/app/exceptions/<caseId>` if `caseId`, else `/app/invoices/<invoiceId>` if `invoiceId`, else `/app/customers` for customer events, `/app/settings` for team/wallet events.
- `unreadCount(db, { businessId, userId })` → number (same filter, unread only; capped display "99+" in UI).
- `markRead(db, { businessId, userId, eventId })` — verifies the event belongs to the business, inserts the read row idempotently.
- `markAllRead(db, { businessId, userId })` — sets the cursor to `now()` and deletes that user's read rows for the company's events at or before it (housekeeping).
- `getMuted` / `setMuted(db, { businessId, userId, muted: CategoryId[] })` — validates ids against the category list.

All functions require the user to be a member of the business; the actions layer already resolves `requireWorkspace()` and passes `biz.id` and `user.id`.

Server actions (in `src/app/actions/business.ts`, via `run()`, with `refresh()` after mutations): `markNotificationReadAction(eventId)`, `markAllNotificationsReadAction()`, `setNotificationPrefsAction(muted)`. Available to every role, viewers included; they only change the member's own state.

## UI

**Bell** — `src/components/app/notifications.tsx` (client). Placed in the app header next to `ThemeToggle`, shown on desktop and phones. Badge with unread count (violet accent token). The layout loads `listNotifications` and `unreadCount` server-side and passes them in; `LiveSync` already calls `router.refresh()` when the event count changes, so the badge and list update live with no new polling.

Clicking opens a glass popover (`motion/react` fade/scale, closes on outside click and Escape, focus-trapped enough to be keyboard usable). Contents:

- Header: "Notifications" + "Mark all read" (disabled when nothing unread).
- List: up to 30 items, same icon/tone map as `ActivityFeed` (extract the map to a shared module so both use it, and add icons for the new types). Unread items show a dot and slightly stronger text. Relative time via the existing `TimeAgo` pattern.
- Clicking an item calls `markNotificationReadAction` then navigates to `href`.
- Empty state: "You're all caught up." Footer link: "Notification settings" → `/app/settings#notifications`.
- On phones the popover is full-width below the header (16px gutter), no horizontal scroll.

**Settings** — new `Notifications` card (`src/app/app/settings/notifications.tsx`, client) with `id="notifications"`, placed after Team. One row per category: label, one-line description, toggle switch. Changes save immediately via `setNotificationPrefsAction` with a toast on error. Visible to all roles. Copy notes that preferences are personal and apply to this company.

All colors from theme tokens (`veil/…`, brand tokens); works in light and dark.

## Error handling

- Notification queries failing must not break the app shell: the layout catches errors from the notification loaders and renders the bell with no badge and an empty list.
- `markRead` on an event from another company or a nonexistent id throws `InputError("Notification not found.")`.
- `setMuted` with unknown ids throws `InputError`.
- Overdue detection runs inside the existing sync error handling; a failure is logged and retried on the next sync.

## Testing

New `src/lib/server/notifications.test.ts` (PGlite + SimChain, same setup as `workspaces.test.ts`):

1. All categories on by default: an owner sees events caused by another member and by customers/system.
2. Own actions excluded: events with `actorUserId` = the viewer don't appear.
3. Muting `payments` hides `payment.received`; unmuting brings it back; unknown category rejected.
4. Per-item read: `markRead` flips `read` and lowers `unreadCount`; read state is per user.
5. `markAllRead` makes everything read; a newer event is unread again.
6. Tenant isolation: a member of company B sees nothing from company A; `markRead` on A's event from B throws.
7. `invoice.paid` fires exactly once when a payment settles an invoice, and not for partial payments.
8. `invoice.overdue` fires once for a past-due unpaid invoice across repeated syncs, and not for a paid one.
9. Every event type logged anywhere in `src/lib/server` is mapped to a category (static list check).

`flow.test.ts` and the existing suites must keep passing. Then `npm run typecheck`, `npm run lint`, `npm run build`, and a browser check of the bell, popover, and settings card in light/dark and at phone width.

## Out of scope

Email or push delivery, per-event-type (finer than category) toggles, company-wide defaults set by an owner, notification retention/pruning beyond what `events` already does.

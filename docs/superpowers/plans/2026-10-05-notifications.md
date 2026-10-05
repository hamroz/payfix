# In-app Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A header bell listing per-member notifications derived from the company's `events`, with per-category preferences in Settings (all on by default).

**Architecture:** `events` stays the single source of truth. A notification is an event in an enabled category that the viewer didn't cause. Read state lives in `notification_reads` plus a per-membership "mark all" cursor. Missing event types are added at their write sites. The bell is server-rendered data refreshed by the existing `LiveSync` `router.refresh()`.

**Tech Stack:** Next.js 16 (async `params`/`cookies`, `refresh()` from `next/cache`), Drizzle + Postgres/PGlite, vitest, motion/react, lucide-react, Tailwind theme tokens.

**Spec:** `docs/superpowers/specs/2026-10-05-notifications-design.md`

## Global Constraints

- Every `events` write goes through `logEvent` in `src/lib/server/journal.ts`; new events are written inside the same transaction as the change they describe, where one exists.
- Category ids: `payments`, `exceptions`, `resolutions`, `refunds`, `invoices`, `customers`, `team`. Muted set stored, so default = all on.
- New event types: `case.resolved`, `customer.verified`, `invoice.paid`, `invoice.overdue`, `customer.created`, `member.role_changed`, `member.removed`, `wallet.removed`.
- Dedupe keys: `paid:<invoiceId>`, `overdue:<invoiceId>`, `verified:<linkId>`.
- `src/lib/domain` stays isomorphic and secret-free; server code in `src/lib/server`.
- Server actions return `ActionResult` via `run()`; user-facing errors via `InputError`.
- UI: theme tokens only (`veil/…`, `indigo`, `violet`, `mint`, `cyan`, `amber`, `rose`), no hard-coded white/dark hex; works in light and dark; phone width with 16px gutter and no horizontal scroll.
- Commits: no AI attribution trailers (user memory rule).
- After any change to `src/lib/{domain,server,solana}`: `npm test`.

## Review Focus

1. Member mutes every category → bell shows "You're all caught up", unread 0, no SQL error from an empty `IN ()`. (Task 4 test `all muted`.)
2. Invoice paid in several partial payments → `invoice.paid` fires once, on the payment that settles it; overpayment that opens a case also counts as settling. (Task 3 test.)
3. Invoice due today (`due_at` = `YYYY-MM-DDT23:59:59Z`) → not overdue until that instant passes; repeated syncs never repeat the event. (Task 3 test with explicit `now`.)
4. Workspace reset (demo) after a member has read notifications → reset succeeds (read rows removed before events). (Task 1 test.)
5. `markRead` called twice, or on an event already covered by the mark-all cursor → no error, state unchanged. (Task 4 test.)

---

### Task 1: Schema, migration, and `logEvent` extensions

**Files:**
- Modify: `src/lib/db/schema.ts` (`memberships`, `events`, new `notificationReads`)
- Create: `drizzle/0004_*.sql` via `npm run db:generate`
- Modify: `src/lib/server/journal.ts` (`logEvent`)
- Modify: `src/lib/server/workspaces.ts` (`clearWorkspaceData`)
- Test: `src/lib/server/notifications.test.ts` (new; shared setup reused by Tasks 3–4)

**Interfaces:**
- Produces:
  - `memberships.notificationMuted: jsonb("notification_muted").$type<string[]>().notNull().default([])`, `memberships.notificationsReadAt: ts("notifications_read_at")`
  - `events.actorUserId: text("actor_user_id")`, `events.dedupeKey: text("dedupe_key")`, plus `uniqueIndex("events_business_dedupe").on(t.businessId, t.dedupeKey)`
  - `notificationReads` table `notification_reads(user_id text, event_id text → events.id, created_at)`, PK `(user_id, event_id)`
  - `logEvent(db, e & { actorUserId?: string | null; dedupeKey?: string | null }): Promise<boolean>` — returns `false` when the dedupe key already existed (insert with `onConflictDoNothing()` + `returning`).

- [ ] **Step 1: Write failing tests** in `notifications.test.ts`. Setup (in `beforeAll`): `openPglite()`, SimChain, owner + `editor@lumen.test` (added via `addMember`) in company A from `createWorkspace` + `seedSampleData`, `someone@else.test` owning company B. Tests:
  - `logEvent dedupes by key`: two calls with `dedupeKey: "x:1"` → first returns `true`, second `false`; one row with that key.
  - `reset clears read state`: insert a `notificationReads` row for an A event, then `clearWorkspaceData(db, bizA)` resolves.
- [ ] **Step 2: Run** `npx vitest run src/lib/server/notifications.test.ts` → FAIL (columns/table missing).
- [ ] **Step 3: Implement** schema changes, `npm run db:generate`, `logEvent` changes, and in `clearWorkspaceData` delete `notificationReads` where `event_id in (select id from events where business_id = …)` before deleting events. Note: re-seeding in later tests needs `seedSampleData` after reset, so put the reset test last or in its own `describe` with its own db.
- [ ] **Step 4: Run** the test file → PASS; `npm test` → all pass.
- [ ] **Step 5: Commit** `feat(notifications): schema, dedupe keys, actor attribution on events`

### Task 2: Category map (domain)

**Files:**
- Create: `src/lib/domain/notifications.ts`
- Test: `src/lib/domain/notifications.test.ts`

**Interfaces:**
- Produces:
  - `type CategoryId = "payments" | "exceptions" | "resolutions" | "refunds" | "invoices" | "customers" | "team"`
  - `CATEGORIES: readonly { id: CategoryId; label: string; description: string; types: readonly string[] }[]` — types exactly as the spec's table.
  - `categoryOf(type: string): CategoryId | null`
  - `enabledTypes(muted: readonly string[]): string[]`
  - `isCategoryId(v: string): v is CategoryId`

- [ ] **Step 1: Write failing tests:**
  - `categoryOf("payment.received") === "payments"`, `categoryOf("invoice.overdue") === "invoices"`, `categoryOf("nope") === null`.
  - `enabledTypes([])` contains every type of every category; `enabledTypes(["payments"])` excludes `payment.received`.
  - `every logged event type is mapped`: read all `.ts` files under `src/lib/server` and `src/app/actions` (excluding `*.test.ts`) with `node:fs`, collect `/type: "([a-z_]+\.[a-z_]+)"/g` matches that sit within a `logEvent(` call (regex over the text following each `logEvent(` up to the next `});`), assert each has a non-null `categoryOf`. Also assert the eight new types from Global Constraints are mapped.
- [ ] **Step 2: Run** `npx vitest run src/lib/domain/notifications.test.ts` → FAIL.
- [ ] **Step 3: Implement** the module. Descriptions (one line each), e.g. payments "Incoming payments and transfers PayFix observes."
- [ ] **Step 4: Run** → the "every logged type" test still FAILS only for types added in Task 3 (none yet logged) — it should PASS now since all currently logged types are mapped.
- [ ] **Step 5: Commit** `feat(notifications): category map`

### Task 3: Fill event gaps and attribute actors

**Files:**
- Modify: `src/lib/server/journal.ts` — add `logInvoicePaid`
- Modify: `src/lib/server/ingest.ts`, `src/lib/server/credit.ts`, `src/lib/server/resolution.ts`, `src/lib/server/refunds.ts`, `src/lib/server/invoices.ts`, `src/lib/server/workspaces.ts`, `src/lib/server/wallets.ts`, `src/lib/server/context.ts` (`syncCompany`)
- Modify: `src/app/actions/business.ts`, `src/app/actions/auth.ts` (`verifyCustomerCode`)
- Test: `src/lib/server/notifications.test.ts`

**Interfaces:**
- Consumes: `logEvent(..., { actorUserId, dedupeKey })` (Task 1).
- Produces:
  - `logInvoicePaid(t: Executor, p: { businessId: string; invoiceId: string; actorUserId?: string | null }): Promise<void>` in `journal.ts` — reads `invoiceWithBalance`; if `remaining === 0n` logs `invoice.paid` (actor `system` unless `actorUserId` given → `business`), message `"<number> is paid in full"`, `dedupeKey: paid:<invoiceId>`, with `invoiceId`, `customerId`.
  - `flagOverdueInvoices(db: Executor, businessId: string, now = new Date()): Promise<number>` in `invoices.ts` — for each `invoicesWithBalances` row with `dueAt < now` and `remaining > 0n`, logs `invoice.overdue` (actor `system`, message `"<number> is overdue: <formatUsd(remaining)> remaining"`, `dedupeKey: overdue:<id>`); returns count newly logged.
  - Optional `actorUserId?: string` param added to: `createCustomer`, `createInvoice`, `applyCredit`, `assignCustomer`, `sendResolutionLink`, `requestChanges`, `approveProposal`, `executePlan`, `addMember`, `setMemberRole`, `removeMember`, `addWallet`, `setActiveWallet`, `removeWallet`, `submitSignedRefund`. Each passes it to its business-actor `logEvent`. Actions pass `user.id` (from `requireRole` / `ownedCase`).

- [ ] **Step 1: Write failing tests** (in the Task 1 file's main `describe`):
  - `invoice.paid fires once when a payment settles`: create invoice $100 via `createInvoice`; pay $40 via SimChain + `createPaymentRequest` reference + `syncBusiness` → no `invoice.paid` for it; pay $60 → exactly one; `syncBusiness` again → still one. (Follow `workspaces.test.ts` payment pattern.)
  - `applyCredit settling an invoice logs invoice.paid` (seed sample data path: overpay invoice A to create credit if simpler, else skip this sub-case and rely on the ingest test — keep at least the ingest test).
  - `invoice.overdue fires once`: invoice with `dueAt = 2026-01-01T23:59:59Z`; `flagOverdueInvoices(db, biz, new Date("2026-01-01T23:59:58Z"))` → 0; with `new Date("2026-01-02")` → 1; again → 0; a fully paid past-due invoice → never.
  - `team and wallet events`: `setMemberRole` logs `member.role_changed` with message containing the email and new role; `removeMember` logs `member.removed`; `createCustomer` logs `customer.created`; each carries `actorUserId` when passed.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**
  - `ingest.ts`: after the `payment.received` log, `if (settled) await logInvoicePaid(t, { businessId: biz.id, invoiceId: invoice.id })`.
  - `credit.ts`: after `credit.applied`, `logInvoicePaid(t, …actorUserId)`.
  - `resolution.ts` `executePlan`: after posting, for each invoice line call `logInvoicePaid`; when the case resolves without refund also log `case.resolved` ("Exception resolved"). `refunds.ts` confirmation path: log `case.resolved` (actor `system`) after `refund.confirmed`.
  - `syncCompany`: inside the running block after refunds, `await flagOverdueInvoices(db, businessId)`.
  - `createCustomer`: log `customer.created` ("<name> added as a customer", `customerId`).
  - `setMemberRole` / `removeMember`: look up the email (join `users`), log `member.role_changed` ("<email> is now <roleLabel>") / `member.removed` ("<email> was removed from the team"). Skip the log in `setMemberRole` when the role is unchanged.
  - `removeWallet`: log `wallet.removed` ("Receiving wallet removed: <label> (<short>)") — select the row first for its label.
  - `verifyCustomerCode`: after success, look up the case's `businessId`, `logEvent(db, { businessId, caseId, customerId, actor: "customer", type: "customer.verified", message: "Customer verified their email on the resolution link", dedupeKey: verified:<linkId> })`.
  - Thread `actorUserId` through the services and actions listed in Interfaces.
- [ ] **Step 4: Run** `npm test` → all pass (incl. Task 2's "every logged type is mapped" and `flow.test.ts`).
- [ ] **Step 5: Commit** `feat(notifications): log paid, overdue, resolved, verified, customer, team and wallet events`

### Task 4: Notifications service

**Files:**
- Create: `src/lib/server/notifications.ts`
- Test: `src/lib/server/notifications.test.ts`

**Interfaces:**
- Consumes: `enabledTypes`, `categoryOf`, `isCategoryId`, `CategoryId` (Task 2); schema (Task 1).
- Produces:
  - `type NotificationRow = { id: string; type: string; category: CategoryId; actor: string; message: string; createdAt: string; href: string; read: boolean }`
  - `listNotifications(db: Executor, p: { businessId: string; userId: string; limit?: number /* 30 */ }): Promise<NotificationRow[]>`
  - `unreadCount(db: Executor, p: { businessId: string; userId: string }): Promise<number>`
  - `markRead(db: Executor, p: { businessId: string; userId: string; eventId: string }): Promise<void>` — `InputError("Notification not found.")` if the event isn't the business's.
  - `markAllRead(db: Db, p: { businessId: string; userId: string }): Promise<void>`
  - `getMuted(db: Executor, p: { businessId: string; userId: string }): Promise<CategoryId[]>`
  - `setMuted(db: Executor, p: { businessId: string; userId: string; muted: string[] }): Promise<void>` — `InputError` on unknown ids; dedupes.
  - All throw `InputError("You're not a member of this company.")` when no membership row exists.
  - `href`: `/app/exceptions/<caseId>` → `/app/invoices/<invoiceId>` → `/app/customers` for `customers` category → `/app/settings` for `team` → `/app`.

- [ ] **Step 1: Write failing tests:**
  - `defaults: all on, own actions hidden`: an event logged with `actorUserId: editor.id` appears for owner, not for editor; a `customer`-actor and a `system` event appear for both.
  - `muting hides a category`: `setMuted(owner, ["payments"])` → no `payment.received` in list; `getMuted` → `["payments"]`; `setMuted(owner, [])` → back; `setMuted(owner, ["bogus"])` rejects.
  - `all muted`: muting all seven → list `[]`, `unreadCount` 0.
  - `per-item read`: `markRead` one id → that row `read: true`, `unreadCount` drops by 1, editor's view of the same event still unread; calling `markRead` again doesn't throw.
  - `mark all read`: → `unreadCount` 0; log a new event afterwards (with a `createdAt` strictly later — insert then compare) → `unreadCount` 1.
  - `isolation`: `someone@else.test` listing A → throws not-a-member; `markRead` on A's event with `businessId: bizB` → `/not found/`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** One query: `events` left-joined to `notification_reads` on `(event_id, user_id = :userId)`, filtered by `business_id`, `type in enabledTypes` (return `[]`/0 early when empty), `actor_user_id is distinct from :userId`; `read = readRow present or created_at <= membership.notificationsReadAt`. Order `created_at desc, id desc`. `markAllRead` sets the cursor to `new Date()` and deletes the user's read rows for that company's events created at or before it.
- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Commit** `feat(notifications): notification service with per-member prefs and read state`

### Task 5: Actions and header bell

**Files:**
- Create: `src/components/app/event-icons.ts` (move the `icons` map out of `activity.tsx`; add `invoice.paid` CircleCheckBig mint, `invoice.overdue` CalendarClock amber, `case.resolved` CircleCheckBig mint, `customer.verified` ShieldCheck violet, `customer.created` UserPlus fg-2, `member.added`/`member.role_changed` Users violet, `member.removed` UserMinus rose, `wallet.added`/`wallet.activated` Wallet cyan, `wallet.removed` Wallet rose, `proposal.declined` MessageSquareText amber, `credit.applied` BadgeCheck indigo). Export `eventIcon(type): { icon; tone }` with the existing fallback.
- Modify: `src/components/app/activity.tsx` to use it; extract `TimeAgo` to export from the same file (or `event-icons.ts` stays data-only and `TimeAgo` is exported from `activity.tsx`).
- Create: `src/components/app/notifications.tsx` (client) — `NotificationBell({ items, unread }: { items: NotificationRow[]; unread: number })`
- Modify: `src/app/actions/business.ts` — `markNotificationReadAction(eventId: string)`, `markAllNotificationsReadAction()`, `setNotificationPrefsAction(muted: string[])`; each `requireRole("viewer")`, `refresh()`.
- Modify: `src/app/app/layout.tsx` — load `listNotifications` + `unreadCount` in a `try/catch` (fallback `[]`, 0) and render `<NotificationBell>` before `<ThemeToggle />`.

**Interfaces:**
- Consumes: `NotificationRow`, service functions (Task 4). Import `NotificationRow` as a type only in the client component.

- [ ] **Step 1: Implement actions and bell.** Bell: button `aria-label="Notifications"` (`aria-expanded`), lucide `Bell`; badge `bg-violet text-white`-equivalent token (use `bg-violet` + `text-ink-900` or existing badge pattern), text `99+` above 99. Popover follows `WorkspaceSwitcher` (outside-mousedown closes; add Escape), `glass bg-ink-850/95 rounded-2xl`, `absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-32px))]`, list `max-h-[min(70vh,520px)] overflow-y-auto`. Header row: "Notifications" + "Mark all read" (disabled when `unread === 0`). Item: icon chip, message (`text-fg` if unread else `text-fg-2`), `TimeAgo`, violet dot if unread; click → `startTransition(async () => { if (!read) await markNotificationReadAction(id); router.push(href); setOpen(false) })`. Empty: "You're all caught up." Footer `Link` to `/app/settings#notifications` "Notification settings".
- [ ] **Step 2: Run** `npm run typecheck && npm run lint` → clean.
- [ ] **Step 3: Commit** `feat(notifications): header bell and actions`

### Task 6: Settings card

**Files:**
- Create: `src/app/app/settings/notifications.tsx` (client) — `NotificationSettings({ muted }: { muted: CategoryId[] })`
- Modify: `src/app/app/settings/page.tsx` — `getMuted(db, { businessId: biz.id, userId: user.id })`, render after Team in a `FadeIn`.

- [ ] **Step 1: Implement.** `Card id="notifications"`, `CardHeader title="Notifications" subtitle="Choose what shows up in your bell for this company. Only affects you."`. One row per `CATEGORIES` entry: label, description, a `button role="switch" aria-checked` toggle (track `bg-violet` when on, `bg-veil/15` off; thumb `bg-fg` token or `bg-ink-900`-contrast — use existing tokens). Optimistic local state, `setNotificationPrefsAction(next)`; on error revert and `toast.push({ tone: "error", title: "Couldn’t save notification settings", body })`.
- [ ] **Step 2: Run** `npm run typecheck && npm run lint` → clean.
- [ ] **Step 3: Commit** `feat(notifications): notification preferences in settings`

### Task 7: Verification

- [ ] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` — all pass.
- [ ] Start the dev server via preview tools (Docker Postgres on :55432 per CLAUDE.md), sign in with a demo email, create a demo company with sample data, run the guided demo far enough to generate events from the customer side; check: bell badge count, popover list, click-through marks read and navigates, mark all read, Settings toggles hide a category, light + dark, phone width (375px) no horizontal scroll, no console errors.
- [ ] Update `README.md` ("In the app" bullets) and `docs/architecture.md` if it lists tables, one or two lines each.
- [ ] Commit `docs: notifications`.

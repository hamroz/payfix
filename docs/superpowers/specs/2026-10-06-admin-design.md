# Platform admin and tester feedback — design

**Date:** 2026-10-06 · **Branch:** `feat/admin` · **Status:** approved in chat

## Goal

The people who operate PayFix get one place to see how the platform is used, collect structured feedback from testers, and stop abuse, without being able to browse what is inside a company.

Three parts:

1. **Admin area** (`/admin`): platform statistics, users, companies, feedback results, moderation, audit log, CSV exports.
2. **Tester survey** (`/feedback`): a public, translated form that testers fill in after the walkthrough. Results feed the admin area and `docs/evidence-log.md`.
3. **Moderation**: suspend/restore users and companies, sign a user out everywhere, block sign-in codes to an email, block the faucet for a wallet.

## Decisions

| Question | Decision |
| --- | --- |
| Where it lives | Same Next.js app, route tree `/admin`, own layout. No separate deployment |
| Who is an admin | Emails in the `ADMIN_EMAILS` env var (comma-separated, case-insensitive). Re-checked on every admin request, so removing an email revokes access immediately |
| Admin sign-in | Email code with purpose `admin`, session kind `admin`, cookie `pf_a`, 12-hour TTL. Codes are always delivered by real email, never shown in the demo inbox (see Security) |
| Identity visibility | Admins see account emails and company names. They never see a company's internal data (its customers, invoice titles, payment details) |
| Survey identity | Anonymous by default. A signed-in tester may tick "Attach my PayFix account" (off by default) |
| Survey content | One fixed survey in code, translated into all eight languages, mapping onto `docs/evidence-log.md` |
| Moderation set | Suspend/restore user, suspend/restore company, sign out everywhere, block sign-in codes for an email, block the faucet for a wallet |
| Accountability | Every admin action, every export, and every opened user/company detail page writes an `admin_audit` row. Actions require a reason |
| Tracking | None. Statistics are aggregate queries over the service's own tables. The privacy policy's "no analytics or tracking tools" stays true |

## Security

**Demo mode lets anyone sign in as any email**: the demo inbox (`/api/dev/inbox`) shows codes to whichever browser asked for them. Admin sign-in must therefore never use that path:

- Admin codes are queued with `businessId = null` and **status `pending`, never `demo`**, and are delivered through Resend even when `DEMO_MODE` is on. The demo inbox only lists `demo` rows (filter added explicitly), so admin codes never appear there.
- With no `RESEND_API_KEY`, admin codes are only printed to the server console, and only when `APP_URL` is a localhost URL. Otherwise admin sign-in reports that email isn't configured.
- `/admin/login` responds identically whether or not the email is on the allowlist; a code is only created for allowlisted emails.
- Every `/admin` page and `/api/admin/*` route returns 404 (`notFound()`) without a valid admin session for a currently allowlisted email.
- Admin sessions are a separate kind: an admin cookie is not a business session and vice versa.
- Admin sign-in codes are rate-limited like business codes (per email and per IP).
- Admin emails cannot be suspended or blocked from the admin UI.

## Privacy line

| Admin can see | Admin cannot see |
| --- | --- |
| User emails, sign-up date, companies (name + role), status, abuse signals | A company's customers (names, emails), invoice numbers/titles, notes, proposals |
| Company names, created date, member emails and roles, counts (invoices, payments, open cases), status | Per-company money amounts, wallet addresses or secrets, payment references, resolution links, sign-in codes |
| Platform-wide totals, including test-money volume (labeled with token and network) | Customer (end-client) sessions or activity details |
| Survey answers; the account only when the tester attached it | IP addresses (never stored) |

The privacy policy (all eight languages) gains: operators can see account emails and company names to run and secure the service; accounts and companies can be suspended for abuse; the optional feedback survey, what it stores, and that it is anonymous unless the tester attaches their account. The terms gain a sentence that the operator may suspend accounts or companies for abuse or fraud.

## Data model

One migration (`npm run db:generate`).

Existing tables:

- `users`: `suspended_at timestamptz`, `suspended_reason text`.
- `businesses`: `suspended_at timestamptz`, `suspended_reason text`.
- `invoices`: `sample boolean not null default false`, set by `seedSampleData` (company creation with "Add the demo customer and invoices", and demo reset). Lets statistics separate invoices people created from the seeded Acme invoices.
- `sessions.kind` and `otp_codes.purpose`: TypeScript enums gain `"admin"` (text columns, no DB constraint change).

New tables:

```
feedback_responses
  id text pk
  cohort text                       -- from ?c=, trimmed, ≤ 40 chars, [a-z0-9-]
  locale text not null
  completed text not null           -- "unaided" | "aided" | "no"
  minutes integer                   -- 0..240, optional
  ease integer not null             -- 1..5
  nps integer not null              -- 0..10
  answers jsonb not null            -- { happened, hesitated, voidedApproval, currentProcess, receiptTrust, blockers }: optional strings ≤ 2000
  about text                        -- optional, ≤ 200
  device text                       -- "phone" | "tablet" | "computer" | null
  quote_ok boolean not null default false
  user_id text references users(id) -- only when the tester ticked "attach my account"
  created_at
  index (created_at)

blocks
  id text pk
  kind text not null                -- "sign_in" | "faucet"
  target text not null              -- lowercased email (sign_in) or wallet address (faucet)
  reason text not null
  created_by text not null          -- admin email
  created_at
  lifted_at timestamptz
  lifted_by text
  unique index (kind, target) where lifted_at is null

admin_audit
  id text pk
  admin_email text not null
  action text not null              -- see Audit actions
  target_type text                  -- "user" | "business" | "block" | "export" | null
  target_id text
  reason text
  data jsonb
  created_at
  index (created_at)
```

Audit actions: `user.view`, `business.view`, `user.suspend`, `user.restore`, `user.sign_out`, `business.suspend`, `business.restore`, `block.add`, `block.lift`, `export`.

## Statistics (`/admin`)

All queries live in `src/lib/server/admin/stats.ts` and take `{ db }` and a range (`7d`, `30d`, `all`; default `30d`).

- **Tiles**: users, companies, active companies in range (≥ 1 event in range), invoices created by people (`invoices.sample = false`; seeded invoices shown separately), payments received (inbound transfers), open exceptions, feedback responses + NPS. Each with "+N in range" except NPS.
- **Growth**: new users and new companies per day across the range (all = last 90 days for the chart).
- **Activation funnel** (per user, cumulative): signed up → member of a company → a company of theirs issued a non-seeded invoice, or received a payment → resolved an exception → had a refund confirmed. Seeded invoices don't count, but payments, resolutions, and refunds on them do, since completing the demo flow is the activation signal.
- **Resolution health**: cases by kind and by status; median minutes from opened to resolved; approvals invalidated vs total approvals; refunds by status.
- **Money (platform totals)**: received, applied to invoices, credit held, refund pending, refunded, unresolved, from `postings` sums by account. Labeled with `PAYFIX_TOKEN_LABEL` and network. Never per company.
- **System**: outbox `pending`/`failed` counts, sign-in codes requested in 24 h (`otp_codes`), faucet uses in 24 h (`rate_events` keys starting `faucet:`), chain mode.

## Survey (`/feedback`)

Public page, localized, phone-first, glass style. Optional `?c=<cohort>`.

Fields, in order:

1. Did you finish the walkthrough? — Yes, without help / Yes, with some help / No (required)
2. About how many minutes did it take? (optional number)
3. How easy was it? 1–5 (required)
4. How likely are you to recommend PayFix to a business paid in stablecoins? 0–10 (required)
5. The six open questions from `docs/tester-walkthrough.md` (optional): what happened to the extra $100 and who decided; where you hesitated; whether you noticed the cancelled approval and whether that felt right; how you handle overpayments today; whether you'd trust the receipt and what's missing; what would stop you using it and what it would replace.
6. About you (optional): business type and size; device (phone / tablet / computer).
7. "You may quote my answers without my name" (checkbox).
8. "Attach my PayFix account to these answers" (checkbox, only shown when signed in, off by default).

Spam control: hidden honeypot input (a filled honeypot returns success without storing); `consume` limits of 5 per IP per day (hashed key) and 30 per hour globally. After submitting: a thank-you state.

Entry points: the link itself (sent by the team), and a "Tell us how it went" link on the Guided demo card once every step is ticked.

Server: `submitFeedbackAction` in `src/app/actions/feedback.ts` → `saveFeedback(db, input, { userId | null })` in `src/lib/server/admin/feedback.ts`, validated with zod; invalid input throws `InputError`.

## Admin feedback page

- Summary with sample sizes: responses; finished unaided / aided / not; median minutes; average ease; NPS (= %promoters − %detractors) with promoter/passive/detractor counts.
- Distributions for ease and NPS (bars).
- Filters: cohort, range.
- Response cards: every answer, cohort, language, device, date, "quotable" badge; for attached accounts the email and the furthest funnel step that account reached.
- Export as CSV with columns ordered like the evidence log.

## Users and companies

- **Users list**: search (email substring), status filter (all / active / suspended), newest first, paged 50. Columns: email, joined, companies, status, codes in 24 h. Admin emails are marked "Admin".
- **User detail**: companies (name, role, company status), active sessions count, codes requested 24 h / 7 d, companies created, linked feedback count, audit history, actions. Opening it writes `user.view`.
- **Companies list**: search (name substring), status filter, newest first, paged 50. Columns: name, created, members, invoices, payments, open exceptions, status, sample-data badge (company has any `sample` invoice).
- **Company detail**: members (email, role), counts, in-flight refunds count, audit history, actions. Opening it writes `business.view`.

## Moderation

All actions are server actions in `src/app/actions/admin.ts` → services in `src/lib/server/admin/moderation.ts`. Each requires an admin session and a non-empty reason (≤ 500 chars), runs in one DB transaction with its audit row, and is idempotent (suspending a suspended user is a no-op that still succeeds).

| Action | Effect | Enforcement point |
| --- | --- | --- |
| Suspend user | Sets `suspended_at/reason`; deletes all of the user's business sessions | `sendCode` (business purpose) refuses with `accountSuspended`; `currentUser()` returns null for a suspended user; `verifyCode` refuses |
| Restore user | Clears suspension | — |
| Sign out everywhere | Deletes the user's business sessions | — |
| Suspend company | Sets `suspended_at/reason` | `requireWorkspace` renders a "company suspended" page for members (other companies still open from the switcher, which shows a "Suspended" badge); `requireRole` throws `companySuspended`; public customer actions (`app/actions/public.ts`), the pay page, resolution page, and receipt show "unavailable"/refuse; demo reset refused. Chain ingest and refund reconciliation keep running so the ledger stays truthful |
| Restore company | Clears suspension | — |
| Block sign-in | Active `blocks` row (`sign_in`, email) | `sendCode` refuses for every purpose with `signInBlocked` |
| Block faucet | Active `blocks` row (`faucet`, wallet) | faucet action refuses with `faucetBlocked` |
| Lift block | Sets `lifted_at/by` | — |

Admin emails cannot be suspended, signed out, or sign-in-blocked (`cannotModerateAdmin`). Before confirming a company suspension, the dialog shows the number of refunds awaiting signature or submitted.

Moderation page: top sign-in-code requesters in the last 24 h (email, count, link to user if they exist), active blocks with "lift", and an add-block form.

## Exports

`GET /api/admin/export/[kind]` with `kind ∈ users | companies | feedback | daily | audit`, optional `range`. Admin session required (404 otherwise). CSV with a header row, RFC 4180 quoting, `text/csv; charset=utf-8`, attachment filename `payfix-<kind>-<date>.csv`. Each export writes an `export` audit row with `data: { kind, range, rows }`. Exports contain only fields the admin pages show.

## UI

- `src/app/admin/layout.tsx`: own shell (sidebar on desktop, tab bar on phones), "Admin" pill, admin email, `NetworkPill`, language switcher, theme toggle, sign out. Not inside `/app`.
- Pages: `/admin` (overview), `/admin/users`, `/admin/users/[id]`, `/admin/companies`, `/admin/companies/[id]`, `/admin/feedback`, `/admin/moderation`, `/admin/audit`, `/admin/login`.
- Charts are small inline SVGs built from theme tokens (no chart library). Amounts are `tabular` and formatted with `formatUsd`.
- i18n: new namespaces `admin` and `feedback`, new error keys (`accountSuspended`, `companySuspended`, `signInBlocked`, `faucetBlocked`, `cannotModerateAdmin`, `reasonRequired`, `rateFeedback`, `rateFeedbackGlobal`, `adminEmailUnavailable`), all eight languages.
- Suspended states for members, payers, and customers are translated pages using existing primitives.

## Testing

`src/lib/server/admin.test.ts` and `src/lib/server/feedback.test.ts`, PGlite + `SimChain`:

- Access: allowlist parsing; non-admin email gets the same response but no `otp_codes` row; admin outbox rows are never `demo`; admin and business sessions are not interchangeable; removing an email from the allowlist rejects an existing admin session.
- Stats: after the demo scenario, tiles, funnel, and money totals match ($1,100 received = $1,000 + $60 + $40, unresolved 0); sample invoices are separated.
- Privacy: rendered admin data and every export contain neither the seeded customer email `ap@acme.test`, nor the customer name, nor invoice titles.
- Moderation: each action's effect and its restore; a transfer that arrives while the company is suspended is still ingested and the ledger invariant holds; admin emails can't be moderated; idempotency.
- Audit: every action and export writes one row with its reason.
- Feedback: validation, honeypot, rate limit, account attached only when requested and signed in.

Manual: `/admin` and `/feedback` in the browser preview at phone and desktop width, light and dark.

## Docs

README "Admin and feedback" section; MILESTONES (M5 evidence, built beyond the plan); `docs/tester-walkthrough.md` (send `/feedback?c=…` instead of asking aloud; the questions stay as a fallback); `docs/evidence-log.md` (export mapping); `docs/runbook.md` (moderation procedures, emergency admin revoke); `docs/architecture.md`; `.env.example` (`ADMIN_EMAILS`). Deployments need `ADMIN_EMAILS` and `RESEND_API_KEY` set by the team.

## Delivery

- **PR 1** — schema, admin access, survey, overview stats, feedback page, exports, privacy policy and terms.
- **PR 2** — moderation (suspensions, blocks, sign-out, enforcement), users/companies detail actions, moderation and audit pages, docs.

## Out of scope

Survey builder, emailing suspended users, account deletion / erasure tooling, multiple admin levels, page analytics.

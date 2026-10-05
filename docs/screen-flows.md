# Screen flows (M1)

Updated Oct 5, 2026 for `main` with production mode (PR #8) and the audit fixes (PR #9).

Every route in `src/app`, who sees it, and the order a demo walks through them.

## Public and sign-in

| Route | Who | What it shows |
| --- | --- | --- |
| `/` | Anyone | Marketing page: detect → propose → approve → settle, reliability controls, and a "Try the live demo" button that goes to `/login`. |
| `/login` | Anyone | Email entry, then a 6-digit code. No passwords. In demo mode the **Demo inbox** (bottom left) shows the code. A signed-in user is redirected to `/app`. |
| `/onboarding` | Signed-in user | "Create your company": company name and, in demo mode, a checkbox (on by default) labeled "Add the demo customer and invoices". Outside demo mode it also asks for a receiving wallet. It lists existing companies to open instead. |

## Business view (`/app/*`, requires a business session and a membership)

On desktop there is a sidebar with nav and a company switcher with sign-out. On phones (below the `lg` breakpoint) there is a bottom tab bar with all six sections, and the company switcher with sign-out sits behind the initials button at the top right. The header has the live-sync indicator, the network pill ("test money"), the theme toggle, and a "View only" badge for viewers.

| Route | Content | Owner | Editor | Viewer |
| --- | --- | --- | --- | --- |
| `/app` | Overview: totals, "Where every dollar went", Needs attention, invoices, activity, and in demo mode the **Guided demo** checklist (8 steps that tick themselves off from real state) | ✓ | ✓ | ✓ (no "New invoice" button) |
| `/app/invoices` | Invoice list with status (Open / Partially paid / Paid / Overdue) | ✓ | ✓ | read |
| `/app/invoices/new` | New invoice form | ✓ | ✓ | redirected to `/app/invoices` |
| `/app/invoices/[id]` | Invoice detail: payments with Explorer links, allocations, exceptions, pay link with Copy, "Open payment page", and "Apply credit" when the customer has credit | ✓ | ✓ | read (no apply credit) |
| `/app/exceptions` | Cases grouped by kind, plus late payments | ✓ | ✓ | read |
| `/app/exceptions/[id]` | Case detail: "The money", the current plan version and its approvals, the timeline, and a **Next step** panel (attribute customer → send link → approve / request changes → run plan → sign refund → "Loop closed"). Once resolved it shows a "Shared receipt" button. | ✓ | ✓ | read ("You have view-only access") |
| `/app/customers` | Customers, balances, credit, and "Add customer" | ✓ | ✓ | read |
| `/app/ledger` | Double-entry journal and **Export CSV** (`/api/export/ledger`) | ✓ | ✓ | ✓ (export allowed) |
| `/app/settings` | Network and token, Team (invite, change role, remove), Receiving wallets (add, make active, remove), and in demo mode **Demo tools** (test-token faucet, "Reset the demo") | full | read-only team/wallets; faucet | read-only team/wallets; faucet |

The server enforces roles in every action (`requireRole` in `src/app/actions/business.ts`): `owner` for team, wallets, and reset; `editor` for customers, invoices, credit, case actions, and refunds; `viewer` for sync and refund status checks. The test-token faucet action has no role check.

## Customer view (no business account)

| Route | Access | Content |
| --- | --- | --- |
| `/pay/[invoiceId]` | Anyone with the link (the invoice ID is unguessable) | Amount due or remaining, a payments list, and three methods: **Demo wallet** ("Pay $X from demo wallet"), **Browser wallet** (connect Phantom/Solflare; on devnet it shows "Need test USD? Get 2,000 from the devnet faucet"), and **Scan QR** (with an "Open in wallet app" deep link). Overpay warnings, "Payment confirmed", and "Make another payment". Demo inbox. |
| `/r/[token]` | The token must be valid, unexpired (7 days), and not revoked, **and** the customer must verify by email code. Every action re-checks the session customer (`authorizedCase`). | Verify gate ("Email me a code"), then "Extra to allocate", the plan builder with presets ("Split 60 / 40", "Keep as credit", "Refund all", "Oldest invoices first"), refund wallet proof ("Connect refund wallet" or "Use demo wallet A/B"), "Send plan to …", plan status, "Change plan" (this warns that it voids an approval), the timeline, and "View receipt" when resolved. Demo inbox. |
| `/receipt/[caseId]` | A company member, or the verified case customer; otherwise "This receipt is private" | "Settled" / "In progress", the reconciliation of every dollar, incoming payments, the agreed plan, approvals, the refund, a test-money footer, and "Save as PDF". |

The **Demo inbox** is only rendered on `/login`, `/pay/[invoiceId]`, and `/r/[token]`, not inside `/app`. When the business sends a resolution link in demo mode, the case page shows the link with a Copy button.

## Demo walk order

This follows the Guided demo card and the final demonstration in MILESTONES.md.

1. `/` → `/login` (email and code from the Demo inbox) → `/onboarding` (company with demo data) → `/app`.
2. `/app` Guided demo step 1 opens `/pay/[INV-0001]` in a new tab. Pay **$600** from the demo wallet.
3. Same page: "Make another payment" → **$500**. The page shows "$100.00 … held for your decision".
4. Back in the business tab: `/app/exceptions` → the overpayment case → **Send resolution link** → copy the link.
5. Open `/r/[token]` → "Email me a code" → enter the code from the Demo inbox → "Split 60 / 40" → "Use demo wallet A" → "Send plan to …".
6. `/app/exceptions/[id]` → **Approve v1**.
7. `/r/[token]` → "Change plan" → "Split 60 / 40" → "Use demo wallet B" → "Send revised plan (v2)". On the case page the approval is voided and "Run plan" is gone.
8. `/app/exceptions/[id]` → **Approve v2** → **Run plan v2** → **Sign with demo merchant wallet** → wait for "Loop closed".
9. **Shared receipt** (`/receipt/[caseId]`): $1,100 = $1,000 + $60 + $40, with $0 unresolved. `/app/invoices` shows INV-0002 with $340 remaining. Optional: `/app/ledger` → Export CSV.

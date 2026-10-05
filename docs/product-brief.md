# PayFix product brief (M1)

Status: written Oct 5, 2026 from the code on `main` (Oct 5). States and names below match `src/lib/db/schema.ts` and the services in `src/lib/server/`.

## Problem

Stablecoin payments don't always match the invoice. A client sends too much, pays the same invoice twice, or sends a transfer with nothing that links it to an invoice. Today the business sorts this out by hand: it checks a block explorer, emails the client, agrees on a plan in a thread, and then sends a refund from a wallet. Nobody keeps a shared record of what was agreed, and nothing stops a refund going to the wrong address or being sent twice.

## Target customer

A small agency (design, development, marketing) that already accepts USDC on Solana from repeat clients. It has several open invoices per client, so extra money can usefully go to another invoice or be kept as credit instead of only being refunded. One or a few people handle billing.

Customer interviews have not confirmed this yet. See `docs/evidence-log.md`.

## Core flow

1. The business creates a customer and invoices. Each payment attempt gets a unique Solana Pay `reference` key.
2. The customer pays through the invoice's payment link (`/pay/[invoiceId]`).
3. PayFix reads the business's token account, verifies each transfer from its pre/post token balances, and applies it to the referenced invoice, up to the invoice's remaining balance.
4. Any excess, an apparent duplicate, or a transfer with no reference opens an **exception case**.
5. The business sends the customer a **resolution link**. The customer verifies by email code and proposes a plan: apply to another open invoice, keep as credit, refund, or a split. If the plan includes a refund, the customer signs a message with the refund wallet to prove they control it.
6. The business approves that exact **proposal version**, and the approval is bound to the version's hash. Any later change creates a new version, which voids the approval.
7. The business runs the plan. Allocations and credit post immediately, and the refund amount is reserved.
8. The business wallet signs the refund. PayFix tracks it until it is confirmed on chain, and then the case is resolved.
9. Both sides see the same receipt.

## Scope

**In scope (built):**
- Business workspace with companies, teams, and Owner/Editor/Viewer roles.
- Customers, invoices, payment links (demo wallet, browser wallet, Solana Pay QR / deep link).
- Partial payments, multiple payments per invoice, and late-payment flags.
- Exception cases: overpayment, apparent duplicate, and unmatched.
- Customer resolution link with email-code verification, versioned proposals, hash-bound approvals, and "request changes".
- Merchant-signed refunds that are reconciled against the chain, can be retried after blockhash expiry, and allow only one live attempt.
- Customer credit that can be applied to a later invoice once.
- Double-entry ledger, CSV export, a shared receipt (print/Save as PDF), and an activity timeline.
- Several receiving wallets per company, with one active.
- Demo mode: a server-held devnet wallet per company, a demo customer wallet, a test-token faucet, a demo inbox, and a per-company reset.

**Out of scope (from README/MILESTONES):** mainnet and customer funds, native apps, other chains and currencies, fiat and bank payouts, accounting sync (QuickBooks/Xero), escrow, lending, custom on-chain programs, and automatic tax reporting. PayFix can't see or prevent refunds sent from a wallet outside the app.

## Key states (as implemented)

### Payment (transfer)
A `transfers` row exists once per `(business, signature)`. It has no status column. What happens to it is recorded in the ledger:
- Every verified incoming transfer posts `external → unresolved`.
- If it carries a known reference, it then posts `unresolved → invoice` up to the invoice's remaining balance.
- Flag: `late` when it is received after the due date. Late payments are listed on the Exceptions page but don't open a case.
- Outgoing transfers are logged as events and never posted. Refunds post through reconciliation instead.

Invoice status is derived (`src/lib/server/views.ts`): `open` → `partial` → `paid`, or `overdue` when the due date passes while it is still unpaid.

### Case (`cases.kind`, `cases.status`)
- Kind: `overpayment` | `duplicate` (same payer, same amount, within 72 h, invoice already settled) | `unmatched` (no reference).
- Status: `open` → `proposed` → `approved` → `executing` (a refund is pending) → `resolved`.
  - From `approved`, the case goes back to `proposed` if the customer revises the plan.
  - From `proposed` or `approved`, it goes back to `open` if the business requests changes.
  - From `approved`, it goes straight to `resolved` if the plan has no refund.

### Proposal (`proposals.status`)
`submitted` → `approved` → `executed`. A `submitted` or `approved` version becomes `superseded` when the customer submits a new version, or `declined` when the business requests changes. Versions are immutable.

### Refund (`refunds.status`) and attempts (`refund_attempts.status`)
- Refund: `awaiting_signature` → `submitted` → `confirmed`. A refund in `submitted` can move to `failed` (it was rejected in preflight or failed on chain), or back to `awaiting_signature` (its blockhash expired and it never landed). Either way it can be signed again.
- Attempt: `prepared` → `submitted` → `confirmed`, or `expired` / `failed`. A partial unique index allows at most one `prepared`/`submitted` attempt per refund.

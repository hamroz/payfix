# Acceptance checklist (M1 / M6)

Updated Oct 5, 2026 for `main` with production mode (PR #8), the audit fixes (PR #9), and notifications (PR #11).

Each item maps to how it is verified today. Tick a box only after running the check on the build being released, and write the date and the commit next to it.

- **Unit/flow tests** (`npm test`): `src/lib/domain/*.test.ts`, `src/lib/solana/parse.test.ts`, `src/lib/server/*.test.ts` (flow, workspaces, production, notifications), and `src/app/actions/business.test.ts` (role enforcement in the server actions). These run on in-memory PGlite plus `SimChain`, not devnet.
- **e2e** (`node scripts/e2e.mjs <url>`): headless Chrome against a running app in demo mode. Steps are named by the `▸` headings it prints.
- **Manual**: no automated check exists. A person must look.

Run on: ________  Commit: ________  `npm test`: __/63 passed  e2e target: ________  result: ________

## The final demonstration (MILESTONES.md, 9 steps)

- [ ] **1. Invoice A $1,000 and invoice B $400 for the same customer.**
  - Automated: the `flow.test.ts` setup (`beforeAll`). e2e "Sign up and create a company" seeds them through onboarding (`seedSampleData`).
  - Manual: confirm INV-0001 and INV-0002 for Acme Robotics on `/app/invoices`.
- [ ] **2. Pay A with $600, then $500, in labeled test tokens on devnet.**
  - Automated: `flow.test.ts` "tracks $600 then $500 against a $1,000 invoice, leaving $100 excess" (simulated chain). e2e "Customer pays $600, then $500" (devnet when the target runs on devnet).
  - Manual: open both Explorer links on the invoice page and check they show devnet.
- [ ] **3. Show $1,100 received, $1,000 covering A, $100 to resolve.**
  - Automated: same flow test (`applied = 1000`, `caseAvailable = 100`) and "never double-counts when the same transfers are processed again" (`received = 1100`). e2e waits for "held for your decision".
  - Manual: the overview totals and the case page "The money" card.
- [ ] **4. Customer opens an authenticated link and proposes $60 → B, $40 refund.**
  - Automated: `flow.test.ts` "verifies the customer by email code before a session exists" and "only lets the invoice customer propose, and only with a proven refund wallet". e2e "Customer verifies and proposes $60 → INV-0002 + $40 refund".
- [ ] **5. Business approves that exact version.**
  - Automated: `flow.test.ts` "invalidates an approval when the refund destination changes" (approves v1). e2e approves only v2.
  - Manual: the approval chip shows the hash prefix on the case page.
- [ ] **6. Change the refund destination after approval; approval becomes invalid; execution is blocked until v2 is approved.**
  - Automated: `flow.test.ts` "invalidates an approval when the refund destination changes", which checks that `executePlan` rejects with "needs an approval" and that approving v1 again rejects with "newer version".
  - **The e2e does not cover this path.** It uses "Request changes" on an unapproved v1 instead (that variant is covered by `workspaces.test.ts` "asks for changes, voids the approval, and accepts a revised version").
  - Manual: approve v1 in the UI, change to demo wallet B, then confirm "Run plan" disappears and the timeline says the approval no longer applies.
- [ ] **7. Execute the $40 refund from the business wallet and verify confirmation.**
  - Automated: `flow.test.ts` "allows one in-flight refund, confirms it once, and reconciles every dollar". e2e "Customer revises (wallet B), business approves v2 and refunds" waits for "Loop closed".
  - Manual: open "Refund on Explorer".
- [ ] **8. A settled, B with $340 remaining, refund confirmed, $0 unresolved.**
  - Automated: `flow.test.ts` asserts B `remaining = 340`, `refunded = 40`, `unresolved = 0`. e2e "Receipt reconciles" checks $1,100 / $1,000 / $60 / $40 / $0.00.
  - Manual: e2e doesn't check B's $340 in the UI, so look at `/app/invoices`.
- [ ] **9. Shared receipt with both incoming transactions, allocations, approvals, and the refund transaction.**
  - Automated: e2e checks the totals and "Settled" only.
  - Manual: check that the receipt lists 2 incoming payments with Explorer links, plan v2, the approvals (including the voided v1), and the refund signature. Open it from the customer side (`/r/[token]` → "View receipt") as well as the business side.
- [ ] **Totals still correct after a reload** (M6). Manual.
- [ ] **`$1,100 = $1,000 + $60 + $40`, and a pending or failed refund is never shown as completed.** Automated: `flow.test.ts` (ledger identity assertion) and "treats an expired, never-landed refund as safe to retry". Manual: look at the UI while a refund is "Confirming…".

## Reliability gates (MILESTONES.md, 12 gates)

- [ ] **1. Verify network, mint, recipient, amount, and confirmation; use exact units.**
  - Automated: `domain.test.ts` "money" (round-trip, rejects over-precise amounts) and `src/lib/solana/parse.test.ts` "verifying an incoming payment" (exact amount of the configured mint into the business's own token account; ignores a different mint, a failed transaction, a transfer to another account, and a no-op touch). Transactions are fetched at `confirmed` commitment.
- [ ] **2. Allocate only up to the verified amount; never count a transfer twice or reuse it across invoices.**
  - Automated: `domain.test.ts` "splits a payment that exceeds the remaining balance into applied and excess". `flow.test.ts` "never double-counts…". `workspaces.test.ts` "never matches one company's payment reference inside another company".
  - Concurrent ingestion of the same signature isn't tested; it relies on the `chain_signatures` claim inside the DB transaction.
- [ ] **3. Unreferenced or ambiguous transfers stay unmatched; amount alone is not evidence.**
  - Automated: `flow.test.ts` "parks transfers without a reference as unmatched".
  - Manual: attribute an unmatched payment to a customer and confirm the customer still has to propose a plan.
- [ ] **4. Customer isolation; resolution links authenticated with expiry/revocation.**
  - Automated: `flow.test.ts` "only lets the invoice customer propose…" and "verifies the customer by email code…". `workspaces.test.ts` cross-company "not found" checks.
  - **Gap:** expired and revoked links (`findLink` reasons) and the `authorizedCase` check in `src/app/actions/public.ts` are not tested. Manual: press "Resend resolution link" and confirm the old link shows "replaced by a newer one".
- [ ] **5. A proposal can't allocate or refund more than the available excess, even with concurrency or later payments.**
  - Automated: `domain.test.ts` "rejects plans that over-allocate, under-allocate, or refund without a destination" and "rejects allocating more to an invoice than it has remaining…". `flow.test.ts` rejects a $150 refund.
  - **Gap:** the execution-time re-check (the unresolved amount changed, or an invoice no longer has room) isn't tested.
- [ ] **6. A changed plan invalidates approval; execution re-checks the version.**
  - Automated: `flow.test.ts` "invalidates an approval when the refund destination changes". `workspaces.test.ts` "asks for changes, voids the approval…". `domain.test.ts` "changes the hash when the destination, an amount, or the version changes, but not the line order".
- [ ] **7. One active refund attempt; verify the outcome before offering a retry.**
  - Automated: `flow.test.ts` "allows one in-flight refund…" (a tampered transaction is rejected, a double submit is rejected) and "treats an expired, never-landed refund as safe to retry — but not before expiry".
  - The partial unique index under truly concurrent requests isn't tested.
- [ ] **8. Pending, failed, and confirmed are distinct; partial progress is visible.**
  - Automated: `flow.test.ts` "treats an expired…" (`refund_pending` stays reserved while `awaiting_signature`).
  - **Gap:** the `failed` path (`markFailed`, a preflight rejection) isn't tested. Manual: on devnet, drain the merchant wallet's SOL and sign a refund. It should show "The last attempt failed on chain" and stay reserved.
- [ ] **9. Credit is recorded once and applied once.**
  - Automated: `workspaces.test.ts` "applies customer credit once, never past the invoice or the credit" (two concurrent `applyCredit` calls) and "asks for changes…" (credit of $40 kept).
- [ ] **10. Refund destination tied to the authenticated invoice customer.**
  - Automated: `flow.test.ts` "only lets the invoice customer propose, and only with a proven refund wallet" (another customer is rejected, and a signature from the wrong wallet is rejected).
- [ ] **11. Private details stay off chain; public receipts disclose only what is intended.**
  - Manual only. On Explorer, check that a payment carries only the random reference key and a refund carries only the memo `payfix:refund:<id>`.
  - The Solana Pay link/QR passes the business name and "INV-xxxx · title" to the payer's wallet app as `label`/`message`. These are not written on chain.
  - The receipt requires a member or the verified customer.
- [ ] **12. Test money, synthetic cases, real interviews, and live activity stay distinguished.**
  - Manual: NetworkPill ("test money") on every screen, and the receipt footer.
  - `env()` throws if `DEMO_MODE` is used with `mainnet-beta`, but no test covers this.
  - Evidence separation: `docs/evidence-log.md`.

## Roles and tenancy (built beyond the plan)

- [ ] Viewer sees the company read-only and can't create invoices. e2e "Owner invites a viewer; the viewer gets read-only access".
- [ ] Server rejects editor-only actions from a viewer, and owner-only actions from an editor. `business.test.ts` calls every editor and owner server action as a signed-in viewer (and the owner actions as an editor), checks each is refused, and checks nothing was written.
- [ ] Team always keeps at least one owner. `workspaces.test.ts` "manages the team and never leaves a company without an owner".
- [ ] Reset clears one company only. `workspaces.test.ts` "resets one company without touching another".

# How it works and reliability gates

```
Customer wallet ──transfer + reference──▶ Merchant token account
                                               │  poll signatures (idempotent)
                                               ▼
                    parse pre/post token balances ─▶ transfers (unique per signature)
                                               │
                     invoice reference? ──yes──▶ apply up to balance ─▶ excess? ─▶ case
                                    └──no──────────────────────────────────────▶ unmatched case
                                               │
     resolution link ─▶ email code ─▶ versioned proposal (+ wallet-signed destination)
                                               │
                   hash-bound approval ─▶ execute: post allocations, reserve refund
                                               │
     prepare exact tx ─▶ merchant wallet signs ─▶ record signature ─▶ broadcast ─▶ reconcile
```

- **Matching.** Each payment request gets a unique Solana Pay `reference` key, appended to the transfer as a read-only account. Amount alone is never used to match. Transfers without a reference stay **unmatched** until the business attributes them, and even then the customer confirms the plan.
- **Verification.** Amounts come from the transaction's pre/post token balances for the configured mint on the merchant's token account, not from instruction data. Failed transactions are ignored.
- **Ledger.** Double-entry journal in integer token units (bigint). Money enters through `external` and then only moves between `unresolved`, `invoice`, `credit`, `refund_pending`, and `refunded`. Every entry sums to zero and has a unique idempotency key.
- **Approvals.** A proposal version is immutable. Its SHA-256 hash covers the case, version, available amount, every allocation, and the refund destination. Execution re-checks the hash, the current version, the available excess, and each invoice's remaining balance.
- **Refunds.** The server prepares the exact transaction and the business wallet signs it. PayFix checks the signed bytes match what it prepared, **records the signature before broadcasting**, and allows only one live attempt per refund (enforced by a partial unique index). A retry is offered only after the blockhash has expired without the transaction landing.

## Reliability gates → where they live

| Gate (from MILESTONES.md) | Implementation | Tested in |
| --- | --- | --- |
| Verify mint, recipient, amount, confirmation; exact units | `src/lib/solana/parse.ts`, `src/lib/money.ts` | `domain.test.ts`, `flow.test.ts` |
| Same transfer never counted twice | `chain_signatures` PK, unique transfer per signature, keyed journal entries (`src/lib/server/ingest.ts`, `journal.ts`) | "never double-counts…" |
| Unreferenced transfers stay unmatched | `ingest.ts` | "parks transfers without a reference…" |
| Customer isolation; authenticated links with expiry/revocation | `resolution.ts` (`findLink`), `auth.ts`, `app/actions/public.ts` | "only lets the invoice customer propose…", "verifies the customer by email code…" |
| Can't allocate or refund more than the excess | `domain/proposal.ts`, `executePlan` re-checks | "rejects plans that over-allocate…" |
| Changed plan invalidates approval | `submitProposal`, `approveProposal`, `executePlan` | "invalidates an approval when the refund destination changes" |
| One in-flight refund; verify outcome before retry | `refunds.ts`, `refund_attempts_one_active` index | "allows one in-flight refund…", "treats an expired, never-landed refund as safe to retry…" |
| Pending / failed / confirmed are distinct; partial progress visible | `refund_pending` vs `refunded` accounts, refund statuses | same |
| Refund destination tied to the authenticated customer | wallet-signature proof (`solana/proof.ts`) required in `submitProposal` | "only lets the invoice customer propose…" |
| Private details off chain | Only a random reference key and a refund-id memo go on chain | — |
| Test money clearly labeled | Network pill on every screen, receipt footer, `DEMO_MODE` refuses mainnet | — |

## Project layout

```
src/lib/domain/      pure logic: allocation, ledger postings, proposal validation and hashing
src/lib/solana/      transaction builders, transfer parsing, wallet-signature proofs (no secrets)
src/lib/server/      services: ingest, resolution, refunds, auth, demo; chain client + simulator
src/lib/db/          Drizzle schema and client (PGlite or node-postgres)
src/app/             Next.js App Router: marketing, /app (business), /pay, /r (customer), /receipt
drizzle/             SQL migrations
scripts/             devnet setup
brand/               logo, intro video, and its renderer
```

Light and dark themes share the brand palette (indigo, violet, mint, cyan); the header toggle cycles System → Light → Dark and remembers the choice.

Tech: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion, Drizzle ORM, PGlite/Postgres, `@solana/web3.js`, `@solana/spl-token`, Solana wallet adapter (Wallet Standard).

## Scope and honesty

- **Test money only.** Demo mode is devnet or simulated, and refuses to run against mainnet. USDC is the intended production asset. Mainnet and customer funds need a separate launch review.
- PayFix records transfers it observes on the merchant's token account and refunds it initiates. It can't prevent or see refunds sent directly from a wallet outside the app.
- Demo wallets are server-held devnet keys, so the demo can run without extensions. With a real business, the business signs in its own wallet.
- Out of scope: native apps, other chains/currencies, fiat, accounting integrations, escrow, custom on-chain programs.

See [MILESTONES.md](../MILESTONES.md) for the delivery plan and acceptance gates.

# PayFix

**Turn incorrect stablecoin payments into an agreed, completed settlement through one shared resolution link.**

PayFix is a payment-resolution app for small agencies that accept USDC on Solana from repeat clients. It connects invoices to on-chain payments, flags payments that don't match (overpayments, apparent duplicates, transfers without a reference), and gives the customer and the business one place to agree on what happens to the extra money: apply it to another invoice, keep it as credit, refund it, or split it.

> **Status:** working beta. Build and AI-drafted deliverables for every milestone are done; external walkthroughs, rehearsals, and the submission remain (see [MILESTONES.md](MILESTONES.md#progress-and-evidence)). Live demo: **https://payfix-mu.vercel.app** (Solana devnet, test money only). Runs locally with Docker, on devnet or a simulated chain.

## The demonstration

1. Invoice A is **$1,000**, invoice B is **$400**, both for Acme Robotics.
2. Acme pays **$600**, then **$500** toward A. PayFix applies $1,000 to A and flags **$100** as excess.
3. Lumen Studio (the business) sends Acme a resolution link. Acme verifies by email code and proposes **$60 → B, $40 refund**, proving the refund wallet by signing with it.
4. The business approves that exact version (the approval is bound to a hash of the plan).
5. Acme changes the refund wallet. The approval is voided and execution is blocked until v2 is approved.
6. The business approves v2, runs the plan, and signs the $40 refund from its wallet.
7. A is settled, B has **$340** remaining, the refund is confirmed, and unresolved excess is **$0**.

**$1,100 received = $1,000 applied to A + $60 applied to B + $40 refunded.** Both sides get the same receipt.

## Quick start (Docker)

```bash
docker compose up -d --build        # or: npm run docker:up
```

Open **http://localhost:3300** and click **Try the live demo**.

PayFix runs as its own compose project (`payfix`) with its own network and volumes: the app on **:3300** and Postgres on **127.0.0.1:55432** (local only). It won't collide with other stacks. Change the ports with `PAYFIX_PORT` / `PAYFIX_DB_PORT` if you need to. Stop it with `docker compose down`; add `-v` to also wipe its data.

In the app:

- Sign in with **any email**. Demo mode doesn't send real email, so sign-in codes and customer emails appear in the **Demo inbox** (bottom left of the sign-in, pay, and resolution pages), which only shows your own messages, and in `docker compose logs app`. Inside the app, the case page shows the resolution link it just sent. New users create a company; in demo mode it gets its own devnet wallet and, optionally, the demo customer with invoices A and B.
- The **Guided demo** card on the overview walks through the scenario and ticks itself off from real state.
- The **bell** in the header lists notifications for the company you are in: payments, exceptions, resolutions, refunds, invoices (including paid in full and overdue), customers, and team or wallet changes. It skips what you did yourself. Each person turns categories on or off in **Settings → Notifications** (all on by default).
- Payments use the **demo customer wallet**, and refunds are signed by the **demo merchant wallet**, so no browser extension is needed.

With no `.env.local`, PayFix runs on a **simulated chain** (clearly labeled in the UI), so nothing touches a real network.

### Local development with hot reload

```bash
npm install
npm run db:up                        # Postgres only, in Docker, on 127.0.0.1:55432
echo 'DATABASE_URL=postgres://payfix:payfix@127.0.0.1:55432/payfix' >> .env.local
npm run dev                          # http://localhost:3000
```

Without `DATABASE_URL`, `npm run dev` falls back to an embedded Postgres (PGlite) in `.data/pglite`. It allows **one process at a time**, so don't run two dev servers on it. Prefer the Docker Postgres.

### Running on Solana devnet

```bash
npm run setup:devnet
```

This creates three devnet keypairs (treasury/mint authority, demo merchant, demo customer), a 6-decimal **test-token mint**, and funds the demo wallets, then writes everything to `.env.local`. The public devnet faucet is rate limited. If the airdrop fails, the script prints the treasury address to fund at https://faucet.solana.com; after that, run the script again.

Then restart: `npm run docker:up` for Docker (the container reads `.env.local`), or restart `npm run dev`. The app now:

- verifies real transfers on devnet, with Solana Explorer links for every transaction;
- lets customers pay with **Phantom/Solflare** (browser wallet or Solana Pay QR) as well as the demo wallet;
- offers a **test-token faucet** (on the pay page and in Settings) so a judge's own wallet can pay;
- lets the business switch its receiving wallet to Phantom and sign refunds there.

To use your own Phantom as the customer from the start, run `npm run setup:devnet -- --to <your devnet address>`.

To make wallets show the test token as **PayFix Test USD (tUSD)** with the PayFix logo instead of an unknown token, run `npm run setup:token-metadata` once (it writes Metaplex token metadata pointing at `/token/test-usd.json` on the live demo; rerun to update).

**Paying from a phone wallet:** in Phantom, open Settings → Developer Settings, turn on Testnet Mode, and choose Solana Devnet. On the pay page, choose **Scan QR** → "Paying from a phone wallet? Get test USD first", paste the phone wallet's address, then scan. The faucet is limited per wallet, per network, and overall, and it stops handing out SOL when the treasury runs low.

### Companies, teams, and roles

Each user can belong to several companies and switch between them from the company menu (the sidebar on desktop, the initials button top-right on phones). In **Settings → Team**, owners invite people by email:

| Role | Can |
| --- | --- |
| Owner | Everything, plus team, receiving wallets, and resetting demo data |
| Editor | Invoices, customers, resolution links, approvals, running plans, signing refunds |
| Viewer | Read everything and export CSV |

The server checks the role on every action; the UI also hides what a role can't do. Companies are isolated from each other: payment references, inbox messages, live sync, and demo resets are all scoped to one company.

### Other commands

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests plus the demo scenario, payment verification, tenant isolation, role and team rules, role enforcement in every business server action, notifications, credit, rate limits, wallet proofs, and email delivery, against in-memory Postgres and a simulated chain |
| `npm run setup:token-metadata` | Names the devnet test token "PayFix Test USD" with the PayFix logo, so wallets recognize it |
| `npm run e2e [url]` | Rehearses the whole demo in headless Chrome against a running app (default `http://localhost:3300`), on devnet |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run build` | Production build |
| `npm run docker:up` / `docker:down` / `docker:logs` | Build and run, stop, or tail the Docker stack |
| `npm run db:up` | Start only the Postgres container |
| `npm run db:generate` | Generate a migration after editing `src/lib/db/schema.ts` (migrations apply automatically at startup) |

For deployment, set `DATABASE_URL` to a hosted Postgres (for example Neon on Vercel). Migrations run automatically on first connection.

## Production deployment

PayFix runs as **two deployments of the same code**: a public **demo** on devnet (what judges and testers use) and a **production** site on mainnet with demo features off. They never share a database or keys.

| Setting | Demo (devnet) | Production (mainnet) |
| --- | --- | --- |
| `SOLANA_CLUSTER` | `devnet` | `mainnet-beta` |
| `SOLANA_RPC_URL` | public devnet | a paid RPC (Helius, Triton, QuickNode…); the public endpoint is rate limited |
| `PAYFIX_MINT` / label | test mint / "Test USD" | empty → Circle's USDC / "USDC" |
| `DEMO_MODE` | `true` | `false` (startup refuses demo mode on mainnet) |
| Email | demo inbox in the app | `RESEND_API_KEY` + `EMAIL_FROM` on a verified domain |
| `SESSION_SECRET` | random | random and different (startup refuses the default on mainnet) |
| `DEMO_URL` | — | the demo's URL, for the landing page's "Try the live demo" |
| `DATABASE_URL` | its own Neon database | its own Neon database, in the **same region** as the functions |

What production mode changes:

- **No demo machinery:** no demo inbox, demo wallets, faucet, server-held keys, or reset. Refunds are always signed in the business's own wallet.
- **Real email:** codes and links are queued in the same transaction as the change they announce, delivered through Resend after commit, retried on failure, and erased from the database once sent.
- **Proven receiving wallets:** a business can only add a wallet it signs for, so a mistyped address can't receive customers' payments.
- **Abuse limits:** sign-in codes are limited per address and per network.
- **Security headers:** no framing (clickjacking), HSTS, nosniff, strict referrer policy.
- **Health check:** `GET /api/health` reports database status, the function and database regions, and a warm query time. A large `dbMs` means they're in different regions.

Before launching on mainnet: give preview deployments their own database (a Neon branch), not production's; verify the email domain in Resend; set the Vercel function region to the Neon region; add Terms and Privacy pages reviewed by someone qualified; and run the full flow with a small real USDC amount.

## How it works

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

### Reliability gates → where they live

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

See [MILESTONES.md](MILESTONES.md) for the delivery plan and acceptance gates.

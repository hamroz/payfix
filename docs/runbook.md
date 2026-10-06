# Runbook: recovery and reset (M6)

Updated Oct 6, 2026 for `main` with production mode (PR #8), the audit fixes (PR #9), and the admin area.

Live demo: **https://payfix-mu.vercel.app** (Vercel, Neon Postgres, Solana devnet, `DEMO_MODE=true`).

## Quick health check

1. Open the live demo. The network pill should say **devnet · test money**.
2. Run the end-to-end rehearsal against it (see below). If it passes, the full demo works.
3. `GET /api/health` reports database status and latency, the Vercel and Neon regions, and the treasury's SOL balance in demo mode. `demoTreasuryLow: true` means it's under 0.2 SOL; a `dbMs` above ~20 means the functions and database are in different regions.

## Reset one demo company

Only an **Owner** can do this, and only in demo mode.

1. Sign in as an owner of the company and open **Settings → Demo tools → Reset the demo**.
2. Confirm the browser prompt.

What it does (`resetWorkspaceAction` → `clearWorkspaceData` + `seedSampleData`):
- It deletes that company's invoices, payments, cases, proposals, refunds, ledger, events, and demo-inbox mail.
- It recreates Acme Robotics with INV-0001 ($1,000) and INV-0002 ($400).
- It keeps the company, its team, and its wallets. Chain history is marked as seen, so old payments are not re-imported.
- No other company is affected (`workspaces.test.ts` "resets one company without touching another").

For a completely fresh start, create a new company from the company menu instead (sidebar on desktop, the initials button top-right on phones). Demo company creation is limited to 5 per user per day and 60 per hour overall.

## Treasury SOL is low (devnet)

**What spends treasury SOL:**
- Every new demo company: 0.01 SOL plus token-account rent (`provisionDemoWallet`).
- Every faucet call to a wallet holding under 0.01 SOL: 0.02 SOL plus rent.
- Token accounts opened for added wallets.

The faucet needs no sign-in, so it's limited: once per wallet per 10 minutes (5 a day), 10 per network per hour, and 120 per hour overall. It refuses company receiving wallets and wallets already holding 10,000+ test USD. Below 0.05 SOL the treasury refuses new demo companies and faucet SOL with a clear message instead of failing mid-transaction.

**Symptoms:** "Create company" spins and then fails, the faucet fails, or demo payments fail when the demo customer needs a top-up.

**Fix:**
1. Find the treasury address. Pick one:
   - Run `npm run setup:devnet` **with the same `.env.local` whose `DEMO_TREASURY_SECRET` matches the Vercel environment**. It prints `treasury <address>` first.
     - Without that file it **generates new keys**, which are the wrong address.
     - It also writes `.env.local` and may transfer SOL and mint tokens.
   - Read-only alternative. This derives the public key without printing the secret:
     ```bash
     set -a; . ./.env.local; set +a
     node -e 'const {Keypair}=require("@solana/web3.js");const b=require("bs58");const bs58=b.default??b;console.log(Keypair.fromSecretKey(bs58.decode(process.env.DEMO_TREASURY_SECRET)).publicKey.toBase58())'
     ```
2. Go to **https://faucet.solana.com**, choose **devnet**, paste the address, and request SOL. The faucet is rate limited, so retry later or use another devnet faucet.
3. No redeploy is needed.

## A company's merchant wallet is low on SOL (refund fails)

The refund shows "The refund wasn't sent: the business wallet doesn't have enough funds or SOL for fees. Nothing moved…". The refund stays reserved.

1. Copy the **Active receiving wallet** address from **Settings → Network and token**.
2. Send it devnet SOL from https://faucet.solana.com.
3. Sign the refund again from the case page.

**Don't** use the in-app *test-token* faucet on the company's own receiving wallet. It mints 2,000 test USD into that wallet, and PayFix will record that as a $2,000 **unmatched** incoming payment.

If the demo **customer** wallet runs out of SOL for fees, demo payments fail. Send it devnet SOL the same way. The address is printed as `customer` by `setup:devnet`.

## A refund looks stuck

States: `awaiting_signature` → `submitted` → `confirmed`, with `failed` or blockhash expiry returning it to signable.

1. **Wait.** Refunds reconcile automatically. The case page checks the refund status itself, and open pages poll `/api/sync` every ~4 s, which also reconciles submitted refunds.
2. **Still "Confirming on devnet…" after a minute or two:** reload the case page.
   - If the transaction landed, it becomes **confirmed**, the case resolves, and you see "Loop closed".
   - If it never landed and its blockhash expired (~150 blocks, about a minute or two), PayFix marks the attempt **expired**. The timeline says "expired without landing. No funds moved; it's safe to sign again", and the sign button reappears. Sign again.
3. **"The last attempt failed on chain":** nothing moved and the amount is still reserved. Fix the cause (usually SOL for fees, see above) and sign again.
4. **Never** send the refund manually from a wallet outside PayFix. PayFix would see an outgoing transfer but would not post it as the refund. The $40 would stay in `refund_pending` and the case would never resolve.
5. You can't create a second attempt while one is live and its blockhash is still valid. The database enforces this with the `refund_attempts_one_active` index.

## Rerun the end-to-end rehearsal

```bash
node scripts/e2e.mjs https://payfix-mu.vercel.app   # or: npm run e2e -- https://payfix-mu.vercel.app
node scripts/e2e.mjs                                # default http://localhost:3300
```

- It needs Google Chrome at `/Applications/Google Chrome.app/...`, or set `CHROME=/path/to/chrome`. The target must have `DEMO_MODE` on.
- Each run signs up a new user (`e2e+<timestamp>@demo.test`), creates a new demo company (this spends treasury SOL), and invites a viewer.
- Debugging: `E2E_DEBUG=1` prints console errors. `E2E_SHOTS=<dir>` saves a screenshot.
- It exits non-zero and prints the page text on the first step that times out.

## Docker (local)

```bash
docker compose up -d --build      # app :3300, Postgres 127.0.0.1:55432 (project "payfix")
docker compose ps                 # status
docker compose logs -f app        # logs; demo sign-in codes are printed here too
docker compose down               # stop (keeps data)
docker compose down -v            # stop and wipe data volumes
npm run db:up                     # Postgres only, for `npm run dev`
```

The app container reads `.env.local`. After `npm run setup:devnet`, run `docker compose down -v && npm run docker:up` for fresh demo data on devnet. Don't change the ports to 3100/5432/6379/7700/8100/9000, which are used by other local stacks. Use `PAYFIX_PORT` / `PAYFIX_DB_PORT` instead.

## Roll back a Vercel deploy

1. Open the Vercel dashboard → the PayFix project → **Deployments**.
2. Find the last known-good production deployment → **⋯ → Promote to Production** (Instant Rollback).
3. Run the e2e against the live URL.

Caveat: rolling back code does not roll back the database. Migrations in `drizzle/` apply automatically on first connection. If the bad deploy added a migration, the older code runs against the newer schema. Today's migrations only add tables and columns, but check before rolling back past one.

## Admin access and moderation

- **Add or remove an admin:** edit `ADMIN_EMAILS` (comma-separated) in the deployment's environment and redeploy. Removal takes effect on the next request, even for a signed-in admin. Admin sign-in needs `RESEND_API_KEY`; with Resend's shared test sender only the Resend account owner receives mail, so verify a domain and set `EMAIL_FROM` if other admins need codes.
- **Emergency:** if an admin account may be compromised, remove it from `ADMIN_EMAILS` and redeploy. Admin sessions also expire after 12 hours.
- **Abuse:** check `/admin/moderation` for addresses requesting many sign-in codes. Block sign-in codes to an address, or the faucet for a wallet, there. Suspend an account or company from its page under Users or Companies. Every action needs a reason and is listed in `/admin/audit`.
- **Suspending a company with refunds in flight:** the confirmation shows how many. Nobody can sign a refund until the company is restored. Nothing polls a suspended company, so refunds already submitted and payments that arrive meanwhile are reconciled on the first sync after it is restored. The ledger is never changed by a suspension.
- **Delete test data:** in `/admin/companies`, `/admin/users`, or `/admin/feedback`, tick the rows (or "Select all on this page"), choose **Delete selected**, give a reason, and type `DELETE`. Anything that can't be deleted (a refund in flight, or a sole owner of a shared company) is listed and skipped. Deletion can't be undone; the audit log keeps each item's id and name or email.
- **Restore:** open the user or company and choose **Restore**. Nothing is lost: suspension never changes the ledger.

## Local dev gotchas

- Without `DATABASE_URL`, `npm run dev` uses PGlite in `.data/pglite`, which allows **one process at a time**. Prefer the Docker Postgres.
- With no `.env.local`, the app runs on the **simulated chain**, which is clearly labeled. Nothing touches a network.

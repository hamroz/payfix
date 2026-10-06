# Getting started

Run PayFix locally, on a simulated chain or on Solana devnet.

## Docker

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

## Local development with hot reload

```bash
npm install
npm run db:up                        # Postgres only, in Docker, on 127.0.0.1:55432
echo 'DATABASE_URL=postgres://payfix:payfix@127.0.0.1:55432/payfix' >> .env.local
npm run dev                          # http://localhost:3000
```

Without `DATABASE_URL`, `npm run dev` falls back to an embedded Postgres (PGlite) in `.data/pglite`. It allows **one process at a time**, so don't run two dev servers on it. Prefer the Docker Postgres.

## Running on Solana devnet

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

## Companies, teams, and roles

Each user can belong to several companies and switch between them from the company menu (the sidebar on desktop, the initials button top-right on phones). In **Settings → Team**, owners invite people by email:

| Role | Can |
| --- | --- |
| Owner | Everything, plus team, receiving wallets, and resetting demo data |
| Editor | Invoices, customers, resolution links, approvals, running plans, signing refunds |
| Viewer | Read everything and export CSV |

The server checks the role on every action; the UI also hides what a role can't do. Companies are isolated from each other: payment references, inbox messages, live sync, and demo resets are all scoped to one company.

## Commands

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests plus the demo scenario, payment verification, tenant isolation, role and team rules, role enforcement in every business server action, notifications, credit, rate limits, wallet proofs, email delivery, admin access, statistics, exports, moderation, and the feedback survey, against in-memory Postgres and a simulated chain |
| `npm run setup:token-metadata` | Names the devnet test token "PayFix Test USD" with the PayFix logo, so wallets recognize it |
| `npm run e2e [url]` | Rehearses the whole demo in headless Chrome against a running app (default `http://localhost:3300`), on devnet |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run build` | Production build |
| `npm run docker:up` / `docker:down` / `docker:logs` | Build and run, stop, or tail the Docker stack |
| `npm run db:up` | Start only the Postgres container |
| `npm run db:generate` | Generate a migration after editing `src/lib/db/schema.ts` (migrations apply automatically at startup) |

For deployment, set `DATABASE_URL` to a hosted Postgres (for example Neon on Vercel). Migrations run automatically on first connection.

<div align="center">

<img src="brand/payfix-mark.svg" width="96" alt="PayFix logo">

# PayFix

**Wrong stablecoin payment? Settle it in one shared link.**

PayFix turns overpayments, duplicates, and unmatched USDC transfers on Solana into an agreed, completed settlement between a business and its customer.

[![CI](https://github.com/hamroz/payfix/actions/workflows/ci.yml/badge.svg)](https://github.com/hamroz/payfix/actions/workflows/ci.yml)
![Solana devnet](https://img.shields.io/badge/Solana-devnet-9945FF?logo=solana&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

[**Live demo**](https://payfix-mu.vercel.app) · [Run it locally](#run-it) · [Docs](#documentation)

<sub>Test money only. The demo runs on Solana devnet.</sub>

<br>

<img src="docs/assets/flow.svg" width="880" alt="Acme pays $600 and $500. PayFix settles $1,000 to invoice A, $60 to invoice B, and refunds $40.">

</div>

<br>

## The problem

Clients pay by stablecoin and get it wrong: $1,100 against a $1,000 invoice, the same payment twice, a transfer with no reference. Today that becomes a thread of screenshots and wallet addresses, and someone eventually sends money back by hand.

PayFix ties every invoice to its on-chain payments, flags what doesn't match, and gives both sides one page to agree on what happens to the extra money: apply it to another invoice, keep it as credit, refund it, or split it. The business signs one refund from its own wallet, and both sides get the same receipt.

## What makes it trustworthy

|  |  |
| --- | --- |
| **Exact money** | Integer base units everywhere, never floats. A double-entry ledger where every entry sums to zero. |
| **Never counted twice** | Every transaction signature is claimed once. Re-ingesting it is a no-op. |
| **Approvals that mean something** | A plan is immutable and hash-bound. Change the refund wallet and the approval is void. |
| **Refunds that can't double-send** | The exact transaction is prepared, signed, verified, and recorded *before* broadcast. One live attempt per refund. |
| **Private by design** | Customers see only their own case. Platform admins see counts, never a company's customers, invoices, or amounts. |
| **Honest test money** | A network label on every screen. Demo mode refuses to start on mainnet. |

## See it work

<details>
<summary><b>The seven-step demo</b> (about two minutes)</summary>

<br>

1. Invoice A is **$1,000**, invoice B is **$400**, both for Acme Robotics.
2. Acme pays **$600**, then **$500** toward A. PayFix applies $1,000 and flags **$100** as excess.
3. The business sends Acme a resolution link. Acme verifies by email code and proposes **$60 → B, $40 refund**, proving the refund wallet by signing with it.
4. The business approves that exact version.
5. Acme changes the refund wallet. The approval is voided and execution is blocked until v2 is approved.
6. The business approves v2, runs the plan, and signs the $40 refund.
7. A is settled, B has **$340** remaining, the refund is confirmed, unresolved excess is **$0**.

`$1,100 received = $1,000 to A + $60 to B + $40 refunded`

</details>

Try it on the [live demo](https://payfix-mu.vercel.app): sign in with any email and follow the **Guided demo** card, which ticks itself off from real state. No wallet extension needed.

## Run it

```bash
docker compose up -d --build
```

Open **http://localhost:3300** and click **Try the live demo**. With no configuration it runs on a simulated chain, clearly labeled in the UI. Switching to real Solana devnet is one command: see [Getting started](docs/getting-started.md).

## Built with

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Motion · Drizzle ORM · Postgres (PGlite for zero-setup) · `@solana/web3.js` · Solana Wallet Standard (Phantom, Solflare)

Eight languages (en, ru, de, pl, fi, es, zh, hi) and light and dark themes.

## Documentation

| | |
| --- | --- |
| [Getting started](docs/getting-started.md) | Docker, local dev, devnet, roles, every command |
| [How it works](docs/reliability.md) | Matching, ledger, approvals, refunds, and where each reliability gate lives |
| [Architecture](docs/architecture.md) | Components, data model, ledger |
| [Deployment](docs/deployment.md) | Demo vs. production, environment, launch checklist |
| [Admin and feedback](docs/admin.md) | Platform admin area, moderation, tester survey |
| [Runbook](docs/runbook.md) | Health checks, reset, recovery |
| [Product brief](docs/product-brief.md) · [Screen flows](docs/screen-flows.md) · [Milestones](MILESTONES.md) | Scope and delivery plan |

## Status and scope

Working beta. PayFix handles **test money only**: mainnet and customer funds need a separate launch review. It records transfers it observes and refunds it initiates, so it can't see refunds sent from a wallet outside the app. Out of scope: native apps, other chains, fiat, accounting integrations, escrow, custom on-chain programs.

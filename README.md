# PayFix

**Turn incorrect stablecoin payments into an agreed, completed settlement through one shared resolution link.**

PayFix is a planned payment-resolution application for small agencies accepting USDC on Solana from repeat clients. It will connect invoices to payments, surface payment exceptions, and help the customer and business agree on how to resolve them.

## Project status

**Planning and repository setup only. Development has not started.**

This repository currently contains the project overview and delivery plan. There is no runnable application yet, and the features below describe the intended product.

## The core workflow

1. The business creates an invoice and shares a payment link.
2. PayFix verifies incoming payments and identifies partial payments, excess amounts, apparent duplicates, late payments, and unmatched transfers.
3. Through an authenticated resolution link, the customer proposes a refund, an allocation to another invoice, future credit, or a split of those options.
4. The business approves the exact proposal. Changes to amounts, allocations, or the refund destination require renewed approval.
5. The business signs any refund with its wallet. Both parties receive a shared record of allocations, approvals, and transaction status.

## The demonstration we are working toward

- Invoice A is **$1,000**; invoice B is **$400** for the same customer.
- The customer pays **$600**, then **$500**, leaving **$100 excess** after covering A.
- The customer proposes applying **$60** to B and refunding **$40**.
- The business approves the proposal. A subsequent destination change invalidates that approval until the revised plan is approved.
- After the approved refund confirms, A is settled, B has **$340 remaining**, and the unresolved excess is **$0**.

Every amount must reconcile: **$1,100 received = $1,000 applied to A + $60 applied to B + $40 refunded.** Pending or failed refunds must remain visibly incomplete.

## Initial scope

The planned delivery is a mobile-friendly web application with a business workspace, a customer resolution view, invoice and payment tracking, versioned approvals, merchant-signed refunds, customer credit, receipts, and CSV exports.

The demonstration will use **one explicitly configured test-token mint on Solana devnet**, clearly labeled as test money. USDC is the intended production asset. Mainnet availability and handling customer funds require a separate launch decision and review.

Native apps, additional chains and currencies, fiat conversion, bank payouts, accounting integrations, escrow, lending, yield, and custom on-chain programs are outside this delivery scope.

## Delivery plan

**Internal deadline: October 10, 2026, at 23:59 Europe/Berlin.**

See [MILESTONES.md](MILESTONES.md) for the complete two-week plan, milestone acceptance gates, team responsibilities, reliability requirements, and submission checklist.

The three teammates will focus on customer conversations, product acceptance, and the presentation and submission. Implementation begins in a subsequent development phase.

## Repository contents

- [README.md](README.md) — project overview and current status.
- [MILESTONES.md](MILESTONES.md) — the original two-week delivery plan.

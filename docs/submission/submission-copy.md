# Submission copy (draft)

For the Colosseum submission form; confirm the current field list in the portal. Product facts match `main` as of Oct 5, 2026. `[TEAM TO FILL]` items need real evidence. Don't estimate them.

## One-liner

PayFix turns incorrect USDC payments into an agreed, completed settlement through one shared resolution link.

## Problem

Businesses paid in stablecoins regularly receive payments that don't match the invoice: overpayments, the same invoice paid twice, or transfers with no reference. On-chain transfers are final, so fixing these takes manual work. Someone checks an explorer, emails the client, agrees on a plan in a thread, and sends a refund by hand. There's no shared record of what was agreed, and no protection against refunding to the wrong address or refunding twice.

[TEAM TO FILL: one anonymized example from a discovery conversation, with permission, or remove this line.]

## Target customer

Small agencies (design, development, marketing) that already accept USDC on Solana from repeat clients. Because those clients usually have several open invoices, extra money can go to another invoice or to credit, not only back as a refund.

## Solution

- Invoices with payment links. Each payment attempt carries a unique Solana Pay reference key.
- On-chain verification from token-balance changes. Partial payments are tracked, and overpayments, apparent duplicates, and unreferenced transfers go to an exceptions inbox.
- A resolution link for the customer, verified by email code. The customer proposes a split across other invoices, credit, and a refund, and proves the refund wallet by signing with it.
- The business approves the exact plan version (hash-bound). Any change voids the approval.
- The refund is signed by the business wallet. Its signature is recorded before broadcast, only one attempt can be live, and a retry is offered only after blockhash expiry.
- A double-entry ledger, CSV export, and a shared receipt for both sides.
- Companies with Owner/Editor/Viewer roles.

## Differentiation

There are established crypto payment processors, including some with refund flows (see `docs/submission/competitor-comparison.md`). PayFix focuses on one step they don't center on: **agreeing on what happens to the excess.** The customer proposes a split across invoices, credit, and refund. The business approves an exact, hash-bound version, and the result is reconciled in a ledger both sides can read. We present this as a proposed advantage, not a proven unique one.

## Business model hypothesis

Not validated. One of:
- a monthly subscription per company, or
- a small fee per resolved case.

[TEAM TO FILL: any pricing feedback from interviews, quoted exactly, with the sample size.]

## Distribution plan

Plan, not yet executed:
1. Direct outreach to agencies already invoicing in USDC on Solana, through the team's networks and Solana ecosystem communities. [TEAM TO FILL: which communities were actually contacted.]
2. Turn each walkthrough into a pilot offer: we reproduce one of the agency's real past cases in PayFix.
3. Later: integrations with tools agencies already use for invoicing and accounting.

## Traction and evidence

[TEAM TO FILL from `docs/evidence-log.md`:
- Discovery conversations: N (dates, business types).
- External walkthroughs: N; completed without help: X of N; median time: T.
- Changes made from feedback: list with commits.
- Stated interest (kept separate from use): exact words.]

No production users and no real payment volume. Demo transactions are devnet test money.

## Why Solana

- **Verified incoming payments.** Solana Pay reference keys let PayFix find and match each payment without putting invoice details on chain. PayFix reads amounts from the transaction's token-balance changes for one configured mint on the business's own token account.
- **Merchant-authorized refunds.** The refund is a normal SPL transfer signed by the business's wallet. PayFix prepares the exact transaction, checks the signed bytes, and uses confirmation status and blockhash expiry to know the outcome before any retry.
- Fast confirmation and low fees make a $40 refund and its verification practical within a single conversation with the customer. No custom on-chain program is needed.

## Links

- Live demo (devnet, test money): https://payfix-mu.vercel.app
- Repository: [TEAM TO FILL: the repo is currently private (`hamroz/payfix`); make it public or grant judge access]
- Demo video: [TEAM TO FILL]
- Presentation video: [TEAM TO FILL]

## Scope and honesty statement

Test money on Solana devnet only. Demo mode refuses to run against mainnet. Mainnet and customer funds need a separate launch review. PayFix records transfers it observes and refunds it initiates; it can't see or prevent refunds sent from a wallet outside the app.

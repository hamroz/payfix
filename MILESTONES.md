# PayFix — two-week delivery plan

Created September 26, 2026. Internal deadline: **Saturday, October 10, 2026, at 23:59 Europe/Berlin**.

Status (Oct 2): **M1–M3 complete; M4 build work complete, its external-tester gate still open.** Live demo: https://payfix-mu.vercel.app. See [Progress and evidence](#progress-and-evidence) below. Dates are delivery targets, not scheduled background runs.

If entering Crypto World's Fair, its published submission date is October 12, 2026. The internal deadline leaves a two-day contingency window. Confirm the precise cutoff in the submission portal. [Event page](https://colosseum.com/worldsfair).

## What we are shipping

**PayFix turns incorrect USDC payments into an agreed, completed settlement through a shared resolution link.**

Initial customer: a small agency already accepting USDC on Solana and handling payments from repeat clients. The product connects invoices to payments, flags exceptions, lets customer and business agree on allocations and refunds, and records the result.

The differentiating experience is a shared resolution plan: customer-proposed allocation across invoices or future credit, approval of the exact plan, merchant-signed refund, and a clear receipt for both sides. This is a proposed product advantage; research did not establish global uniqueness.

## The final demonstration

1. Create invoice A for $1,000 and invoice B for $400 for the same customer.
2. Pay invoice A with $600, then $500 in labeled test tokens on Solana devnet.
3. Show $1,100 received, $1,000 covering A, and $100 requiring resolution.
4. The customer opens an authenticated resolution link and proposes applying $60 to B and refunding $40.
5. The business approves that exact version of the plan.
6. Change the proposed refund destination before execution; demonstrate that approval becomes invalid and payment is blocked until the revised plan is approved.
7. Execute the approved $40 refund from the business's wallet and verify confirmation.
8. Show A settled, B with $340 remaining, a confirmed $40 refund, and $0 unresolved excess.
9. Show the shared receipt with the two incoming transactions, allocations, approvals, and outgoing refund transaction.

The total must remain explainable: **$1,100 received = $1,000 applied to A + $60 applied to B + $40 refunded.** A pending or failed refund must never be reported as completed.

## Scope for this deadline

### Required

- A mobile-friendly web application with a business workspace and a separate customer resolution view.
- Invoice creation, customer records, payment links, and a second invoice for cross-invoice allocation.
- One explicitly configured test-token mint on Solana devnet, clearly labeled as test money; USDC is the intended production asset.
- Incoming payment verification and invoice references, including multiple payments against one invoice.
- Partial-payment balances and a link to pay the exact remainder.
- An exception inbox for overpayments, apparent duplicate payments, late payments, and unmatched transfers.
- Distinguish two actual transfers from repeated processing of the same transfer. The former can create excess; the latter must never increase the recorded amount received.
- Shared resolution proposals: refund, apply to another invoice for the same customer, retain customer credit, or split those choices.
- Authenticated customer participation and explicit business approval. Knowing a public transaction hash or controlling an unrelated wallet does not establish refund entitlement.
- Versioned approvals: changing an amount, allocation, or destination requires renewed approval.
- A wallet-signed refund authorized by the business, with confirmation tracking and duplicate-execution protection inside PayFix.
- An allocation/credit ledger, status timeline, downloadable receipt, and CSV export.
- Repeatable demo data, meaningful automated checks, and a submission package.

### Later releases

Native phone apps, additional chains and currencies, fiat conversion, bank payouts, automatic tax reporting, QuickBooks/Xero synchronization, escrow, lending, yield, and custom on-chain programs. None is a dependency for this demonstration.

AI agents handle implementation and review. AI-generated product decisions or payment suggestions never substitute for customer and business authorization.

## Milestones

| Due by end of day, Berlin | Milestone | AI deliverables | Human contribution | Completion evidence |
|---|---|---|---|---|
| **Sep 27** | **M1 — scope and foundations** | Product brief; screen flows; data model; payment and resolution states; initial application; task ownership | All three teammates register if entering the event; identify five relevant businesses; nominate one product decision-maker | Runnable application foundation and agreed acceptance checklist; assumptions recorded |
| **Sep 29** | **M2 — real payment flow** | Create invoice; generate payment request; receive and verify devnet transfers; track partial and excess payments | Walk through the flow as a business and a customer; complete first discovery conversations | $1,000 invoice correctly tracks $600, then $500; transaction links support the totals; repeated indexing does not double-count |
| **Oct 1** | **M3 — shared resolution** | Customer link; split-allocation proposal; business approval; invalidation on edits; wallet-signed refund; shared timeline | Review the language and approval screens; test a case suggested by an interviewee | $60 allocation and $40 refund work end to end; changed destination invalidates approval; failed/pending refunds remain visible |
| **Oct 3** | **M4 — beta ready** | Exception handling; customer credit; receipts/exports; authorization and retry checks; phone layout; isolated test environments | Arrange three external walkthroughs and test on actual phones | Core scenarios and access-control checks pass; another person can complete the flow with instructions, without developer intervention |
| **Oct 6** | **M5 — external evidence** | Fix feedback; improve onboarding; measure task completion; prepare evidence log and competitor comparison | Aim for three external walkthroughs; collect specific objections and follow-up interest | Record who tested, what worked, where they struggled, and what changed; distinguish actual use from stated interest |
| **Oct 8** | **M6 — release candidate** | Freeze features; resolve critical issues; rehearse full demo; inspect receipts and exports; prepare recovery/reset procedure | Two independent end-to-end rehearsals; select strongest honest customer evidence | Clean run from invoice to confirmed resolution, correct totals after reload, no unresolved critical payment/access defect |
| **Oct 10** | **M7 — submission ready** | Final demo build; README; architecture explanation; pitch draft; recording script; screenshots; submission copy; development disclosure | Record founder presentation; approve factual claims; team leader completes submission | Accessible demo/repository for judges; working video links; complete submission checklist; confirmation retained if submitted |

Milestones are acceptance gates. If AI work finishes early, advance immediately and use the gained time for outside feedback and reliability checks.

## Progress and evidence

Recorded Oct 2. Build work started Sep 30 (three days after the plan) and caught up by Oct 1.

| Milestone | Build status | Evidence | Still open |
|---|---|---|---|
| **M1** | Done | Runnable app, data model (`src/lib/db/schema.ts`), payment and resolution states, README architecture section | No standalone product brief, screen-flow doc, or written acceptance checklist; human items (registration, five businesses, decision-maker) not recorded here |
| **M2** | Done | Devnet: $1,000 invoice tracks $600 then $500, Explorer links per transfer; re-sync never double-counts (`flow.test.ts`) | First discovery conversations not recorded here |
| **M3** | Done | $60 to B + $40 refund end to end on devnet and on the live site; destination change voids approval; pending/failed refunds stay visible (tests + e2e) | Language review by the team; interviewee-suggested case |
| **M4** | Build done | Exceptions inbox (overpayment, duplicate, unmatched, late); customer credit kept and applied once; receipts and CSV; role checks; phone layout; every visitor gets an isolated company with its own devnet wallet; `npm run e2e` rehearses the whole demo in a real browser | **Three external walkthroughs on real phones** — the gate is "another person completes the flow without developer intervention" |
| M5–M7 | Not started | — | External evidence, release candidate, submission package (repo is still private) |

Built beyond the plan: Docker setup, light theme, multiple receiving wallets per company, companies with Owner/Editor/Viewer roles, Vercel deployment with Neon Postgres.

Automated checks: `npm test` (30 tests including the full demo scenario offline, tenant isolation, roles, single-use credit) and `npm run e2e [url]` (11-step browser rehearsal on devnet).

## Who does what

### AI workstreams

- **Lead/integration:** maintain the brief, contracts between components, priorities, integration branch, and milestone acceptance evidence. Resolve conflicts between workstreams.
- **Product/interface:** business dashboard, invoice and customer pages, resolution experience, mobile usability, onboarding, and receipt presentation.
- **Payments/backend:** payment verification, matching, ledger, proposal versions, authorization, refund preparation, transaction confirmation, and failure recovery.
- **Independent review/testing:** challenge the implementation, test authorization and financial invariants, run full workflows, and verify that documentation and demo claims match behavior.

Use parallel agents for independent interfaces and modules after shared data/API contracts are defined. Integrate daily. Review risky payment changes separately from the agent that authored them. A completed coding task is not a completed milestone until its acceptance evidence is recorded.

### Three human roles

- **Person 1 — customer contact:** arrange conversations with agencies already receiving stablecoins; bring concrete examples of mismatched payments. AI prepares questions and drafts; people conduct outreach and conversations.
- **Person 2 — product acceptance:** run the app from the business and customer perspectives, check clarity on a phone, and maintain the ranked issue list.
- **Person 3 — story and submission:** manage registration, deadline requirements, founder narrative, recording, and final submission. AI prepares the supporting material.

All three should be able to explain the product and demonstrate the core workflow. Roles can overlap; they are responsibilities, not mandatory coding assignments.

## Customer discovery and pilot targets

Start on Sep 27; do not wait for the beta.

Ask about the last payment that needed manual attention: what happened, how it was matched, who contacted the customer, what tools were used, and how it was resolved. Request anonymized examples rather than private credentials or unrestricted business records.

Targets, not promises:

- Five relevant conversations by Oct 3.
- Three external product walkthroughs by Oct 6.
- At least one anonymized real-world scenario reproduced in the product, with permission.
- Specific feedback about what would make the business adopt PayFix and what existing product it would replace or complement.

Measure correct task completion, time to resolve a case, mistakes, and assistance required. Report measured results with sample sizes. Do not present demo transactions as customer volume or verbal interest as active adoption.

If contacts are unavailable, publish the demo and request walkthroughs through the team's existing communities. Submit honest evidence of testing; do not manufacture traction.

## Reliability gates

These checks matter more than adding extra features:

1. Verify network, mint, recipient, amount, and confirmation before applying a payment. Use exact token units for arithmetic.
2. A transfer can only be allocated up to its verified amount. The same transfer cannot be counted twice or reused across unrelated invoices.
3. Unreferenced or ambiguous transfers remain unmatched until reviewed; amount alone is insufficient evidence.
4. Customer A cannot see or change Customer B's invoices or resolutions. Resolution links require appropriate authentication and expiry/revocation handling.
5. A proposal cannot allocate or refund more than the currently available excess. Concurrency and later payments cannot silently corrupt this calculation.
6. Changed plan details invalidate approvals. Execution rechecks that the approved version is still valid.
7. An active refund attempt prevents another application-initiated refund of the same amount. After a timeout or restart, verify the transaction outcome before offering a retry.
8. Pending, failed, and confirmed refunds are separate states. Credit allocation and blockchain transfer are not one atomic operation; the ledger must expose partial progress and reconcile it safely.
9. Credit is recorded once and can be applied once. Repeated clicks, webhook delivery, refreshes, and worker restarts must preserve balances.
10. Customer confirmation of a refund destination must be tied to the authenticated invoice customer. An exchange's sending address must not be assumed to be the customer's refund destination.
11. Private invoice details and customer contact information remain off-chain. Public receipts disclose only information intended for their audience.
12. Test money, synthetic cases, real interviews, and any live activity remain clearly distinguished.

PayFix cannot prevent someone from separately sending a refund directly from their wallet outside the application. The beta must communicate the scope of its records and controls.

Mainnet availability and handling customer funds are a separate launch decision following appropriate review; they are not required to pass the hackathon demo milestones.

## Daily working rhythm

- Begin with the next acceptance gate and the smallest unresolved dependency.
- Give agents bounded tasks with explicit inputs, outputs, and allowed file/module ownership.
- Integrate a runnable version every day and run the checks appropriate to the changes.
- End with a short record: shipped, tested, blocked, and next. Human review focuses on decisions and usability, not line-by-line supervision.
- After Oct 8, accept fixes and submission polish only. New ideas go into the later-release backlog.

## Submission package

- [ ] Team registration and one final product submission.
- [ ] Concise problem, target customer, differentiation, business model hypothesis, and distribution plan.
- [ ] Clear presentation video, two to three minutes, and a product demonstration of no more than three minutes.
- [ ] Accessible repository or the access required by organizers, setup instructions, and a repeatable demo.
- [ ] Explanation of Solana's role: verified incoming payments and merchant-authorized refunds.
- [ ] Honest competitor comparison and measured pilot findings.
- [ ] Screenshots and visual identity consistent with the actual product.
- [ ] Accurate disclosure of work completed during the event and any relevant prior development.
- [ ] Verify current portal requirements, eligibility, exact deadline, and all external links.
- [ ] Retain submission confirmation once the team leader submits.

Colosseum currently asks for a two-to-three-minute presentation, a demo of no more than three minutes, product/repository information, and demand/distribution evidence. It evaluates product execution, insight, viability, founder communication, and traction. [Submission and judging guidance](https://colosseum.com/hackathon).

## Success on October 10

A judge or prospective customer can follow the full payment-resolution story, inspect the supporting Solana transactions, understand the approval controls, and see credible evidence from people outside the team. Every demonstrated dollar has a correct, explainable destination.

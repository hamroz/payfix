# Pitch draft (2–3 min founder presentation)

Draft for the team. Facts about the product match `main` as of Oct 5, 2026. Anything in `[TEAM TO FILL]` must come from real evidence (`docs/evidence-log.md`). Don't replace a placeholder with an estimate.

---

**1. The moment (20 s)**
An agency invoices a client $1,000. The client pays $600, then $500. Now there's $100 extra, sitting in a wallet, with no record of whose it is or what should happen to it. On Solana the money moves in seconds. Working out what to do with it takes days of email.

**2. Who has this problem (20 s)**
Small agencies that already accept USDC on Solana from repeat clients. Those clients often have more than one open invoice, so the right answer isn't always a refund. It might be "put it toward next month."
[TEAM TO FILL: one real, anonymized example from a discovery conversation, with permission. If there is none, say plainly that we're still collecting them.]

**3. What PayFix does (40 s)**
- Every invoice payment carries a unique Solana Pay reference. PayFix verifies each transfer from on-chain token balances, applies it to the invoice, and flags anything that doesn't fit: an overpayment, an apparent duplicate, or a transfer with no reference.
- The business sends the client one link. The client verifies by email and chooses where the extra goes: another invoice, credit, a refund, or a split. A refund wallet has to be proven by signing with it.
- The business approves that exact plan. Change one detail and the approval is void.
- The business signs the refund from its own wallet. Both sides get the same receipt: $1,100 received = $1,000 + $60 + $40.

**4. Why trust it (20 s)**
- A double-entry ledger in exact token units.
- Each on-chain signature is counted once.
- Approvals are bound to a hash of the plan.
- Only one refund can be in flight; its signature is recorded before broadcast, and a retry is offered only after the old transaction has provably expired.

**5. Evidence (20 s)**
[TEAM TO FILL: number of external walkthroughs, how many finished without help, median time, top sticking point and what we changed. Use measured numbers with the sample size. Separate real use from stated interest.]

**6. Business model and next step (20 s)**
Hypothesis, not validated: a monthly subscription per company, or a small fee per resolved case. [TEAM TO FILL: what interviewees said about price, if anything.]
Next: a mainnet pilot with one agency after a security and launch review. Today it runs on devnet with test money only.

**7. Close (10 s)**
"Stablecoins made getting paid instant. PayFix makes sorting out the wrong payment just as clean."
[TEAM TO FILL: names, roles, and a contact.]

---

Before recording, check:
- [ ] Every number is either from the demo (and called demo) or from the evidence log.
- [ ] "Test money / devnet" is said out loud at least once.
- [ ] No claim of uniqueness. Say "unlike tools that only refund", not "the only".

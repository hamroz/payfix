# Demo recording script (≤ 3:00)

This follows the final demonstration in MILESTONES.md, on the live devnet demo (https://payfix-mu.vercel.app).

**Before recording:**
- Use a desktop browser at 1440 px wide.
- Sign up with a fresh email and create a company with demo data. Or use **Settings → Demo tools → Reset the demo** on an existing company.
- Keep a second tab ready for the customer view.
- Devnet confirmations take a few seconds. Cut the waits in editing, and show the spinner briefly before cutting so the wait is honest.
- Run `node scripts/e2e.mjs https://payfix-mu.vercel.app` first to confirm the deployment is healthy.

| Time | Screen | Action | Voice-over (suggested) |
| --- | --- | --- | --- |
| 0:00–0:12 | `/app` Overview | Point at the network pill and the Guided demo card | "This is PayFix on Solana devnet, with test money. Lumen Studio has two invoices for Acme Robotics: $1,000 and $400." |
| 0:12–0:35 | `/pay/INV-0001` | Demo wallet: pay 600 → "Payment confirmed, $400 remains". Make another payment: 500 | "Acme pays $600, then $500. Each payment carries a unique reference, so PayFix matches it to the invoice by that reference, never by amount." |
| 0:35–0:50 | Pay page payments list → Explorer link | Show "$100 held for your decision", then open one transaction on Solana Explorer | "$1,100 received, $1,000 covers the invoice, and $100 needs a decision. Every number links to a verified transaction." |
| 0:50–1:02 | `/app/exceptions/[id]` | Send resolution link → copy | "Instead of an email thread, the business sends one link." |
| 1:02–1:30 | `/r/[token]` (customer tab) | Email me a code → code from the Demo inbox → Split 60 / 40 → Use demo wallet A → Send plan | "The customer verifies by email, then decides: $60 to the other invoice, $40 back. To get a refund they must sign with the receiving wallet, so nobody can redirect it." |
| 1:30–1:42 | Case page | Approve v1. Point at the hash on the approval chip | "The business approves this exact version. The approval is bound to a hash of the plan." |
| 1:42–2:05 | Customer tab → case page | Change plan → wallet B → Send revised plan (v2). On the case page, show the voided approval in the timeline; "Run plan" is gone | "Now the refund wallet changes. The old approval is void, and nothing can run until v2 is approved." |
| 2:05–2:30 | Case page | Approve v2 → Run plan v2 → Sign with demo merchant wallet → "Loop closed" | "Approve v2 and run it. The $60 posts immediately. The $40 refund is signed by the business wallet, and PayFix records its signature before broadcast, so it can't be sent twice." |
| 2:30–2:52 | `/receipt/[caseId]` | Scroll: Settled, incoming payments, plan v2, approvals (v1 voided, v2 approved), refund transaction link | "Both sides get the same receipt: $1,100 received equals $1,000 to A, $60 to B, $40 refunded, and nothing unresolved. INV-0002 now has $340 left." |
| 2:52–3:00 | Receipt footer | Hold on the "test money" footer | "Test money on devnet today. The next step is a pilot with a real agency." |

**Fallbacks:**
- If a devnet confirmation stalls for more than 30 s, keep recording. The page updates on its own.
- If the refund expires, the timeline says it's safe to sign again. That retry path is also worth showing.
- If the deployment is unhealthy, record against Docker on `http://localhost:3300`. The simulated chain is labeled "Simulated" in the UI, so say so in the voice-over.

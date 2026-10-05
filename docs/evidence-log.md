# Evidence log (M5)

**Rules**
- Record only what happened. Don't invent, round up, or paraphrase quotes into something stronger than what was said.
- Keep **real usage** (someone completed a task in PayFix) separate from **stated interest** (someone said they might use it).
- Demo transactions are test money. Never count them as customer volume.
- Report results with the sample size, for example "2 of 3 testers completed without help".
- Get permission before recording a name or company. Otherwise use a label such as "Tester 1, agency, 4 people".

## 1. Product walkthroughs (real usage)

Script: `docs/tester-walkthrough.md`. One row per session.

| Date | Tester (label) | Role / company type | Device + browser | Completed without help (y/n) | Time taken (min) | Where they struggled | Quotes (verbatim) | What we changed (commit/PR) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

**Summary (fill in after the sessions):** walkthroughs run: __. Completed without help: __ of __. Median time: __ min. Most common sticking point: __.

### Answers to the follow-up questions

| Tester | Q1 extra $100 explained correctly? | Q2 hesitation points | Q3 noticed voided approval? | Q4 current process / real example | Q5 receipt trust | Q6 blockers / what it replaces |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

## 2. Discovery conversations (stated interest and context)

These are conversations, not product use. One row per conversation.

| Date | Contact (label) | Business type / size | Accepts stablecoins today? (chain, token) | Last payment that needed manual attention | How it was resolved, tools used | Pain level (their words) | Follow-up interest (exact ask: pilot, intro, none) | Permission to reproduce scenario? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |

Targets from MILESTONES.md (targets, not promises): 5 conversations by Oct 3, 3 external walkthroughs by Oct 6, and at least 1 anonymized real-world scenario reproduced in the product, with permission.

## 3. Real-world scenarios reproduced in PayFix

| Date | Source (conversation row) | Scenario | Reproduced how (case ID / screenshot) | Permission recorded (y/n) |
| --- | --- | --- | --- | --- |
| | | | | |

## 4. What counts as which

| Category | Examples | Can be called "traction"? |
| --- | --- | --- |
| Real usage | A tester completes the flow; a business runs a real (test-money) case from their own example | Only as "N walkthroughs", never as volume |
| Stated interest | "I'd use this", "send me the link", requests for a pilot | No. Report as interest, with the exact words |
| Synthetic | Demo company, e2e runs, team rehearsals | No |
| Live activity | Not applicable: mainnet is out of scope | — |

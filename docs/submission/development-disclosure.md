# Development disclosure (DRAFT — team to confirm)

> **Status: draft prepared from the git history and MILESTONES.md on Oct 5, 2026. The team must check every statement, especially the items marked [CONFIRM], before submission.** Also check the official rules for the required format and for what counts as prior work; we couldn't extract the rules PDF automatically.

## When the work was done

- The project plan and README outline were committed on **Sep 26, 2026** (`781bbe4`, "docs: initialize PayFix overview and delivery milestones"; README.md and MILESTONES.md only, no code).
- All application code was committed from **Sep 30, 2026** onward (starting at `563dd35` / `8069914`, "feat: build PayFix prototype"); see `git log` for the full history up to submission.
- The initial prototype arrived as one large commit on Sep 30 (`8069914`, 104 files). MILESTONES.md records that "Build work started Sep 30". [CONFIRM: no PayFix code, design, or brand asset existed before the event window. Also confirm when the prototype work began relative to that commit.]
- [CONFIRM: the event's official start date, and that Sep 26 – Oct 12 falls within it.]

To reproduce:
```bash
git log --reverse --format='%h %ad %an | %s' --date=iso
```

## Who did the work

- All commits are authored by Hamroz Gavharov.
- MILESTONES.md describes a team of three people with human roles: customer contact, product acceptance, and story/submission. [CONFIRM: team members and what each contributed.]

## Use of AI

MILESTONES.md states: "AI agents handle implementation and review." AI agents were used to write and review code, tests, and documentation, including these docs. [CONFIRM: which tools and models; whether any portion was written by hand.]

Product decisions, and all authorization of payments and refunds, remain human. In the product, no AI output substitutes for customer or business approval.

## Third-party and pre-existing components

These are open-source dependencies listed in `package.json`: Next.js, React, Tailwind CSS, Motion, Drizzle ORM, PGlite, `@solana/web3.js`, `@solana/spl-token`, Solana wallet adapter, and others. No code from a previous project of ours is included. [CONFIRM]

## What is real vs demo

- Solana devnet with a PayFix-created test token ("Test USD"). No mainnet, no customer funds.
- Demo wallets are server-held devnet keys.
- [TEAM TO FILL: external testing and interviews, exactly as recorded in `docs/evidence-log.md`.]

## Work in progress at the time of drafting

On Oct 5 the working tree contained **uncommitted** changes not described above: rate limits, production email, wallet-ownership proofs, a mainnet configuration, and a health endpoint. [CONFIRM: once committed, the date range above extends to the final commit; update this section.]

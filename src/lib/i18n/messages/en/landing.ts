// The public landing page and its animated hero card.
const landing = {
  nav: {
    howItWorks: "How it works",
    signIn: "Sign in",
    dashboard: "Dashboard",
  },
  hero: {
    simulatedChain: "Simulated chain",
    cluster: "Solana {cluster}",
    tagline: "USDC payment resolution for agencies",
    titleLead: "Wrong payments,",
    titleAccent: "made right.",
    body: "When a client overpays, pays twice, or sends USDC without a reference, PayFix turns it into an agreed, completed settlement — through one shared link both sides can trust.",
    tryDemo: "Try the live demo",
    getStarted: "Get started",
    seeHow: "See how it works",
    signIn: "Sign in",
    testNote: "The demo uses a clearly labeled test token, never real funds.",
    equation: "{received} received = {invoice} + {applied} + {refunded}.",
  },
  how: {
    eyebrow: "The resolution loop",
    title: "From “you sent too much” to settled, in four steps.",
  },
  steps: {
    detect: {
      title: "Detect",
      body: "Every transfer to your wallet is verified on Solana — mint, amount, recipient, confirmation — and matched to its invoice. Overpayments, duplicates, and unreferenced transfers land in one inbox.",
    },
    propose: {
      title: "Propose",
      body: "Your customer gets one secure link. They choose where the extra goes: another invoice, credit, a refund, or a split. Refund wallets are proven by signature.",
    },
    approve: {
      title: "Approve",
      body: "You approve the exact version. Change an amount, an invoice, or the destination and the approval is void until you approve again.",
    },
    settle: {
      title: "Settle",
      body: "You sign the refund from your own wallet. Allocations post, the refund confirms on chain, and both sides get the same receipt.",
    },
  },
  film: {
    eyebrow: "Watch it run",
    title: "One overpayment, start to finish.",
    note: "49 seconds · the live demo’s scenario, in test money",
  },
  controls: {
    eyebrow: "Built for money",
    title: "Controls a finance team would sign off on.",
    body: "Solana gives us verifiable incoming payments and merchant-signed refunds. PayFix adds the part in between: agreement, authorization, and a ledger that always balances.",
  },
  guarantees: {
    neverDoubleCounted: {
      title: "Never double-counted",
      body: "Each on-chain signature is claimed once. Re-syncing, retries, and restarts can't inflate what you received.",
    },
    hashBound: {
      title: "Approval bound to a hash",
      body: "Approvals cover amounts, invoices, and destination. Any edit creates a new version that needs its own approval.",
    },
    oneRefund: {
      title: "One refund in flight",
      body: "PayFix records a refund's signature before broadcasting and only allows a retry after its blockhash expires unlanded.",
    },
    everyDollar: {
      title: "Every dollar explained",
      body: "A double-entry ledger in exact token units. Received always equals applied + credit + refunded + pending + unresolved.",
    },
  },
  heroDemo: {
    invoiceCount: { one: "{count} invoice", other: "{count} invoices" },
    incomingTransfer: "Incoming transfer",
    received: "{amount} received",
    reconciled: "Reconciled",
    needsResolution: "{amount} needs resolution",
    verifying: "Verifying…",
    refunded: "Refunded",
    unresolved: "Unresolved",
    stages: {
      arrive: { title: "Payments arrive", note: "Two transfers verified on Solana" },
      excess: { title: "Invoice settled, {amount} extra", note: "The excess is flagged, not guessed" },
      propose: { title: "Customer proposes a split", note: "{applied} → {invoice} · {refund} refund" },
      approve: { title: "Business approves {version}", note: "Exact plan, hash-bound approval" },
      settled: { title: "Every dollar has a home", note: "Refund confirmed · {amount} unresolved" },
    },
  },
};

export default landing;

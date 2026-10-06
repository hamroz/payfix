// The settlement receipt both sides keep: parties, the money equation, payments, agreed plan, approvals, and refund.
const receipt = {
  title: "Settlement receipt",
  saveAsPdf: "Save as PDF",
  private: {
    title: "This receipt is private",
    body: "Sign in as the business, or open it from your resolution link after verifying your email.",
  },
  eyebrow: "Settlement receipt",
  settled: "Settled",
  inProgress: "In progress",
  withCustomer: "and {customer}",
  withUnknownSender: "and an unidentified sender",
  resolvedAt: "Resolved {date}",
  openedAt: "Opened {date}",
  everyDollarInvoice: "Every dollar paid toward {invoice} ({amount})",
  everyDollar: "Every dollar received",
  parts: {
    otherInvoices: "other invoices",
    credit: "credit",
    refunded: "refunded",
    refundPending: "refund pending",
    unresolved: "unresolved",
  },
  incoming: "Incoming payments",
  incomingFrom: "from {address} · {date}",
  unknownAddress: "unknown",
  agreedPlan: "Agreed plan · version {version}",
  approvals: "Approvals",
  approved: "v{version} approved",
  approvalVoided: "v{version} approval voided",
  approvedBy: "by {name} · {date}",
  noApprovals: "No approvals yet.",
  refund: "Refund",
  refundStatus: {
    awaiting_signature: "awaiting the business’s signature",
    submitted: "sent, awaiting confirmation",
    confirmed: "confirmed",
    failed: "last attempt failed, funds still reserved",
  },
  refundLine: "{amount} · {status}",
  refundTo: "to {address}",
  refundToAt: "to {address} · {date}",
  notOnChain: "not yet on chain",
  footnoteSimulated:
    "Amounts are exact token units of {token} on a simulated chain — test money, not customer funds. This record covers transfers PayFix observed and refunds it initiated; payments made outside PayFix are not reflected.",
  footnote:
    "Amounts are exact token units of {token} on Solana {cluster} — test money, not customer funds. This record covers transfers PayFix observed and refunds it initiated; payments made outside PayFix are not reflected.",
};

export default receipt;

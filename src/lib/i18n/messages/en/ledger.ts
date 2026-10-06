// The double-entry ledger page in the business app.
const ledger = {
  title: "Ledger",
  eyebrow: "Ledger",
  heading: "Double-entry ledger",
  subtitle: "Every movement of money, in exact token units. Each entry balances to zero and is written once per idempotency key, so retries can’t double-count.",
  exportCsv: "Export CSV",
  emptyTitle: "No entries yet",
  emptyBody: "Entries appear as soon as a payment is verified on chain.",
  accounts: {
    external: "Received (on chain)",
    unresolved: "Unresolved",
    invoice: "Invoice",
    credit: "Customer credit",
    refund_pending: "Refund pending",
    refunded: "Refunded",
  },
};

export default ledger;

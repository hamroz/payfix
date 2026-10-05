// The ledger CSV export: column headers and the names of entry kinds and accounts.
const exportCsv = {
  columns: {
    date: "date",
    entryId: "entry_id",
    kind: "kind",
    memo: "memo",
    account: "account",
    amount: "amount",
    invoice: "invoice",
    caseId: "case_id",
  },
  kinds: {
    receipt: "receipt",
    apply: "apply",
    credit: "credit",
    refund: "refund",
    resolution: "resolution",
  },
  accounts: {
    external: "external",
    unresolved: "unresolved",
    invoice: "invoice",
    credit: "credit",
    refund_pending: "refund_pending",
    refunded: "refunded",
  },
};

export default exportCsv;

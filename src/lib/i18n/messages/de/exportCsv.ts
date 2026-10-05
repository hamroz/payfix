import type { Messages } from "../types";

const exportCsv: Messages["exportCsv"] = {
  columns: {
    date: "datum",
    entryId: "buchungs_id",
    kind: "art",
    memo: "buchungstext",
    account: "konto",
    amount: "betrag",
    invoice: "rechnung",
    caseId: "fall_id",
  },
  kinds: {
    receipt: "eingang",
    apply: "verrechnung",
    credit: "guthaben",
    refund: "erstattung",
    resolution: "klärung",
  },
  accounts: {
    external: "extern",
    unresolved: "ungeklärt",
    invoice: "rechnung",
    credit: "guthaben",
    refund_pending: "erstattung_ausstehend",
    refunded: "erstattet",
  },
};

export default exportCsv;

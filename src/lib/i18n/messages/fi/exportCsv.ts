import type { Messages } from "../types";

const exportCsv: Messages["exportCsv"] = {
  columns: {
    date: "päivämäärä",
    entryId: "kirjaus_id",
    kind: "laji",
    memo: "selite",
    account: "tili",
    amount: "summa",
    invoice: "lasku",
    caseId: "tapaus_id",
  },
  kinds: {
    receipt: "vastaanotto",
    apply: "kohdistus",
    credit: "saldo",
    refund: "palautus",
    resolution: "ratkaisu",
  },
  accounts: {
    external: "ulkoinen",
    unresolved: "ratkaisematon",
    invoice: "lasku",
    credit: "saldo",
    refund_pending: "palautus_odottaa",
    refunded: "palautettu",
  },
};

export default exportCsv;

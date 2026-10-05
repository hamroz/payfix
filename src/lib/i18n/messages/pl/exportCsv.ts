import type { Messages } from "../types";

const exportCsv: Messages["exportCsv"] = {
  columns: {
    date: "data",
    entryId: "id_zapisu",
    kind: "rodzaj",
    memo: "opis",
    account: "konto",
    amount: "kwota",
    invoice: "faktura",
    caseId: "id_sprawy",
  },
  kinds: {
    receipt: "wpływ",
    apply: "zaliczenie",
    credit: "saldo",
    refund: "zwrot",
    resolution: "rozwiązanie",
  },
  accounts: {
    external: "zewnętrzne",
    unresolved: "niewyjaśnione",
    invoice: "faktura",
    credit: "saldo_klienta",
    refund_pending: "zwrot_w_toku",
    refunded: "zwrócone",
  },
};

export default exportCsv;

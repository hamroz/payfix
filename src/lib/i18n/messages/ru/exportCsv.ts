import type { Messages } from "../types";

const exportCsv: Messages["exportCsv"] = {
  columns: {
    date: "дата",
    entryId: "id_проводки",
    kind: "тип",
    memo: "описание",
    account: "статья",
    amount: "сумма",
    invoice: "счёт",
    caseId: "id_расхождения",
  },
  kinds: {
    receipt: "поступление",
    apply: "зачёт",
    credit: "баланс_клиента",
    refund: "возврат",
    resolution: "урегулирование",
  },
  accounts: {
    external: "внешний",
    unresolved: "не_распределено",
    invoice: "счёт",
    credit: "баланс_клиента",
    refund_pending: "ожидает_возврата",
    refunded: "возвращено",
  },
};

export default exportCsv;

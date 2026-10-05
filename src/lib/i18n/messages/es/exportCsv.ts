import type { Messages } from "../types";

const exportCsv: Messages["exportCsv"] = {
  columns: {
    date: "fecha",
    entryId: "id_asiento",
    kind: "tipo",
    memo: "concepto",
    account: "cuenta",
    amount: "importe",
    invoice: "factura",
    caseId: "id_caso",
  },
  kinds: {
    receipt: "cobro",
    apply: "aplicación",
    credit: "saldo_a_favor",
    refund: "reembolso",
    resolution: "resolución",
  },
  accounts: {
    external: "externa",
    unresolved: "sin_resolver",
    invoice: "factura",
    credit: "saldo_a_favor",
    refund_pending: "reembolso_pendiente",
    refunded: "reembolsado",
  },
};

export default exportCsv;

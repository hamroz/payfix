import type { Messages } from "../types";

const ledger: Messages["ledger"] = {
  title: "Журнал операций",
  eyebrow: "Журнал",
  heading: "Журнал с двойной записью",
  subtitle: "Каждое движение денег в точных единицах токена. Каждая проводка сходится в ноль и записывается один раз на ключ идемпотентности, поэтому повторы не задвоят учёт.",
  exportCsv: "Выгрузить CSV",
  emptyTitle: "Записей пока нет",
  emptyBody: "Записи появятся, как только платёж будет подтверждён в блокчейне.",
  accounts: {
    external: "Получено (в блокчейне)",
    unresolved: "Не распределено",
    invoice: "Счёт",
    credit: "Баланс клиента",
    refund_pending: "Ожидает возврата",
    refunded: "Возвращено",
  },
};

export default ledger;

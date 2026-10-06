import type { Messages } from "../types";

const receipt: Messages["receipt"] = {
  title: "Квитанция об урегулировании",
  saveAsPdf: "Сохранить в PDF",
  private: {
    title: "Это закрытая квитанция",
    body: "Войдите как компания или откройте квитанцию по своей ссылке для урегулирования, подтвердив email.",
  },
  eyebrow: "Квитанция об урегулировании",
  settled: "Урегулировано",
  inProgress: "В процессе",
  withCustomer: "и {customer}",
  withUnknownSender: "и неизвестный отправитель",
  resolvedAt: "Урегулировано {date}",
  openedAt: "Открыто {date}",
  everyDollarInvoice: "Каждый доллар, оплаченный по счёту {invoice} ({amount})",
  everyDollar: "Каждый полученный доллар",
  parts: {
    otherInvoices: "в другие счета",
    credit: "на балансе",
    refunded: "возвращено",
    refundPending: "ожидает возврата",
    unresolved: "не распределено",
  },
  incoming: "Входящие платежи",
  incomingFrom: "с {address} · {date}",
  unknownAddress: "неизвестно",
  agreedPlan: "Согласованный план · версия {version}",
  approvals: "Утверждения",
  approved: "План v{version} утверждён",
  approvalVoided: "Утверждение v{version} аннулировано",
  approvedBy: "Утвердил: {name} · {date}",
  noApprovals: "Утверждений пока нет.",
  refund: "Возврат",
  refundStatus: {
    awaiting_signature: "ждёт подписи компании",
    submitted: "отправлен, ждёт подтверждения",
    confirmed: "подтверждён",
    failed: "последняя попытка не удалась, средства по-прежнему зарезервированы",
  },
  refundLine: "{amount} · {status}",
  refundTo: "на {address}",
  refundToAt: "на {address} · {date}",
  notOnChain: "ещё не в блокчейне",
  footnoteSimulated:
    "Суммы указаны в точных единицах токена {token} в симуляции блокчейна — это тестовые деньги, а не средства клиентов. Квитанция охватывает переводы, которые видел PayFix, и возвраты, запущенные через него; платежи в обход PayFix здесь не отражены.",
  footnote:
    "Суммы указаны в точных единицах токена {token} в сети Solana {cluster} — это тестовые деньги, а не средства клиентов. Квитанция охватывает переводы, которые видел PayFix, и возвраты, запущенные через него; платежи в обход PayFix здесь не отражены.",
};

export default receipt;

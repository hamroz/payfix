import type { Messages } from "../types";

// Предложения журнала активности и уведомлений, а также шаблоны мемо проводок и причин утверждения.
const events: Messages["events"] = {
  invoice: {
    created: "Создан счёт {number} для {customer} на {amount}",
    paid: "Счёт {number} оплачен полностью",
    overdue: "Счёт {number} просрочен: осталось {remaining}",
  },
  customer: {
    created: "Добавлен клиент {name} ({email})",
    verified: "Клиент подтвердил email и открыл ссылку для урегулирования",
  },
  payment: {
    received: {
      settled: "{customer}: оплата {amount} по счёту {number} — счёт закрыт",
      settledLate: "{customer}: оплата {amount} по счёту {number} — счёт закрыт (с опозданием)",
      partial: "{customer}: оплата {amount} по счёту {number} — осталось {remaining}",
      partialLate: "{customer}: оплата {amount} по счёту {number} — осталось {remaining} (с опозданием)",
    },
  },
  transfer: {
    out: "{amount} отправлено на {address}",
    unmatched: "{amount} поступило с {address} без ссылки на счёт",
  },
  case: {
    opened: {
      duplicate: "Возможный дубль: {amount} поступило, когда счёт {number} уже был оплачен",
      overpayment: "{amount} сверх остатка по счёту {number} — нужно урегулировать",
    },
    assigned: "Платёж привязан к клиенту {customer}",
    resolved: {
      settled: "Расхождение урегулировано: {amount} распределено по договорённости",
      refunded: "Расхождение урегулировано: {amount} возвращено",
    },
  },
  link: {
    sent: "Ссылка для урегулирования отправлена на {email}",
  },
  proposal: {
    submitted: {
      first: "Клиент предложил план (v{version}): {lines}",
      revised: "Клиент изменил план (v{version}): {changes}",
      unchanged: "Клиент отправил план заново (v{version}): без изменений",
    },
    approved: "Компания утвердила план v{version} ({shortHash})",
    declined: "Компания запросила изменения в плане v{version}: «{note}»",
  },
  approval: {
    invalidated: {
      changed: "Утверждение v{previous} больше не действует — {changes}. Выполнение заблокировано, пока не утверждена v{version}.",
      resubmitted: "Утверждение v{previous} больше не действует — план отправлен заново. Выполнение заблокировано, пока не утверждена v{version}.",
    },
  },
  plan: {
    executed: {
      refundReserved: "Зачёты проведены. Возврат {amount} зарезервирован и ждёт подписи кошелька компании.",
      resolved: "Зачёты проведены. Расхождение урегулировано.",
    },
  },
  refund: {
    submitted: "Компания подписала возврат {amount} на {destination}",
    confirmed: "Возврат {amount} подтверждён в блокчейне. Расхождение урегулировано.",
    failed: "Транзакция возврата не прошла, средства не списаны. Можно повторить.",
    expired: "Транзакция возврата истекла, не попав в блокчейн. Средства не списаны — можно спокойно подписать ещё раз.",
  },
  credit: {
    applied: "{amount} с баланса клиента зачтено в счёт {number}",
  },
  member: {
    added: "{email} в команде с ролью «{role}»",
    roleChanged: "{email} теперь в роли «{role}»",
    removed: "{email} больше не в команде",
  },
  wallet: {
    added: "Добавлен кошелёк для приёма: {label} ({address})",
    activated: "Новые платежи теперь поступают на {label} ({address})",
    removed: "Удалён кошелёк для приёма: {label} ({address})",
  },

  // Подстановки, когда имя неизвестно
  fallbacks: {
    customer: "Клиент",
    member: "Участник",
    invoice: "счёт",
  },

  // Одна строка плана ({lines} выше), через `separator`
  planLines: {
    invoice: "{amount} в {number}",
    credit: "{amount} на баланс",
    refund: "{amount} на возврат",
    separator: ", ",
  },

  // Что изменилось между версиями плана ({changes} выше), через `separator`
  changes: {
    allocationAdded: "Добавлен зачёт в {number}: {amount}",
    allocationRemoved: "Убран зачёт в {number} (было {amount})",
    allocationChanged: "Зачёт в {number} изменён с {from} на {to}",
    creditAdded: "Добавлено на баланс: {amount}",
    creditRemoved: "Убрано зачисление на баланс (было {amount})",
    creditChanged: "Сумма на баланс изменена с {from} на {to}",
    refundAdded: "Добавлен возврат: {amount}",
    refundRemoved: "Убран возврат (было {amount})",
    refundChanged: "Возврат изменён с {from} на {to}",
    destinationChanged: "Кошелёк для возврата изменён с {from} на {to}",
    destinationSet: "Указан кошелёк для возврата: {to}",
    destinationRemoved: "Кошелёк для возврата убран",
    separator: "; ",
  },

  // Мемо проводок в журнале операций
  memos: {
    received: "Получено {amount}",
    applied: "Зачтено в {number}",
    creditApplied: "Зачёт с баланса в {number}",
    refundConfirmed: "Возврат {amount} подтверждён",
    plan: "План v{version}: {lines}",
  },

  // Почему утверждение больше не действует
  approvalReasons: {
    superseded: "Заменён планом v{version}: {changes}",
    resubmitted: "Заменён планом v{version}: план отправлен заново",
    changesRequested: "Компания запросила изменения: {note}",
  },
};

export default events;

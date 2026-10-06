import type { Messages } from "../types";

// Общие строки приложения. Тексты конкретных разделов лежат в своих пространствах имён.
const common: Messages["common"] = {
  brand: "PayFix",
  justNow: "только что",
  loading: "Загрузка…",
  cancel: "Отмена",
  save: "Сохранить",
  saving: "Сохраняем…",
  close: "Закрыть",
  back: "Назад",
  continue: "Продолжить",
  confirm: "Подтвердить",
  edit: "Изменить",
  remove: "Удалить",
  delete: "Удалить",
  copy: "Копировать",
  copied: "Скопировано",
  copyLink: "Копировать ссылку",
  retry: "Повторить",
  done: "Готово",
  learnMore: "Подробнее",
  viewAll: "Смотреть все",
  optional: "Необязательно",
  required: "Обязательно",
  you: "Вы",
  customer: "Клиент",
  business: "Компания",
  system: "PayFix",
  language: "Язык",
  chooseLanguage: "Выбрать язык",
  testMoney: "Тестовые деньги",
};

export default common;

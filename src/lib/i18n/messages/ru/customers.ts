import type { Messages } from "../types";

const customers: Messages["customers"] = {
  title: "Клиенты",
  eyebrow: "Клиенты",
  heading: "Клиенты",
  subtitle: "Постоянные клиенты, их задолженность и суммы, которые они решили оставить у вас на балансе.",
  emptyTitle: "Клиентов пока нет",
  emptyBody: "Добавьте клиента, чтобы выставлять счета.",
  stats: {
    paid: "Оплачено",
    outstanding: "К оплате",
    credit: "Баланс",
  },
  add: {
    button: "Добавить клиента",
    title: "Новый клиент",
    name: "Имя или название",
    email: "Email для счетов",
    emailHint: "Коды для урегулирования приходят только на этот адрес.",
    submit: "Добавить клиента",
    added: "Клиент {name} добавлен",
  },
};

export default customers;

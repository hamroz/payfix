import type { Messages } from "../types";

const customers: Messages["customers"] = {
  title: "Klienci",
  eyebrow: "Klienci",
  heading: "Klienci",
  subtitle: "Stali klienci, ich rozliczenia i saldo, które zdecydowali się u Ciebie zostawić.",
  emptyTitle: "Brak klientów",
  emptyBody: "Dodaj klienta, aby zacząć wystawiać faktury.",
  stats: {
    paid: "Zapłacono",
    outstanding: "Do zapłaty",
    credit: "Saldo",
  },
  add: {
    button: "Dodaj klienta",
    title: "Dodaj klienta",
    name: "Nazwa",
    email: "E-mail do faktur",
    emailHint: "Kody weryfikacyjne wysyłamy tylko na ten adres.",
    submit: "Dodaj klienta",
    added: "Dodano: {name}",
  },
};

export default customers;

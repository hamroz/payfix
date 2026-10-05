import type { Messages } from "../types";

const customers: Messages["customers"] = {
  title: "Kunden",
  eyebrow: "Kunden",
  heading: "Kunden",
  subtitle: "Stammkunden, ihre Salden und Guthaben, das sie bei Ihnen stehen lassen.",
  emptyTitle: "Noch keine Kunden",
  emptyBody: "Legen Sie einen Kunden an, um Rechnungen zu stellen.",
  stats: {
    paid: "Bezahlt",
    outstanding: "Offen",
    credit: "Guthaben",
  },
  add: {
    button: "Kunden anlegen",
    title: "Kunden anlegen",
    name: "Name",
    email: "E-Mail für Rechnungen",
    emailHint: "Klärungscodes gehen nur an diese Adresse.",
    submit: "Kunden anlegen",
    added: "{name} angelegt",
  },
};

export default customers;

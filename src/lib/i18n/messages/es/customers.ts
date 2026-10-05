import type { Messages } from "../types";

const customers: Messages["customers"] = {
  title: "Clientes",
  eyebrow: "Clientes",
  heading: "Clientes",
  subtitle: "Clientes habituales, sus saldos y el saldo a favor que han decidido mantener contigo.",
  emptyTitle: "Aún no hay clientes",
  emptyBody: "Añade un cliente para empezar a facturar.",
  stats: {
    paid: "Pagado",
    outstanding: "Pendiente",
    credit: "Saldo a favor",
  },
  add: {
    button: "Añadir cliente",
    title: "Añadir cliente",
    name: "Nombre",
    email: "Correo de facturación",
    emailHint: "Los códigos de resolución solo se envían a esta dirección.",
    submit: "Añadir cliente",
    added: "Cliente añadido: {name}",
  },
};

export default customers;

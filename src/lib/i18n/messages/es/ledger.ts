import type { Messages } from "../types";

const ledger: Messages["ledger"] = {
  title: "Libro mayor",
  eyebrow: "Libro mayor",
  heading: "Libro mayor de partida doble",
  subtitle: "Cada movimiento de dinero, en unidades exactas del token. Cada asiento suma cero y se registra una sola vez por clave de idempotencia, así que los reintentos no pueden contarse dos veces.",
  exportCsv: "Exportar CSV",
  emptyTitle: "Aún no hay asientos",
  emptyBody: "Los asientos aparecen en cuanto se verifica un pago en la cadena.",
  accounts: {
    external: "Recibido (en la cadena)",
    unresolved: "Sin resolver",
    invoice: "Factura",
    credit: "Saldo a favor del cliente",
    refund_pending: "Reembolso pendiente",
    refunded: "Reembolsado",
  },
};

export default ledger;

import type { Messages } from "../types";

const ledger: Messages["ledger"] = {
  title: "Hauptbuch",
  eyebrow: "Hauptbuch",
  heading: "Doppelte Buchführung",
  subtitle: "Jede Geldbewegung in exakten Token-Einheiten. Jede Buchung ergibt in Summe null und wird pro Idempotenzschlüssel nur einmal geschrieben – Wiederholungen können also nichts doppelt zählen.",
  exportCsv: "CSV exportieren",
  emptyTitle: "Noch keine Buchungen",
  emptyBody: "Buchungen erscheinen, sobald eine Zahlung on-chain verifiziert ist.",
  accounts: {
    external: "Erhalten (on-chain)",
    unresolved: "Ungeklärt",
    invoice: "Rechnung",
    credit: "Kundenguthaben",
    refund_pending: "Erstattung ausstehend",
    refunded: "Erstattet",
  },
};

export default ledger;

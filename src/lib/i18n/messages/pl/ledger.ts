import type { Messages } from "../types";

const ledger: Messages["ledger"] = {
  title: "Księga",
  eyebrow: "Księga",
  heading: "Księga w podwójnym zapisie",
  subtitle: "Każdy ruch środków w dokładnych jednostkach tokena. Każdy zapis bilansuje się do zera i powstaje tylko raz dla danego klucza idempotencji, więc ponowienia niczego nie policzą podwójnie.",
  exportCsv: "Eksportuj CSV",
  emptyTitle: "Brak zapisów",
  emptyBody: "Zapisy pojawią się, gdy tylko płatność zostanie zweryfikowana w sieci.",
  accounts: {
    external: "Otrzymane (w sieci)",
    unresolved: "Niewyjaśnione",
    invoice: "Faktura",
    credit: "Saldo klienta",
    refund_pending: "Zwrot w toku",
    refunded: "Zwrócone",
  },
};

export default ledger;

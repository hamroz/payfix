import type { Messages } from "../types";

const ledger: Messages["ledger"] = {
  title: "Pääkirja",
  eyebrow: "Pääkirja",
  heading: "Kahdenkertainen pääkirja",
  subtitle: "Jokainen rahaliike tarkkoina token-yksikköinä. Jokainen kirjaus summautuu nollaan ja kirjataan vain kerran idempotenssiavainta kohden, joten uudelleenyritykset eivät voi laskea mitään kahdesti.",
  exportCsv: "Vie CSV",
  emptyTitle: "Ei vielä kirjauksia",
  emptyBody: "Kirjaukset näkyvät heti, kun maksu on vahvistettu ketjussa.",
  accounts: {
    external: "Vastaanotettu (ketjussa)",
    unresolved: "Ratkaisematta",
    invoice: "Lasku",
    credit: "Asiakkaan saldo",
    refund_pending: "Palautus odottaa",
    refunded: "Palautettu",
  },
};

export default ledger;

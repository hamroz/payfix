import type { Messages } from "../types";

const customers: Messages["customers"] = {
  title: "Asiakkaat",
  eyebrow: "Asiakkaat",
  heading: "Asiakkaat",
  subtitle: "Vakioasiakkaasi, heidän tilanteensa ja saldo, jonka he ovat halunneet jättää sinulle tulevia laskuja varten.",
  emptyTitle: "Ei vielä asiakkaita",
  emptyBody: "Lisää asiakas, niin voit aloittaa laskutuksen.",
  stats: {
    paid: "Maksettu",
    outstanding: "Avoinna",
    credit: "Saldo",
  },
  add: {
    button: "Lisää asiakas",
    title: "Lisää asiakas",
    name: "Nimi",
    email: "Laskutussähköposti",
    emailHint: "Ratkaisulinkin vahvistuskoodit lähetetään vain tähän osoitteeseen.",
    submit: "Lisää asiakas",
    added: "Asiakas lisätty: {name}",
  },
};

export default customers;

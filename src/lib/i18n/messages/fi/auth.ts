import type { Messages } from "../types";

const auth: Messages["auth"] = {
  title: "Kirjaudu sisään",
  homeLink: "PayFixin etusivu",
  email: {
    title: "Kirjaudu tai luo tili",
    subtitle: "Lähetämme sinulle 6-numeroisen koodin sähköpostiin. Ei salasanoja.",
    label: "Työsähköposti",
    placeholder: "you@agency.com",
    demo: "<b>Live-demo.</b> Käytä mitä tahansa sähköpostiosoitetta. Saat oman yksityisen yrityksen ja devnet-testilompakon. Koodit näkyvät vasemman alakulman demopostilaatikossa.",
  },
  code: {
    title: "Tarkista sähköpostisi",
    sent: "Lähetimme 6-numeroisen koodin osoitteeseen <email>{email}</email>.",
    verifying: "Vahvistetaan…",
    resend: "Lähetä koodi uudelleen",
  },
};

export default auth;

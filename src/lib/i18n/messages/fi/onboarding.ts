import type { Messages } from "../types";

const onboarding: Messages["onboarding"] = {
  title: "Luo yrityksesi",
  createAnother: "Luo uusi yritys",
  signedInAs: "Olet kirjautunut osoitteella <email>{email}</email>. Sinusta tulee yrityksen omistaja, ja voit kutsua tiimisi myöhemmin.",
  companyName: "Yrityksen nimi",
  sampleData: {
    title: "Lisää demoasiakas ja laskut",
    body: "{customer} ja kaksi laskua ({first} ja {second}) valmiina opastettua demoa varten. Yrityksesi saa oman devnet-testilompakon.",
  },
  wallet: {
    label: "Vastaanottolompakko",
    hint: "Maksut saapuvat tähän lompakkoon, ja palautukset allekirjoitetaan siitä. Allekirjoitat viestin todistaaksesi, että lompakko on sinun – mitään ei veloiteta. Voit lisätä lompakoita myöhemmin.",
    didNotSign: "Lompakko ei allekirjoittanut.",
  },
  settingUpWallet: "Lompakkoa otetaan käyttöön…",
  waitingForWallet: "Odotetaan lompakkoa…",
  create: "Luo yritys",
  openExisting: "Tai avaa jokin yrityksistäsi",
};

export default onboarding;

import type { Messages } from "../types";

const emails: Messages["emails"] = {
  signInCode: {
    subject: "PayFix-koodinne on {code}",
    body: "Jatkakaa syöttämällä koodi {code}. Koodi vanhenee 10 minuutissa. Jos ette pyytäneet koodia, voitte jättää tämän viestin huomiotta.",
  },
  resolutionLink: {
    subject: "Selvitetään ylimääräinen maksunne ({amount})",
    body: "Hei {name}, vastaanotimme {amount} enemmän kuin laskunne edellytti. Valitkaa, miten summa käsitellään: kohdistetaanko se toiselle laskulle, jätetäänkö se saldoksi vai palautetaanko se teille. Mitään ei siirretä, ennen kuin olemme molemmat hyväksyneet täsmälleen saman suunnitelman.",
  },
  changesRequested: {
    subject: "{business} pyysi muutosta suunnitelmaanne",
    body: "{business} kävi läpi version {version} ja pyysi: ”{note}” Avatkaa ratkaisulinkkinne ja lähettäkää päivitetty suunnitelma.",
  },
  memberAdded: {
    subject: "Teidät on lisätty PayFixissa työtilaan {business}",
    body: "{invitedBy} lisäsi teidät tiimiin. Roolinne: {role}. Kirjautukaa sisään tällä sähköpostiosoitteella avataksenne työtilan.",
  },
};

export default emails;

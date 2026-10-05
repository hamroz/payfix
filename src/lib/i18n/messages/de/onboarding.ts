import type { Messages } from "../types";

const onboarding: Messages["onboarding"] = {
  title: "Unternehmen anlegen",
  createAnother: "Weiteres Unternehmen anlegen",
  signedInAs: "Angemeldet als <email>{email}</email>. Sie werden Inhaber und können Ihr Team später einladen.",
  companyName: "Name des Unternehmens",
  sampleData: {
    title: "Demo-Kunden und Rechnungen hinzufügen",
    body: "{customer} mit einer Rechnung über {first} und einer über {second} – bereit für die geführte Demo. Ihr Unternehmen erhält ein eigenes Devnet-Test-Wallet.",
  },
  wallet: {
    label: "Empfangs-Wallet",
    hint: "Hier gehen Zahlungen ein, und von hier aus werden Rückerstattungen signiert. Sie signieren eine Nachricht, um zu belegen, dass es Ihnen gehört – dabei fallen keine Kosten an. Weitere Wallets können Sie später hinzufügen.",
    didNotSign: "Das Wallet hat nicht signiert.",
  },
  settingUpWallet: "Wallet wird eingerichtet…",
  waitingForWallet: "Warten auf Ihr Wallet…",
  create: "Unternehmen anlegen",
  openExisting: "Oder eines Ihrer Unternehmen öffnen",
};

export default onboarding;

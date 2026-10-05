import type { Messages } from "../types";

const auth: Messages["auth"] = {
  title: "Anmelden",
  homeLink: "PayFix-Startseite",
  email: {
    title: "Anmelden oder Konto erstellen",
    subtitle: "Wir senden Ihnen einen 6-stelligen Code per E-Mail. Ganz ohne Passwort.",
    label: "Geschäftliche E-Mail",
    placeholder: "you@agency.com",
    demo: "<b>Live-Demo.</b> Verwenden Sie eine beliebige E-Mail-Adresse. Sie erhalten ein eigenes privates Unternehmen mit einem Devnet-Test-Wallet. Die Codes erscheinen im Demo-Postfach unten links.",
  },
  code: {
    title: "Prüfen Sie Ihr Postfach",
    sent: "Wir haben einen 6-stelligen Code an <email>{email}</email> gesendet.",
    verifying: "Wird geprüft…",
    resend: "Code erneut senden",
  },
};

export default auth;

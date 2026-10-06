import type { Messages } from "../types";

const auth: Messages["auth"] = {
  title: "Zaloguj się",
  homeLink: "Strona główna PayFix",
  email: {
    title: "Zaloguj się lub załóż konto",
    subtitle: "Wyślemy Ci e-mailem 6-cyfrowy kod. Bez haseł.",
    label: "Służbowy e-mail",
    placeholder: "you@agency.com",
    demo: "<b>Demo na żywo.</b> Podaj dowolny e-mail. Dostaniesz własną, prywatną firmę z testowym portfelem w sieci devnet. Kody pojawią się w skrzynce demo w lewym dolnym rogu.",
  },
  code: {
    title: "Sprawdź skrzynkę",
    sent: "Wysłaliśmy 6-cyfrowy kod na adres <email>{email}</email>.",
    verifying: "Weryfikacja…",
    resend: "Wyślij kod ponownie",
  },
};

export default auth;

import type { Messages } from "../types";

const onboarding: Messages["onboarding"] = {
  title: "Utwórz firmę",
  createAnother: "Utwórz kolejną firmę",
  signedInAs: "Zalogowano jako <email>{email}</email>. Zostaniesz właścicielem firmy, a zespół zaprosisz później.",
  companyName: "Nazwa firmy",
  sampleData: {
    title: "Dodaj klienta i faktury demo",
    body: "{customer} z fakturami na {first} i {second} — wszystko gotowe do demo z przewodnikiem. Twoja firma dostanie własny testowy portfel w sieci devnet.",
  },
  wallet: {
    label: "Portfel odbiorczy",
    hint: "Tu trafiają płatności i stąd podpisujesz zwroty. Aby potwierdzić, że portfel należy do Ciebie, podpiszesz wiadomość — nic nie zostanie pobrane. Kolejne portfele dodasz później.",
    didNotSign: "Portfel nie złożył podpisu.",
  },
  settingUpWallet: "Konfigurowanie portfela…",
  waitingForWallet: "Czekamy na Twój portfel…",
  create: "Utwórz firmę",
  openExisting: "Albo otwórz jedną ze swoich",
};

export default onboarding;

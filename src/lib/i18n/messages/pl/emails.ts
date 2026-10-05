import type { Messages } from "../types";

const emails: Messages["emails"] = {
  signInCode: {
    subject: "{code} — kod logowania do PayFix",
    body: "Aby kontynuować, prosimy wpisać kod {code}. Kod wygaśnie za 10 minut. Jeśli nie prosili Państwo o ten kod, można zignorować tę wiadomość.",
  },
  resolutionLink: {
    subject: "Rozliczmy nadpłatę w wysokości {amount}",
    body: "Dzień dobry, {name}! Otrzymaliśmy o {amount} więcej, niż wynosiła faktura. Prosimy wybrać, co zrobić z nadwyżką: zaliczyć ją na inną fakturę, zostawić jako saldo albo zwrócić. Żadne środki nie zostaną przesunięte, dopóki obie strony nie zatwierdzą dokładnie tego samego planu.",
  },
  changesRequested: {
    subject: "Firma {business} prosi o zmianę planu",
    body: "Firma {business} sprawdziła wersję {version} i prosi: „{note}” Aby przesłać poprawiony plan, prosimy otworzyć link do rozwiązania sprawy.",
  },
  memberAdded: {
    subject: "Dostęp do firmy {business} w PayFix",
    body: "{invitedBy} dodaje Państwa do zespołu z rolą: {role}. Aby otworzyć przestrzeń roboczą, prosimy zalogować się tym adresem e-mail.",
  },
};

export default emails;

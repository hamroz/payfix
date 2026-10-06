import type { Messages } from "../types";

// The tester survey at /feedback (after the walkthrough in docs/tester-walkthrough.md).
const feedback: Messages["feedback"] = {
  title: "Jak poszło?",
  intro: "Dziękujemy za wypróbowanie PayFix. To zajmie około dwóch minut. Obowiązkowe są tylko pytania oznaczone *.",
  anonymous: "Twoje odpowiedzi są anonimowe, chyba że poniżej zdecydujesz się powiązać z nimi swoje konto PayFix.",
  completed: {
    label: "Czy udało Ci się przejść cały scenariusz?",
    unaided: "Tak, samodzielnie",
    aided: "Tak, z drobną pomocą",
    no: "Nie",
  },
  minutes: { label: "Ile mniej więcej minut to zajęło?", suffix: "min" },
  ease: { label: "Jak łatwe to było?", low: "Bardzo trudne", high: "Bardzo łatwe" },
  nps: { label: "Jak bardzo prawdopodobne jest, że polecisz PayFix firmie, która przyjmuje płatności w stablecoinach?", low: "Bardzo mało prawdopodobne", high: "Bardzo prawdopodobne" },
  openTitle: "Własnymi słowami",
  questions: {
    happened: "Co stało się z nadwyżką $100 i kto o tym zdecydował?",
    hesitated: "W którym momencie się zawahałeś(-aś) lub nie wiedziałeś(-aś), co kliknąć dalej?",
    voidedApproval: "Gdy po zatwierdzeniu zmienił się portfel do zwrotu, czy zauważyłeś(-aś), że zatwierdzenie zostało anulowane? Czy to wydawało się słuszne?",
    currentProcess: "Jeśli prowadzisz firmę, która przyjmuje płatności w stablecoinach: jak dziś radzisz sobie z nadpłatą i jak często się zdarza?",
    receiptTrust: "Czy zaufał(a)byś temu potwierdzeniu jako dokumentowi do wysłania klientowi lub księgowej? Czego w nim brakuje?",
    blockers: "Co powstrzymałoby Cię przed korzystaniem z PayFix i jakie narzędzie by zastąpił lub uzupełnił?",
  },
  aboutTitle: "O Tobie",
  about: { label: "Jaka to firma i jak duża?", placeholder: "np. agencja projektowa, 4 osoby" },
  device: { label: "Z czego korzystałeś(-aś)?", phone: "Telefon", tablet: "Tablet", computer: "Komputer" },
  quoteOk: "Możecie cytować moje odpowiedzi bez podawania mojego imienia.",
  attach: "Powiąż moje konto PayFix ({email}) z tymi odpowiedziami, żeby zespół widział, jak daleko doszedłem(-am).",
  submit: "Wyślij opinię",
  sending: "Wysyłanie…",
  required: "Odpowiedz na pytania oznaczone *.",
  thanks: { title: "Dziękujemy!", body: "Twoje odpowiedzi pomagają nam zdecydować, co poprawić w następnej kolejności.", back: "Wróć do PayFix" },
  guidedDemoLink: "Powiedz nam, jak poszło",
};

export default feedback;

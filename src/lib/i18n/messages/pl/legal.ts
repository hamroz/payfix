import type { Messages } from "../types";

const legal: Messages["legal"] = {
  footer: {
    disclaimer: "Prototyp hackathonowy. Wyłącznie tokeny testowe — nie dla środków klientów. PayFix nie widzi zwrotów wysłanych poza aplikacją.",
    legalHeading: "Informacje prawne",
    productHeading: "Produkt",
    howItWorks: "Jak to działa",
    signIn: "Zaloguj się",
    rights: "© {year} PayFix. Wszelkie prawa zastrzeżone.",
  },
  docs: {
    privacy: "Polityka prywatności",
    terms: "Regulamin",
    cookies: "Polityka cookies",
    security: "Bezpieczeństwo",
  },
  page: {
    updated: "Ostatnia aktualizacja: {date}",
    onThisPage: "Na tej stronie",
    otherDocuments: "Inne dokumenty",
    backHome: "Wróć na stronę główną",
    translationNote: "To tłumaczenie udostępniamy dla wygody. W razie rozbieżności rozstrzyga wersja angielska.",
    fallbackNote: "Ten dokument nie jest jeszcze dostępny w Twoim języku, dlatego wyświetlamy wersję angielską.",
    home: "Strona główna PayFix",
    contactEmail: "Możesz do nas napisać na adres <link>{email}</link>.",
    contactFallback: "Ta usługa nie opublikowała jeszcze adresu e-mail do kontaktu. Do tego czasu skontaktuj się z osobą lub zespołem, który udostępnił Ci tę usługę PayFix.",
  },
};

export default legal;

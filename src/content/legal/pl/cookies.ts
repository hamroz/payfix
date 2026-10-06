import type { LegalDoc } from "../types";

const cookies: LegalDoc = {
  title: "Polityka cookies",
  description: "Nieliczne pliki cookie i elementy pamięci przeglądarki, których używa PayFix, do czego służą i jak długo działają. Bez cookies analitycznych i reklamowych.",
  updated: "2026-10-05",
  intro: [
    "Ta polityka wyjaśnia, których plików cookie i podobnych mechanizmów pamięci przeglądarki używa PayFix i dlaczego. W skrócie: PayFix używa tylko tego, co jest potrzebne, aby Cię zalogować i zapamiętać dokonane przez Ciebie wybory. Nie używa plików cookie analitycznych, reklamowych ani śledzących.",
  ],
  sections: [
    {
      id: "what-are-cookies",
      heading: "Czym są pliki cookie i pamięć lokalna",
      blocks: [
        "Plik cookie to niewielki fragment tekstu, który strona internetowa prosi przeglądarkę o zapisanie i odesłanie przy kolejnych wizytach. Pamięć lokalna (local storage) to podobny mechanizm, który pozwala stronie przechowywać w przeglądarce niewielkie wartości. Żaden z nich nie jest programem i żaden nie może odczytywać innych plików na Twoim urządzeniu.",
      ],
    },
    {
      id: "cookies-we-use",
      heading: "Pliki cookie, których używamy",
      blocks: [
        "Wszystkie te pliki cookie ustawia sam PayFix (pliki cookie własne). Żaden z nich nie jest udostępniany innym stronom internetowym.",
        {
          list: [
            "<b>pf_b</b> utrzymuje Twoje zalogowanie na koncie firmy. Zawiera losowy token sesji. Wygasa po 7 dniach lub po wylogowaniu.",
            "<b>pf_c</b> utrzymuje Twoją weryfikację jako klienta w linku do rozwiązania sprawy po wpisaniu kodu, który wysłaliśmy Ci e-mailem. Zawiera losowy token sesji i wygasa po 7 dniach.",
            "<b>pf_ws</b> zapamiętuje, w której firmie pracujesz, jeśli należysz do więcej niż jednej. Zawiera wewnętrzny identyfikator firmy i wygasa po 30 dniach.",
            "<b>pf_inbox</b> jest używany wyłącznie w trybie demo. Zapamiętuje adres e-mail (a w przypadku klientów także firmę), dla którego poproszono o kod logowania, aby skrzynka demo pokazywała Twoje wiadomości, a nie cudze. Wygasa po 1 dniu.",
            "<b>pf-locale</b> zapamiętuje wybrany przez Ciebie język. Jest ustawiany tylko wtedy, gdy wybierzesz język, i wygasa po 1 roku. Bez niego PayFix używa języka Twojej przeglądarki.",
          ],
        },
      ],
    },
    {
      id: "local-storage",
      heading: "Pamięć lokalna, której używamy",
      blocks: [
        {
          list: [
            "<b>pf-theme</b> zapamiętuje, czy wybrano motyw jasny, ciemny czy ustawienie systemowe. Jest zapisywany tylko wtedy, gdy zmienisz motyw, i pozostaje, dopóki go nie wyczyścisz.",
            "<b>walletName</b> zapamiętuje, który portfel w przeglądarce (na przykład Phantom lub Solflare) połączono na stronie płatności, rozwiązania sprawy lub ustawień, aby następnym razem strona mogła połączyć się z nim ponownie. Pozostaje, dopóki go nie wyczyścisz lub nie odłączysz portfela.",
          ],
        },
        "Twoja aplikacja portfela również może przechowywać dane w przeglądarce. Robi to zgodnie z własnymi zasadami, a nie naszymi.",
      ],
    },
    {
      id: "no-tracking",
      heading: "Bez analityki i reklam",
      blocks: [
        "PayFix nie korzysta z narzędzi analitycznych, sieci reklamowych, wtyczek mediów społecznościowych ani pikseli śledzących. Nasze czcionki są serwowane z naszej własnej strony, więc wczytanie strony nie łączy się z zewnętrznymi usługami czcionek.",
        "Niektóre linki prowadzą do innych stron internetowych, takich jak Solana Explorer lub strona dostawcy portfela. Te strony mogą ustawiać własne pliki cookie zgodnie z własnymi zasadami.",
      ],
    },
    {
      id: "why-no-banner",
      heading: "Dlaczego nie prosimy o zgodę",
      blocks: [
        "Pliki cookie sesji, firmy i skrzynki demo są niezbędne do świadczenia usługi, o którą prosisz: bez nich nie dałoby się utrzymać zalogowania. Ustawienia języka i motywu są zapisywane tylko wtedy, gdy je wybierzesz, aby zapamiętać ten wybór. Ponieważ nie używamy żadnych innych plików cookie ani pamięci przeglądarki, nie wyświetlamy banera cookies.",
      ],
    },
    {
      id: "how-we-protect-cookies",
      heading: "Jak chronimy pliki cookie",
      blocks: [
        {
          list: [
            "Pliki cookie sesji, firmy i skrzynki demo mają atrybut HttpOnly, więc skrypty na stronie nie mogą ich odczytać.",
            "W bezpiecznych witrynach (HTTPS) pliki cookie mają atrybut Secure, więc są wysyłane wyłącznie przez szyfrowane połączenia.",
            "Pliki cookie mają ustawienie SameSite=Lax, które uniemożliwia korzystanie z nich większości żądań pochodzących z innych stron.",
            "Nasz serwer przechowuje tylko hash każdego tokena sesji, więc kopii naszej bazy danych nie da się użyć do zalogowania się jako Ty.",
          ],
        },
        "Plik cookie języka nie ma atrybutu HttpOnly, ponieważ odczytuje go menu wyboru języka. Zawiera wyłącznie kod języka.",
      ],
    },
    {
      id: "managing",
      heading: "Jak nimi zarządzać lub je usunąć",
      blocks: [
        "Pliki cookie i pamięć lokalną możesz przejrzeć i usunąć w ustawieniach przeglądarki, zwykle w sekcji prywatności lub danych witryn. Możesz też zablokować pliki cookie dla tej strony.",
        "Jeśli usuniesz lub zablokujesz pliki cookie sesji, sesja zostanie zakończona i nie zalogujesz się ponownie, dopóki ich nie dopuścisz. Jeśli usuniesz ustawienia języka lub motywu, PayFix wróci do języka Twojej przeglądarki i motywu systemowego.",
      ],
    },
    {
      id: "changes",
      heading: "Zmiany tej polityki",
      blocks: [
        "Jeśli dodamy, zmienimy lub usuniemy plik cookie, zaktualizujemy tę stronę i datę na jej górze. Jeśli masz pytania, skontaktuj się z nami. {contact}",
      ],
    },
  ],
};

export default cookies;

import type { LegalDoc } from "../types";

const security: LegalDoc = {
  title: "Bezpieczeństwo",
  description: "Jak PayFix chroni płatności, zatwierdzenia, zwroty i konta oraz jak zgłosić podatność.",
  updated: "2026-10-05",
  intro: [
    "PayFix obsługuje moment, w którym coś poszło nie tak z płatnością, dlatego został zbudowany tak, aby każdy krok dało się sprawdzić. Na tej stronie wyjaśniamy, jak PayFix chroni płatności, zatwierdzenia, zwroty i konta oraz jak zgłosić nam problem z bezpieczeństwem.",
    "PayFix to prototyp powstały w ramach hackathonu, który działa wyłącznie w sieciach testowych i na tokenach testowych. Nie przeszedł niezależnego audytu bezpieczeństwa. Nie używaj go do prawdziwych środków.",
  ],
  sections: [
    {
      id: "payments",
      heading: "Płatności są weryfikowane i liczone tylko raz",
      blocks: [
        {
          list: [
            "PayFix sprawdza każdy przychodzący przelew bezpośrednio w blockchainie: token, konto odbiorcy, kwotę oraz to, czy transakcja została potwierdzona. Kwota wynika z sald konta przed transakcją i po niej, a nieudane transakcje są pomijane.",
            "Każdy podpis transakcji jest zapisywany tylko raz, w tej samej transakcji bazy danych, w której liczona jest płatność. Ponowna synchronizacja, ponowienie ani restart serwera nie spowodują dwukrotnego policzenia tej samej płatności.",
            "Przelew bez identyfikatora płatności nigdy nie jest automatycznie dopasowywany do faktury. Pozostaje nieprzypisany, dopóki firma go nie przypisze, a klient nie potwierdzi planu.",
          ],
        },
      ],
    },
    {
      id: "ledger",
      heading: "Zbilansowana księga",
      blocks: [
        "Każda kwota jest zapisywana w księdze w podwójnym zapisie, w dokładnych, całkowitych jednostkach tokena, bez zaokrągleń. Każdy zapis w księdze bilansuje się do zera i ma unikalny klucz, więc dwukrotne przetworzenie tego samego zdarzenia nie ma żadnego skutku. W każdej chwili łączna otrzymana kwota równa się sumie kwot zaliczonych na faktury, pozostawionych jako saldo, zwróconych, czekających na zwrot i jeszcze niewyjaśnionych.",
      ],
    },
    {
      id: "approvals",
      heading: "Zatwierdzenia są powiązane z dokładnym planem",
      blocks: [
        {
          list: [
            "Każda wersja planu rozwiązania jest niezmienna od chwili przesłania. Każda zmiana tworzy nową wersję.",
            "Zatwierdzenie obejmuje hash SHA-256 planu: sprawę, wersję, dostępną kwotę, każde przypisanie i miejsce docelowe zwrotu. Jeśli którykolwiek z tych elementów się zmieni, wcześniejsze zatwierdzenie przestaje obowiązywać.",
            "Przed wykonaniem planu PayFix sprawdza hash, bieżącą wersję, kwotę, która jest nadal dostępna, oraz kwotę pozostałą na każdej fakturze.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      heading: "Zwroty są przygotowywane, sprawdzane i wysyłane tylko raz",
      blocks: [
        {
          list: [
            "Klient potwierdza, że kontroluje portfel do zwrotu, podpisując nim wiadomość. Pozwala to też wychwycić literówki i adresy, z których klient nie może podpisywać.",
            "PayFix przygotowuje dokładną transakcję zwrotu, a firma podpisuje ją we własnym portfelu. Następnie PayFix sprawdza, czy podpisana transakcja odpowiada temu, co przygotował.",
            "PayFix zapisuje podpis transakcji, zanim wyśle ją do sieci.",
            "W danym momencie w toku może być tylko jedna próba zwrotu; pilnuje tego baza danych. Nowa próba jest dozwolona dopiero wtedy, gdy poprzednia wygasła, nie trafiwszy do blockchaina, lub zakończyła się niepowodzeniem.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Portfele i klucze",
      blocks: [
        {
          list: [
            "Firma może dodać portfel odbiorczy tylko po podpisaniu nim wiadomości, więc błędnie wpisany adres nie może otrzymywać płatności klientów.",
            "PayFix nigdy nie prosi o klucz prywatny ani frazę odzyskiwania portfela.",
            "W trybie demo portfele demo to klucze testowe przechowywane w postaci zaszyfrowanej na serwerze, aby demo działało bez aplikacji portfela. Nigdy nie wysyłaj na nie prawdziwych środków.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      heading: "Konta i dostęp",
      blocks: [
        {
          list: [
            "Logujesz się 6-cyfrowym kodem wysłanym na Twój adres e-mail. Kod jest ważny przez 10 minut, można go użyć raz i pozwala na najwyżej 5 prób. Przechowujemy wyłącznie jego hash z kluczem.",
            "Tokeny sesji są losowe, przechowywane na naszym serwerze wyłącznie jako hash i wygasają po 7 dniach. Są zapisane w plikach cookie, których skrypty nie mogą odczytać i które w bezpiecznych witrynach są wysyłane wyłącznie przez szyfrowane połączenia.",
            "Linki do rozwiązania sprawy zawierają losowy token, który przechowujemy wyłącznie jako hash. Link wygasa po 7 dniach, a firma może go zastąpić lub unieważnić.",
            "Klient może działać wyłącznie w sprawie, do której należy jego własny link. Jest to sprawdzane ponownie przy każdym działaniu.",
            "Role w zespole (właściciel, edytujący, przeglądający) są sprawdzane na serwerze przy każdej zmianie, a ważne działania są zapisywane w dzienniku aktywności firmy.",
          ],
        },
      ],
    },
    {
      id: "abuse",
      heading: "Limity żądań",
      blocks: [
        "PayFix ogranicza liczbę kodów logowania, które można wysłać na jeden adres e-mail (5 na 15 minut i 20 dziennie), oraz liczbę kodów, o które można poprosić z jednej sieci (30 na godzinę). Kranik z tokenami testowymi ma limity na portfel, na sieć i łączny. Limity te są przechowywane z zahaszowanymi identyfikatorami, a nie z adresami e-mail ani adresami IP zapisanymi otwartym tekstem.",
      ],
    },
    {
      id: "web",
      heading: "Zabezpieczenia w przeglądarce",
      blocks: [
        {
          list: [
            "Strict Transport Security nakazuje przeglądarkom korzystać wyłącznie z szyfrowanych połączeń (HTTPS).",
            "Inne strony internetowe nie mogą wyświetlać stron PayFix w ramce, co chroni ekrany płatności i zatwierdzeń przed clickjackingiem.",
            "Przeglądarki otrzymują polecenie, aby nie zgadywały typów plików i przekazywały innym stronom tylko ograniczone informacje o stronie odsyłającej.",
            "Dostęp do kamery, mikrofonu i lokalizacji jest wyłączony.",
            "Sekrety, takie jak klucze do poczty e-mail i bazy danych, pozostają na serwerze i nigdy nie są wysyłane do przeglądarki.",
          ],
        },
      ],
    },
    {
      id: "on-chain-privacy",
      heading: "Prywatne dane nie trafiają do blockchaina",
      blocks: [
        "Do blockchaina zapisywany jest tylko losowy klucz referencyjny i numer zwrotu. Imiona i nazwiska, nazwy, adresy e-mail i szczegóły faktur pozostają w bazie danych PayFix.",
      ],
    },
    {
      id: "limits",
      heading: "Znane ograniczenia",
      blocks: [
        "PayFix widzi tylko płatności na portfele odbiorcze firmy i zwroty, które sam przygotowuje. Nie widzi zwrotów wysłanych bezpośrednio z portfela poza aplikacją i nie może im zapobiec.",
      ],
    },
    {
      id: "staying-safe",
      heading: "Jak możesz zadbać o bezpieczeństwo",
      blocks: [
        {
          list: [
            "Dbaj o bezpieczeństwo swojej skrzynki e-mail, ponieważ to tam trafiają kody logowania.",
            "Zanim wpiszesz kod lub cokolwiek podpiszesz, sprawdź adres strony.",
            "Zanim podpiszesz transakcję w portfelu, dokładnie ją przeczytaj.",
            "Nigdy nikomu nie udostępniaj klucza prywatnego ani frazy odzyskiwania. PayFix nigdy o nie nie poprosi.",
            "Wylogowuj się na współdzielonych urządzeniach.",
          ],
        },
      ],
    },
    {
      id: "disclosure",
      heading: "Zgłaszanie podatności",
      blocks: [
        "Jeśli uważasz, że w PayFix występuje problem z bezpieczeństwem, prosimy o poufne zgłoszenie. {contact}",
        "Prosimy o opis problemu, kroki pozwalające go odtworzyć, stronę lub funkcję, której dotyczy, oraz przewidywany wpływ.",
        "Badając problemy z bezpieczeństwem, prosimy:",
        {
          list: [
            "używać wyłącznie własnych kont i danych testowych;",
            "nie uzyskiwać dostępu do danych innych osób, nie zmieniać ich ani nie usuwać, a po natrafieniu na takie dane natychmiast przerwać;",
            "nie przeprowadzać ataków typu odmowa usługi (DoS), nie wysyłać spamu i nie stosować socjotechniki;",
            "nie korzystać z kranika z tokenami testowymi ani z portfeli demo w większym zakresie, niż jest to potrzebne do wykazania problemu;",
            "dać nam rozsądny czas na usunięcie problemu przed publicznym ujawnieniem szczegółów.",
          ],
        },
        "W zamian potwierdzimy otrzymanie zgłoszenia, będziemy informować o postępach i — jeśli sobie tego życzysz — wymienimy Cię jako autora zgłoszenia. Nie podejmiemy kroków prawnych wobec badań prowadzonych w dobrej wierze i zgodnie z tymi zasadami. Nie oferujemy płatnych nagród.",
        "Problemy w usługach, których nie kontrolujemy, takich jak sieć Solana, aplikacje portfeli czy nasi dostawcy hostingu i poczty e-mail, należy zgłaszać tym dostawcom.",
      ],
    },
  ],
};

export default security;

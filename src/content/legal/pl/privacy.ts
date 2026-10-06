import type { LegalDoc } from "../types";

const privacy: LegalDoc = {
  title: "Polityka prywatności",
  description: "Jakie dane osobowe zbiera PayFix, w jakim celu, komu je przekazuje, jak długo je przechowuje i jakie prawa Ci przysługują.",
  updated: "2026-10-06",
  intro: [
    "Ta polityka wyjaśnia, jakie dane osobowe zbiera usługa PayFix, w jakim celu to robimy, komu je przekazujemy, jak długo je przechowujemy i jakie prawa Ci przysługują. W tej polityce „my” oznacza operatora tej usługi PayFix.",
    "PayFix to prototyp powstały w ramach hackathonu. Działa w testowej sieci Solana devnet lub w symulowanej sieci, z tokenami testowymi, które nie mają wartości pieniężnej. Tam, gdzie to możliwe, używaj danych testowych i nie używaj PayFix do prawdziwych środków klientów.",
  ],
  sections: [
    {
      id: "who-we-are",
      heading: "Kto odpowiada za dane",
      blocks: [
        "Za dane osobowe opisane w tej polityce odpowiada operator tej usługi PayFix. {contact}",
        "Jeśli firma używa PayFix, aby wysłać Ci fakturę lub link do rozwiązania sprawy, to ta firma decyduje, które Twoje dane wprowadza. W sprawie danych, które ta firma przechowuje we własnej dokumentacji, możesz też skontaktować się bezpośrednio z nią.",
      ],
    },
    {
      id: "data-we-collect",
      heading: "Jakie dane zbieramy",
      blocks: [
        {
          list: [
            "<b>Dane konta:</b> adres e-mail, którym się logujesz. Gdy prosisz o kod logowania, tworzymy dla tego adresu rekord konta.",
            "<b>Dane firmy i zespołu:</b> nazwy firm, adres e-mail osoby, która utworzyła daną firmę, adresy e-mail i role członków zespołu oraz ustawienia powiadomień każdego członka.",
            "<b>Dane klientów i faktur</b> wprowadzane przez firmy: nazwy i adresy e-mail klientów oraz numery, tytuły, kwoty i terminy płatności faktur.",
            "<b>Dane rozwiązań:</b> plany proponowane przez klientów i firmy, wszelkie dodane przez nich notatki, zatwierdzenia oraz adres portfela do zwrotu wybrany przez klienta wraz z podpisaną wiadomością, która potwierdza, że klient kontroluje ten portfel.",
            "<b>Dane portfeli i płatności:</b> adresy portfeli, podpisy transakcji, kwoty i czasy, które PayFix odczytuje z blockchaina lub tworzy na potrzeby zwrotów.",
            "<b>Dane bezpieczeństwa:</b> kody logowania i tokeny sesji (przechowywane wyłącznie w postaci zahaszowanej), dziennik aktywności każdej firmy oraz rekordy limitów żądań. Rekordy limitów żądań zawierają skrócony hash Twojego adresu e-mail lub adresu IP, a nie sam adres.",
            "<b>Dziennik e-maili:</b> odbiorca, temat, treść i status doręczenia e-maili wysyłanych przez PayFix.",
            "<b>Opinie:</b> jeśli wypełnisz naszą nieobowiązkową ankietę, Twoje odpowiedzi i język, w którym ich udzielono. Odpowiedzi są anonimowe, chyba że zdecydujesz się powiązać z nimi swoje konto PayFix.",
            "<b>Dane techniczne:</b> Twój adres IP i podstawowe informacje o przeglądarce, które przetwarza nasz dostawca hostingu, gdy Twoja przeglądarka łączy się z usługą.",
          ],
        },
        "Nie prosimy o adres zamieszkania, numer telefonu, datę urodzenia, dokumenty tożsamości, dane bankowe ani klucze prywatne portfeli.",
      ],
    },
    {
      id: "how-we-use-data",
      heading: "Jak wykorzystujemy Twoje dane",
      blocks: [
        {
          list: [
            "Aby świadczyć usługę: logować Cię, dopasowywać płatności do faktur, przeprowadzać rozwiązania spraw i zwroty oraz tworzyć potwierdzenia.",
            "Aby wysyłać e-maile niezbędne do działania usługi: kody logowania, linki do rozwiązania sprawy, zaproszenia do zespołu i prośby o zmianę planu.",
            "Aby chronić PayFix i zapobiegać nadużyciom, na przykład przez ograniczanie liczby kodów logowania lub tokenów testowych, o które można poprosić.",
            "Aby prowadzić kompletną i dokładną dokumentację płatności, tak by każdą otrzymaną kwotę dało się wyjaśnić.",
            "Aby prowadzić usługę: osoby obsługujące PayFix widzą adresy e-mail kont, nazwy firm, członków zespołów i ich role, informację, czy konto lub firma są zawieszone, a także liczby i sumy aktywności w całej usłudze. Nasze narzędzia administracyjne nie pokazują im klientów, faktur, kwot ani portfeli firm. Każde działanie administratora jest rejestrowane.",
            "Aby przeciwdziałać oszustwom i nadużyciom: operatorzy mogą zawiesić konto lub firmę, wylogować konto albo zablokować dla danego adresu kody logowania lub tokeny testowe. Każde takie działanie jest rejestrowane wraz z powodem.",
            "Aby ulepszać PayFix na podstawie opinii, którymi testerzy zdecydują się z nami podzielić.",
          ],
        },
        "Nie sprzedajemy Twoich danych. Nie wykorzystujemy ich do reklamy ani profilowania, a PayFix nie korzysta z narzędzi analitycznych ani śledzących.",
      ],
    },
    {
      id: "legal-bases",
      heading: "Podstawy prawne",
      blocks: [
        "Tam, gdzie obowiązują przepisy o ochronie danych, takie jak unijne ogólne rozporządzenie o ochronie danych (RODO), przetwarzamy Twoje dane na następujących podstawach prawnych:",
        {
          list: [
            "<b>Wykonanie umowy:</b> aby świadczyć usługę, o którą prosisz Ty lub Twoja firma.",
            "<b>Prawnie uzasadnione interesy:</b> aby chronić usługę, zapobiegać nadużyciom i prowadzić rzetelną dokumentację. Opieramy się na tej podstawie tylko wtedy, gdy Twoje prawa nie przeważają nad tymi interesami.",
            "<b>Obowiązki prawne:</b> gdy przepisy wymagają od nas przechowywania lub ujawnienia danych.",
          ],
        },
      ],
    },
    {
      id: "blockchain",
      heading: "Publiczne dane w blockchainie",
      blocks: [
        "Płatności i zwroty to transakcje w publicznym blockchainie. Każdy może zobaczyć adresy portfeli, kwoty i czasy tych transakcji, a ani my, ani nikt inny nie może ich zmienić ani usunąć.",
        "PayFix nie zapisuje w blockchainie imion i nazwisk, nazw, adresów e-mail ani szczegółów faktur. Dodaje jedynie losowy klucz referencyjny do żądań płatności i numer zwrotu do zwrotów.",
      ],
    },
    {
      id: "sharing",
      heading: "Komu przekazujemy Twoje dane",
      blocks: [
        "Przekazujemy dane wyłącznie dostawcom usług, których potrzebujemy do działania PayFix:",
        {
          list: [
            "<b>Dostawcom hostingu i baz danych</b>, którzy uruchamiają aplikację i przechowują jej dane. Publiczne demo korzysta z hostingu Vercel i bazy danych Neon.",
            "<b>Resend</b>, który doręcza nasze e-maile. Otrzymuje adres odbiorcy i treść każdego e-maila.",
            "<b>Dostawcom sieci Solana (węzłom RPC)</b>, z którymi łączą się Twoja przeglądarka i nasz serwer, aby odczytywać i wysyłać transakcje. Widzą oni Twój adres IP i adresy portfeli, o które pytamy.",
            "<b>Aplikacjom portfeli</b>, które zdecydujesz się połączyć, takim jak Phantom lub Solflare. Przetwarzają one dane zgodnie z własnymi politykami prywatności.",
          ],
        },
        "W PayFix członkowie firmy widzą klientów, faktury, płatności i aktywność tej firmy. Klient widzi tylko sprawę i faktury powiązane z jego własnym linkiem do rozwiązania sprawy.",
        "Możemy też ujawnić dane, gdy wymagają tego przepisy prawa, lub aby chronić prawa i bezpieczeństwo użytkowników oraz usługi.",
      ],
    },
    {
      id: "international-transfers",
      heading: "Przekazywanie danych za granicę",
      blocks: [
        "Nasi dostawcy usług mogą przetwarzać dane w innych krajach niż Twój, w tym w Stanach Zjednoczonych. Gdy przepisy o ochronie danych wymagają zabezpieczeń dla takiego przekazywania, opieramy się na zabezpieczeniach oferowanych przez dostawców, takich jak standardowe klauzule umowne.",
      ],
    },
    {
      id: "retention",
      heading: "Jak długo przechowujemy dane",
      blocks: [
        {
          list: [
            "Kody logowania są ważne przez 10 minut i można ich użyć tylko raz.",
            "Sesje kończą się po 7 dniach lub wcześniej, gdy się wylogujesz.",
            "Linki do rozwiązania sprawy wygasają po 7 dniach lub wcześniej, gdy firma je zastąpi lub unieważni.",
            "Rekordy limitów żądań są zwykle usuwane po około dwóch dniach.",
            "Odpowiedzi z ankiety przechowujemy przez czas oceny testu i usuwamy je wraz z testowym wdrożeniem lub wcześniej, jeśli o to poprosisz.",
            "Po doręczeniu e-maila zawarty w nim link jest usuwany z naszego dziennika e-maili. W trybie demo e-maile nie są wysyłane: pozostają w bazie danych i są widoczne wyłącznie w skrzynce demo.",
            "Dane kont, firm, faktur, płatności i aktywności przechowujemy, dopóki istnieje konto lub firma, ponieważ dokumentacja płatności musi pozostać kompletna. W trybie demo właściciele firm mogą w każdej chwili zresetować dane swojej firmy.",
            "Logi serwera przechowuje przez ograniczony czas nasz dostawca hostingu. W trybie demo logi te zawierają również adresy e-mail, dla których zażądano kodów logowania, oraz same kody.",
          ],
        },
        "Testowe wdrożenia PayFix mogą zostać zresetowane lub wyłączone, co powoduje usunięcie ich danych. Dane w publicznym blockchainie są trwałe.",
      ],
    },
    {
      id: "security",
      heading: "Bezpieczeństwo",
      blocks: [
        "Chronimy Twoje dane za pomocą takich środków jak haszowanie kodów i tokenów sesji, pliki cookie niedostępne dla skryptów, szyfrowane połączenia, sprawdzanie ról przy każdej zmianie oraz limity żądań. Szczegółowo opisujemy je na stronie Bezpieczeństwo. Żaden system nie jest w pełni bezpieczny, dlatego prosimy o zgłaszanie każdej znalezionej słabości.",
      ],
    },
    {
      id: "your-rights",
      heading: "Twoje prawa",
      blocks: [
        "W zależności od miejsca zamieszkania możesz mieć prawo do:",
        {
          list: [
            "dostępu do danych osobowych, które o Tobie przechowujemy, i otrzymania ich kopii;",
            "sprostowania danych, które są nieprawidłowe lub niekompletne;",
            "żądania usunięcia Twoich danych;",
            "żądania ograniczenia sposobu, w jaki wykorzystujemy Twoje dane, lub sprzeciwu wobec ich wykorzystywania;",
            "otrzymania swoich danych w ustrukturyzowanym formacie nadającym się do odczytu maszynowego (przenoszenie danych);",
            "wniesienia skargi do organu nadzorczego ds. ochrony danych, w szczególności w kraju, w którym mieszkasz lub pracujesz.",
          ],
        },
        "Aby skorzystać z tych praw, skontaktuj się z nami. {contact} Zanim zrealizujemy żądanie, możemy poprosić o potwierdzenie, że adres e-mail należy do Ciebie. Nie możemy usuwać ani zmieniać danych w publicznym blockchainie i możemy zachować dane, których potrzebujemy, aby dokumentacja płatności była kompletna lub aby wypełnić obowiązki prawne.",
      ],
    },
    {
      id: "children",
      heading: "Dzieci",
      blocks: ["PayFix to narzędzie dla firm i nie jest przeznaczone dla dzieci. Nie korzystaj z niego, jeśli nie masz ukończonych 18 lat."],
    },
    {
      id: "changes",
      heading: "Zmiany tej polityki",
      blocks: [
        "Możemy aktualizować tę politykę, gdy zmieni się usługa lub przepisy. Data na górze tej strony wskazuje, kiedy polityka została ostatnio zaktualizowana. Jeśli zmiana będzie istotna, wyraźnie zaznaczymy to na tej stronie.",
      ],
    },
  ],
};

export default privacy;

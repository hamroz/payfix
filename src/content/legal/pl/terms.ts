import type { LegalDoc } from "../types";

const terms: LegalDoc = {
  title: "Regulamin",
  description: "Zasady korzystania z PayFix: prototyp wyłącznie do testów, który nie jest usługą finansową i jest udostępniany bez gwarancji.",
  updated: "2026-10-05",
  intro: [
    "Ten regulamin obowiązuje, gdy korzystasz z usługi PayFix — jako firma, członek zespołu lub klient, który otrzymał link do rozwiązania sprawy. W tym regulaminie „my” oznacza operatora tej usługi PayFix, a „Ty” — osobę, która z niej korzysta. Korzystając z PayFix, akceptujesz ten regulamin. Jeśli go nie akceptujesz, nie korzystaj z usługi.",
  ],
  sections: [
    {
      id: "about",
      heading: "Czym jest PayFix",
      blocks: [
        "PayFix to oprogramowanie, które pomaga firmie i jej klientowi uzgodnić, co stanie się z płatnością w stablecoinie, która nie zgadza się z fakturą, na przykład z nadpłatą lub podwójną płatnością. Dopasowuje płatności do faktur, pozwala obu stronom uzgodnić plan i zapisuje wynik.",
        "PayFix to prototyp powstały w ramach hackathonu. Jest wciąż rozwijany, może zawierać błędy i w każdej chwili może się zmienić lub przestać działać.",
      ],
    },
    {
      id: "test-only",
      heading: "Wyłącznie do testów",
      blocks: [
        "PayFix działa w testowej sieci Solana devnet lub w symulowanej sieci. Obsługuje wyłącznie tokeny testowe, które nie mają wartości pieniężnej i nie można ich wymienić na pieniądze.",
        {
          list: [
            "Nie wysyłaj prawdziwych środków, takich jak USDC w głównej sieci Solana, na żaden adres portfela wyświetlany przez PayFix, w tym na portfele demo.",
            "Nie używaj PayFix do obsługi prawdziwych płatności klientów ani prawdziwej dokumentacji firmowej.",
            "Portfele demo są kontrolowane przez nasz serwer i istnieją wyłącznie na potrzeby testów. Wszystko, co zostanie na nie wysłane, może przepaść.",
            "Możemy w każdej chwili, bez uprzedzenia, zresetować dane testowe.",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      heading: "Kto może korzystać z PayFix",
      blocks: [
        "Musisz mieć ukończone 18 lat i móc zawrzeć wiążącą umowę. Jeśli korzystasz z PayFix w imieniu firmy lub innej organizacji, potwierdzasz, że masz prawo zaakceptować ten regulamin w jej imieniu.",
      ],
    },
    {
      id: "not-financial-service",
      heading: "To nie jest usługa finansowa",
      blocks: [
        "PayFix nie jest bankiem, instytucją płatniczą, giełdą ani podmiotem przechowującym aktywa. Nie przechowuje, nie przesyła i nie kontroluje Twoich środków. Płatności i zwroty są wykonywane z portfeli, które kontrolujesz Ty lub druga strona, i tam są podpisywane.",
        "PayFix nie udziela porad finansowych, prawnych, podatkowych ani księgowych. Firmy i klienci odpowiadają za własne wzajemne ustalenia oraz za sprawdzenie, czy każdy plan, faktura i zwrot są prawidłowe, zanim je zatwierdzą lub podpiszą.",
      ],
    },
    {
      id: "accounts",
      heading: "Twoje konto",
      blocks: [
        {
          list: [
            "Logujesz się jednorazowym kodem wysłanym na Twój adres e-mail. Dbaj o bezpieczeństwo swojej skrzynki e-mail, ponieważ każdy, kto ma do niej dostęp, może zalogować się jako Ty.",
            "Odpowiadasz za to, co dzieje się na Twoim koncie. Wylogowuj się na współdzielonych urządzeniach.",
            "Właściciele firm decydują, kto należy do ich zespołu i jaką rolę ma każda osoba. Właściciele odpowiadają za usuwanie osób, które nie powinny już mieć dostępu.",
            "Jak najszybciej poinformuj nas, jeśli podejrzewasz, że ktoś użył Twojego konta bez zgody.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Portfele i transakcje",
      blocks: [
        {
          list: [
            "Wyłącznie Ty odpowiadasz za swój portfel, jego klucz prywatny i frazę odzyskiwania. Nigdy o nie nie poprosimy. Nigdy nikomu ich nie udostępniaj.",
            "Zanim podpiszesz transakcję w portfelu, sprawdź ją: kwotę, token i odbiorcę.",
            "Transakcji w blockchainie nie można cofnąć. Nie jesteśmy w stanie odzyskać tokenów wysłanych na błędny adres.",
            "PayFix wie tylko o płatnościach, które widzi w portfelach odbiorczych firmy, i o zwrotach, które sam przygotowuje. Nie widzi zwrotów ani płatności wykonanych poza aplikacją.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "Dozwolone korzystanie",
      blocks: [
        "Korzystając z PayFix, nie wolno Ci:",
        {
          list: [
            "łamać prawa ani używać PayFix do oszustw lub wprowadzania innych w błąd;",
            "wprowadzać danych osobowych innych osób, jeśli nie masz do tego prawa;",
            "podszywać się pod inną osobę, firmę lub klienta;",
            "próbować uzyskać dostępu do kont, firm lub danych, które nie należą do Ciebie;",
            "atakować, przeciążać ani zakłócać działania usługi ani próbować obchodzić jej limitów żądań lub limitów kranika z tokenami testowymi;",
            "przesyłać ani wysyłać złośliwego oprogramowania lub szkodliwego kodu;",
            "testować bezpieczeństwa PayFix w sposób niedozwolony przez naszą stronę Bezpieczeństwo.",
          ],
        },
      ],
    },
    {
      id: "your-content",
      heading: "Twoje dane",
      blocks: [
        "Zachowujesz wszelkie prawa do wprowadzanych danych. Zezwalasz nam na ich przechowywanie i przetwarzanie wyłącznie w celu świadczenia Ci usługi, zgodnie z naszą Polityką prywatności. Jeśli wprowadzasz dane swoich klientów, potwierdzasz, że masz do tego prawo i że mają od Ciebie informację o tym, w jaki sposób ich dane będą wykorzystywane.",
      ],
    },
    {
      id: "availability",
      heading: "Zmiany w usłudze",
      blocks: [
        "Możemy w każdej chwili zmienić, wstrzymać lub zakończyć działanie dowolnej części PayFix. Nie obiecujemy, że usługa będzie zawsze dostępna, że będzie wolna od błędów ani że dane zostaną zachowane.",
      ],
    },
    {
      id: "no-warranty",
      heading: "Brak gwarancji",
      blocks: [
        "PayFix jest udostępniany w takim stanie, w jakim jest, i w takim zakresie, w jakim jest dostępny, bez jakiejkolwiek gwarancji. W zakresie dozwolonym przez prawo nie obiecujemy, że usługa jest dokładna, niezawodna, bezpieczna ani przydatna do określonego celu.",
      ],
    },
    {
      id: "liability",
      heading: "Ograniczenie naszej odpowiedzialności",
      blocks: [
        "W zakresie dozwolonym przez prawo nie ponosimy odpowiedzialności za:",
        {
          list: [
            "szkody pośrednie lub następcze, takie jak utracone zyski, utracone możliwości biznesowe lub utracone dane;",
            "szkody spowodowane transakcjami w blockchainie, portfelami albo sieciami i usługami, których nie kontrolujemy;",
            "szkody spowodowane wysłaniem prawdziwych środków do PayFix lub na dowolny wyświetlany przez niego adres wbrew temu regulaminowi.",
          ],
        },
        "Jeśli ponosimy wobec Ciebie odpowiedzialność z jakiegokolwiek innego tytułu, nasza łączna odpowiedzialność jest ograniczona do kwoty zapłaconej nam przez Ciebie za korzystanie z PayFix w ciągu 12 miesięcy przed zgłoszeniem roszczenia.",
        "Żadne postanowienie tego regulaminu nie ogranicza odpowiedzialności, której nie można ograniczyć zgodnie z prawem, takiej jak odpowiedzialność za oszustwo albo za śmierć lub uszkodzenie ciała spowodowane zaniedbaniem. Żadne postanowienie tego regulaminu nie narusza praw przysługujących Ci jako konsumentowi, których nie można zmienić w drodze umowy.",
      ],
    },
    {
      id: "third-parties",
      heading: "Inne usługi",
      blocks: [
        "PayFix współpracuje z usługami, których nie kontrolujemy, takimi jak sieć Solana, aplikacje portfeli i doręczanie e-maili. Korzystanie z tych usług podlega ich własnym warunkom.",
      ],
    },
    {
      id: "termination",
      heading: "Zakończenie korzystania",
      blocks: [
        "Możesz w każdej chwili przestać korzystać z PayFix i poprosić nas o usunięcie Twoich danych zgodnie z naszą Polityką prywatności.",
        "Możemy zawiesić lub zakończyć Twój dostęp, jeśli naruszysz ten regulamin, jeśli sposób, w jaki korzystasz z usługi, stwarza ryzyko dla innych użytkowników lub dla usługi, albo jeśli zakończymy świadczenie usługi. Postanowienia dotyczące portfeli, braku gwarancji i ograniczenia naszej odpowiedzialności obowiązują również po zakończeniu Twojego dostępu.",
      ],
    },
    {
      id: "changes",
      heading: "Zmiany regulaminu",
      blocks: [
        "Możemy aktualizować ten regulamin. Data na górze tej strony wskazuje, kiedy został ostatnio zaktualizowany. Jeśli po zmianie nadal korzystasz z PayFix, obowiązuje Cię zaktualizowany regulamin.",
      ],
    },
    {
      id: "general",
      heading: "Postanowienia ogólne",
      blocks: [
        "Jeśli którekolwiek postanowienie tego regulaminu okaże się niewykonalne, pozostałe nadal obowiązują. Jeśli nie egzekwujemy któregoś z postanowień, nie oznacza to, że zrzekamy się prawa do jego późniejszego egzekwowania. Bezwzględnie obowiązujące przepisy, które chronią Cię w Twoim kraju, nadal mają zastosowanie.",
      ],
    },
    {
      id: "contact",
      heading: "Kontakt",
      blocks: ["Jeśli masz pytania dotyczące tego regulaminu, skontaktuj się z nami. {contact}"],
    },
  ],
};

export default terms;

import type { Messages } from "../types";

const landing: Messages["landing"] = {
  nav: {
    howItWorks: "Jak to działa",
    signIn: "Zaloguj się",
    dashboard: "Panel",
  },
  hero: {
    simulatedChain: "Symulowana sieć",
    cluster: "Solana {cluster}",
    tagline: "Rozwiązywanie problemów z płatnościami USDC dla agencji",
    titleLead: "Błędne płatności,",
    titleAccent: "rozliczone jak należy.",
    body: "Gdy klient zapłaci za dużo, zapłaci dwa razy albo wyśle USDC bez numeru faktury, PayFix zamieni to w uzgodnione, sfinalizowane rozliczenie — przez jeden wspólny link, któremu ufają obie strony.",
    tryDemo: "Wypróbuj demo na żywo",
    getStarted: "Zacznij",
    seeHow: "Zobacz, jak to działa",
    signIn: "Zaloguj się",
    testNote: "Demo używa wyraźnie oznaczonego tokena testowego, nigdy prawdziwych środków.",
    equation: "{received} otrzymane = {invoice} + {applied} + {refunded}.",
  },
  how: {
    eyebrow: "Cykl rozwiązania",
    title: "Od „wpłynęło za dużo” do rozliczenia — w czterech krokach.",
  },
  steps: {
    detect: {
      title: "Wykryj",
      body: "Każdy przelew na Twój portfel jest weryfikowany w sieci Solana — mint, kwota, odbiorca, potwierdzenie — i dopasowywany do faktury. Nadpłaty, duplikaty i przelewy bez numeru faktury trafiają do jednej skrzynki.",
    },
    propose: {
      title: "Zaproponuj",
      body: "Klient dostaje jeden bezpieczny link. Sam wybiera, gdzie trafi nadwyżka: na inną fakturę, na saldo, do zwrotu albo częściowo w każde z tych miejsc. Portfele do zwrotu są potwierdzane podpisem.",
    },
    approve: {
      title: "Zatwierdź",
      body: "Zatwierdzasz dokładnie tę wersję. Zmiana kwoty, faktury lub odbiorcy unieważnia zatwierdzenie, dopóki nie zatwierdzisz planu ponownie.",
    },
    settle: {
      title: "Rozlicz",
      body: "Podpisujesz zwrot z własnego portfela. Przypisania zostają zaksięgowane, zwrot potwierdza się w sieci, a obie strony dostają to samo potwierdzenie.",
    },
  },
  film: {
    eyebrow: "Zobacz w akcji",
    title: "Jedna nadpłata, od początku do końca.",
    note: "49 sekund · scenariusz demo na żywo, na środkach testowych",
  },
  controls: {
    eyebrow: "Stworzone z myślą o pieniądzach",
    title: "Kontrole, pod którymi podpisałby się dział finansów.",
    body: "Solana daje nam weryfikowalne płatności przychodzące i zwroty podpisywane przez sprzedawcę. PayFix dodaje to, co pomiędzy: uzgodnienie, autoryzację i księgę, która zawsze się bilansuje.",
  },
  guarantees: {
    neverDoubleCounted: {
      title: "Nic nie jest liczone dwa razy",
      body: "Każdy podpis transakcji w sieci jest rejestrowany tylko raz. Ponowna synchronizacja, ponowienia i restarty nie zawyżą otrzymanej kwoty.",
    },
    hashBound: {
      title: "Zatwierdzenie powiązane z hashem",
      body: "Zatwierdzenie obejmuje kwoty, faktury i odbiorcę. Każda zmiana tworzy nową wersję, która wymaga osobnego zatwierdzenia.",
    },
    oneRefund: {
      title: "Jeden zwrot naraz",
      body: "PayFix zapisuje podpis zwrotu przed wysłaniem go do sieci i pozwala ponowić próbę dopiero wtedy, gdy blockhash wygaśnie, a transakcja nie trafi do sieci.",
    },
    everyDollar: {
      title: "Każdy dolar wyjaśniony",
      body: "Księga w podwójnym zapisie, w dokładnych jednostkach tokena. Otrzymane zawsze równa się sumie: zaliczone + saldo + zwrócone + w toku + niewyjaśnione.",
    },
  },
  heroDemo: {
    invoiceCount: {
      one: "{count} faktura",
      few: "{count} faktury",
      many: "{count} faktur",
      other: "{count} faktury",
    },
    incomingTransfer: "Przelew przychodzący",
    received: "Otrzymano {amount}",
    reconciled: "Uzgodniono",
    needsResolution: "{amount} do wyjaśnienia",
    verifying: "Weryfikacja…",
    refunded: "Zwrócono",
    unresolved: "Niewyjaśnione",
    stages: {
      arrive: { title: "Wpływają płatności", note: "Dwa przelewy zweryfikowane w sieci Solana" },
      excess: { title: "Faktura rozliczona, {amount} nadwyżki", note: "Nadwyżka jest oznaczana, a nie zgadywana" },
      propose: { title: "Klient proponuje podział", note: "{applied} → {invoice} · {refund} zwrotu" },
      approve: { title: "Firma zatwierdza {version}", note: "Dokładny plan, zatwierdzenie powiązane z hashem" },
      settled: { title: "Każdy dolar ma swoje miejsce", note: "Zwrot potwierdzony · niewyjaśnione: {amount}" },
    },
  },
};

export default landing;

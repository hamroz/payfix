import type { Messages } from "../types";

const events: Messages["events"] = {
  invoice: {
    created: "Utworzono {number} dla klienta {customer}: {amount}",
    paid: "Faktura {number} opłacona w całości",
    overdue: "Faktura {number} jest po terminie: pozostało {remaining}",
  },
  customer: {
    created: "Dodano klienta {name} ({email})",
    verified: "Klient potwierdził e-mail i otworzył link do rozwiązania sprawy",
  },
  payment: {
    received: {
      settled: "{customer}: wpłata {amount} na {number} — faktura rozliczona",
      settledLate: "{customer}: wpłata {amount} na {number} — faktura rozliczona (po terminie)",
      partial: "{customer}: wpłata {amount} na {number} — pozostało {remaining}",
      partialLate: "{customer}: wpłata {amount} na {number} — pozostało {remaining} (po terminie)",
    },
  },
  transfer: {
    out: "Wysłano {amount} na {address}",
    unmatched: "{amount} wpłynęło z {address} bez numeru faktury",
  },
  case: {
    opened: {
      duplicate: "Prawdopodobny duplikat: {amount} wpłynęło już po rozliczeniu {number}",
      overpayment: "{amount} ponad pozostałą kwotę {number} — do wyjaśnienia",
    },
    assigned: "Przypisano płatność do klienta {customer}",
    resolved: {
      settled: "Rozbieżność rozwiązana: {amount} rozliczono zgodnie z ustaleniami",
      refunded: "Rozbieżność rozwiązana: zwrócono {amount}",
    },
  },
  link: {
    sent: "Wysłano link do rozwiązania sprawy na adres {email}",
  },
  proposal: {
    submitted: {
      first: "Klient zaproponował plan (v{version}): {lines}",
      revised: "Klient poprawił plan (v{version}): {changes}",
      unchanged: "Klient ponownie przesłał plan (v{version}): bez zmian",
    },
    approved: "Firma zatwierdziła plan v{version} ({shortHash})",
    declined: "Firma poprosiła o zmiany w v{version}: „{note}”",
  },
  approval: {
    invalidated: {
      changed: "Zatwierdzenie v{previous} jest już nieważne — {changes}. Wykonanie jest zablokowane, dopóki v{version} nie zostanie zatwierdzona.",
      resubmitted: "Zatwierdzenie v{previous} jest już nieważne — plan przesłano ponownie. Wykonanie jest zablokowane, dopóki v{version} nie zostanie zatwierdzona.",
    },
  },
  plan: {
    executed: {
      refundReserved: "Przypisania zaksięgowane. Zwrot {amount} jest zarezerwowany i czeka na podpis portfela firmy.",
      resolved: "Przypisania zaksięgowane. Sprawa rozwiązana.",
    },
  },
  refund: {
    submitted: "Firma podpisała zwrot {amount} na {destination}",
    confirmed: "Zwrot {amount} potwierdzony w sieci. Sprawa rozwiązana.",
    failed: "Transakcja zwrotu nie powiodła się i nie przesłała środków. Można ją ponowić.",
    expired: "Transakcja zwrotu wygasła, zanim trafiła do sieci. Żadne środki nie zostały przesłane; można bezpiecznie podpisać ją ponownie.",
  },
  credit: {
    applied: "Zaliczono {amount} z salda klienta na {number}",
  },
  member: {
    added: "Dodano do zespołu: {email} (rola: {role})",
    roleChanged: "{email} ma teraz rolę: {role}",
    removed: "Usunięto z zespołu: {email}",
  },
  wallet: {
    added: "Dodano portfel odbiorczy: {label} ({address})",
    activated: "Nowe płatności trafiają teraz do portfela {label} ({address})",
    removed: "Usunięto portfel odbiorczy: {label} ({address})",
  },

  fallbacks: {
    customer: "Klient",
    member: "Członek zespołu",
    invoice: "fakturę",
  },

  planLines: {
    invoice: "{amount} na {number}",
    credit: "{amount} na saldo",
    refund: "{amount} jako zwrot",
    separator: ", ",
  },

  changes: {
    allocationAdded: "Dodano przypisanie na {number}: {amount}",
    allocationRemoved: "Usunięto przypisanie na {number} (było {amount})",
    allocationChanged: "Przypisanie na {number}: zmiana z {from} na {to}",
    creditAdded: "Dodano saldo: {amount}",
    creditRemoved: "Usunięto saldo (było {amount})",
    creditChanged: "Saldo: zmiana z {from} na {to}",
    refundAdded: "Dodano zwrot: {amount}",
    refundRemoved: "Usunięto zwrot (było {amount})",
    refundChanged: "Zwrot: zmiana z {from} na {to}",
    destinationChanged: "Portfel do zwrotu: zmiana z {from} na {to}",
    destinationSet: "Ustawiono portfel do zwrotu: {to}",
    destinationRemoved: "Usunięto portfel do zwrotu",
    separator: "; ",
  },

  memos: {
    received: "Otrzymano {amount}",
    applied: "Zaliczono na {number}",
    creditApplied: "Zaliczono saldo na {number}",
    refundConfirmed: "Potwierdzono zwrot {amount}",
    plan: "Plan v{version}: {lines}",
  },

  approvalReasons: {
    superseded: "Zastąpione przez v{version}: {changes}",
    resubmitted: "Zastąpione przez v{version}: plan przesłano ponownie",
    changesRequested: "Firma poprosiła o zmiany: {note}",
  },
};

export default events;

import type { Messages } from "../types";

const events: Messages["events"] = {
  invoice: {
    created: "{number} für {customer} erstellt: {amount}",
    paid: "{number} ist vollständig bezahlt",
    overdue: "{number} ist überfällig: noch {remaining} offen",
  },
  customer: {
    created: "{name} als Kunde angelegt ({email})",
    verified: "Kunde hat seine E-Mail-Adresse bestätigt und den Klärungslink geöffnet",
  },
  payment: {
    received: {
      settled: "{customer} hat {amount} auf {number} gezahlt – Rechnung beglichen",
      settledLate: "{customer} hat {amount} auf {number} gezahlt – Rechnung beglichen (verspätet)",
      partial: "{customer} hat {amount} auf {number} gezahlt – noch {remaining} offen",
      partialLate: "{customer} hat {amount} auf {number} gezahlt – noch {remaining} offen (verspätet)",
    },
  },
  transfer: {
    out: "{amount} an {address} gesendet",
    unmatched: "{amount} von {address} ohne Rechnungsreferenz eingegangen",
  },
  case: {
    opened: {
      duplicate: "Mögliche Doppelzahlung: {amount} eingegangen, nachdem {number} bereits beglichen war",
      overpayment: "{amount} über dem Restbetrag von {number} – Klärung nötig",
    },
    assigned: "Zahlung zugeordnet: {customer}",
    resolved: {
      settled: "Abweichung geklärt: {amount} wie vereinbart abgewickelt",
      refunded: "Abweichung geklärt: {amount} erstattet",
    },
  },
  link: {
    sent: "Klärungslink an {email} gesendet",
  },
  proposal: {
    submitted: {
      first: "Kunde hat einen Plan vorgeschlagen (v{version}): {lines}",
      revised: "Kunde hat den Plan überarbeitet (v{version}): {changes}",
      unchanged: "Kunde hat den Plan überarbeitet (v{version}): keine Änderungen",
    },
    approved: "Unternehmen hat Plan v{version} freigegeben ({shortHash})",
    declined: "Unternehmen hat Änderungen an v{version} angefragt: „{note}“",
  },
  approval: {
    invalidated: {
      changed: "Freigabe von v{previous} gilt nicht mehr – {changes}. Die Ausführung ist blockiert, bis v{version} freigegeben ist.",
      resubmitted: "Freigabe von v{previous} gilt nicht mehr – Plan erneut eingereicht. Die Ausführung ist blockiert, bis v{version} freigegeben ist.",
    },
  },
  plan: {
    executed: {
      refundReserved: "Zuordnungen gebucht. Rückerstattung über {amount} reserviert; sie wartet auf die Signatur des Unternehmens-Wallets.",
      resolved: "Zuordnungen gebucht. Fall geklärt.",
    },
  },
  refund: {
    submitted: "Unternehmen hat die Rückerstattung über {amount} an {destination} signiert",
    confirmed: "Rückerstattung über {amount} on-chain bestätigt. Fall geklärt.",
    failed: "Erstattungstransaktion fehlgeschlagen; es wurde kein Geld bewegt. Sie kann wiederholt werden.",
    expired: "Die Erstattungstransaktion ist abgelaufen, ohne on-chain anzukommen. Es wurde kein Geld bewegt; Sie können gefahrlos erneut signieren.",
  },
  credit: {
    applied: "{amount} Kundenguthaben auf {number} verrechnet",
  },
  member: {
    added: "{email} ist als {role} beigetreten",
    roleChanged: "{email} ist jetzt {role}",
    removed: "{email} wurde aus dem Team entfernt",
  },
  wallet: {
    added: "Empfangs-Wallet hinzugefügt: {label} ({address})",
    activated: "Neue Zahlungen gehen jetzt an {label} ({address})",
    removed: "Empfangs-Wallet entfernt: {label} ({address})",
  },

  // Stand-ins when a name is unknown
  fallbacks: {
    customer: "Kunde",
    member: "Ein Mitglied",
    invoice: "Rechnung",
  },

  // One line of a plan ({lines} above), joined with `separator`
  planLines: {
    invoice: "{amount} auf {number}",
    credit: "{amount} als Guthaben",
    refund: "{amount} erstattet",
    separator: ", ",
  },

  // What changed between two versions of a plan ({changes} above), joined with `separator`
  changes: {
    allocationAdded: "Zuordnung zu {number} hinzugefügt: {amount}",
    allocationRemoved: "Zuordnung zu {number} entfernt (vorher {amount})",
    allocationChanged: "Zuordnung zu {number} von {from} auf {to} geändert",
    creditAdded: "Guthaben hinzugefügt: {amount}",
    creditRemoved: "Guthaben entfernt (vorher {amount})",
    creditChanged: "Guthaben von {from} auf {to} geändert",
    refundAdded: "Rückerstattung hinzugefügt: {amount}",
    refundRemoved: "Rückerstattung entfernt (vorher {amount})",
    refundChanged: "Rückerstattung von {from} auf {to} geändert",
    destinationChanged: "Erstattungsziel von {from} auf {to} geändert",
    destinationSet: "Erstattungsziel auf {to} gesetzt",
    destinationRemoved: "Erstattungsziel entfernt",
    separator: "; ",
  },

  // Ledger journal-entry memos
  memos: {
    received: "{amount} erhalten",
    applied: "Auf {number} verrechnet",
    creditApplied: "Guthaben auf {number} verrechnet",
    refundConfirmed: "Rückerstattung über {amount} bestätigt",
    plan: "Plan v{version}: {lines}",
  },

  // Why an approval no longer applies
  approvalReasons: {
    superseded: "Ersetzt durch v{version}: {changes}",
    resubmitted: "Ersetzt durch v{version}: Plan erneut eingereicht",
    changesRequested: "Unternehmen hat Änderungen angefragt: {note}",
  },
};

export default events;

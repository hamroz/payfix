import type { Messages } from "../types";

const receipt: Messages["receipt"] = {
  title: "Abrechnungsbeleg",
  saveAsPdf: "Als PDF speichern",
  private: {
    title: "Dieser Beleg ist privat",
    body: "Melden Sie sich als Unternehmen an, oder öffnen Sie ihn über Ihren Klärungslink, nachdem Sie Ihre E-Mail-Adresse bestätigt haben.",
  },
  eyebrow: "Abrechnungsbeleg",
  settled: "Abgeschlossen",
  inProgress: "In Bearbeitung",
  withCustomer: "und {customer}",
  withUnknownSender: "und ein nicht ermittelter Absender",
  resolvedAt: "Geklärt am {date}",
  openedAt: "Eröffnet am {date}",
  everyDollarInvoice: "Jeder auf {invoice} ({amount}) gezahlte Dollar",
  everyDollar: "Jeder erhaltene Dollar",
  parts: {
    otherInvoices: "andere Rechnungen",
    credit: "Guthaben",
    refunded: "erstattet",
    refundPending: "Erstattung ausstehend",
    unresolved: "ungeklärt",
  },
  incoming: "Eingehende Zahlungen",
  incomingFrom: "von {address} · {date}",
  unknownAddress: "unbekannt",
  agreedPlan: "Vereinbarter Plan · Version {version}",
  approvals: "Freigaben",
  approved: "v{version} freigegeben",
  approvalVoided: "Freigabe von v{version} ungültig",
  approvedBy: "von {name} · {date}",
  noApprovals: "Noch keine Freigaben.",
  refund: "Rückerstattung",
  refundStatus: {
    awaiting_signature: "wartet auf die Signatur des Unternehmens",
    submitted: "gesendet, wartet auf Bestätigung",
    confirmed: "bestätigt",
    failed: "letzter Versuch fehlgeschlagen, Betrag weiterhin reserviert",
  },
  refundLine: "{amount} · {status}",
  refundTo: "an {address}",
  refundToAt: "an {address} · {date}",
  notOnChain: "noch nicht on-chain",
  footnoteSimulated:
    "Beträge sind exakte Token-Einheiten von {token} auf einer simulierten Chain – Testgeld, keine Kundengelder. Dieser Nachweis umfasst Transfers, die PayFix beobachtet hat, und Rückerstattungen, die PayFix ausgelöst hat; Zahlungen außerhalb von PayFix sind nicht berücksichtigt.",
  footnote:
    "Beträge sind exakte Token-Einheiten von {token} auf Solana {cluster} – Testgeld, keine Kundengelder. Dieser Nachweis umfasst Transfers, die PayFix beobachtet hat, und Rückerstattungen, die PayFix ausgelöst hat; Zahlungen außerhalb von PayFix sind nicht berücksichtigt.",
};

export default receipt;

import type { Messages } from "../types";

const events: Messages["events"] = {
  invoice: {
    created: "Lasku {number} luotu asiakkaalle {customer}: {amount}",
    paid: "Lasku {number} on maksettu kokonaan",
    overdue: "Lasku {number} on erääntynyt: jäljellä {remaining}",
  },
  customer: {
    created: "Asiakas lisätty: {name} ({email})",
    verified: "Asiakas vahvisti sähköpostiosoitteensa ja avasi ratkaisulinkin",
  },
  payment: {
    received: {
      settled: "{customer} maksoi {amount} laskulle {number} – lasku maksettu",
      settledLate: "{customer} maksoi {amount} laskulle {number} – lasku maksettu (myöhässä)",
      partial: "{customer} maksoi {amount} laskulle {number} – jäljellä {remaining}",
      partialLate: "{customer} maksoi {amount} laskulle {number} – jäljellä {remaining} (myöhässä)",
    },
  },
  transfer: {
    out: "{amount} lähetetty osoitteeseen {address}",
    unmatched: "{amount} saapui osoitteesta {address} ilman laskuviitettä",
  },
  case: {
    opened: {
      duplicate: "Mahdollinen kaksoismaksu: {amount} saapui, kun lasku {number} oli jo maksettu",
      overpayment: "Laskun {number} avoimen summan ylittävä {amount} vaatii ratkaisun",
    },
    assigned: "Maksu liitetty asiakkaaseen {customer}",
    resolved: {
      settled: "Poikkeama ratkaistu: {amount} selvitetty sovitusti",
      refunded: "Poikkeama ratkaistu: {amount} palautettu",
    },
  },
  link: {
    sent: "Ratkaisulinkki lähetetty osoitteeseen {email}",
  },
  proposal: {
    submitted: {
      first: "Asiakas ehdotti suunnitelmaa (v{version}): {lines}",
      revised: "Asiakas muokkasi suunnitelmaa (v{version}): {changes}",
      unchanged: "Asiakas muokkasi suunnitelmaa (v{version}): ei muutoksia",
    },
    approved: "Yritys hyväksyi suunnitelman v{version} ({shortHash})",
    declined: "Yritys pyysi muutoksia versioon v{version}: ”{note}”",
  },
  approval: {
    invalidated: {
      changed: "Version v{previous} hyväksyntä ei ole enää voimassa – {changes}. Toteutus on estetty, kunnes v{version} hyväksytään.",
      resubmitted: "Version v{previous} hyväksyntä ei ole enää voimassa – suunnitelma lähetettiin uudelleen. Toteutus on estetty, kunnes v{version} hyväksytään.",
    },
  },
  plan: {
    executed: {
      refundReserved: "Kohdistukset kirjattu. Palautus {amount} on varattu ja odottaa yrityksen lompakon allekirjoitusta.",
      resolved: "Kohdistukset kirjattu. Tapaus ratkaistu.",
    },
  },
  refund: {
    submitted: "Yritys allekirjoitti palautuksen {amount} osoitteeseen {destination}",
    confirmed: "Palautus {amount} vahvistettu ketjussa. Tapaus ratkaistu.",
    failed: "Palautustransaktio epäonnistui, eikä varoja siirtynyt. Sen voi yrittää uudelleen.",
    expired: "Palautustransaktio vanheni ennen kuin se meni läpi. Varoja ei siirtynyt, joten uudelleen allekirjoittaminen on turvallista.",
  },
  credit: {
    applied: "{amount} asiakkaan saldosta kohdistettu laskulle {number}",
  },
  member: {
    added: "{email} liittyi tiimiin, rooli: {role}",
    roleChanged: "{email}: rooli on nyt {role}",
    removed: "{email} poistettiin tiimistä",
  },
  wallet: {
    added: "Vastaanottolompakko lisätty: {label} ({address})",
    activated: "Uudet maksut ohjataan nyt lompakkoon {label} ({address})",
    removed: "Vastaanottolompakko poistettu: {label} ({address})",
  },

  // Stand-ins when a name is unknown
  fallbacks: {
    customer: "Asiakas",
    member: "Jäsen",
    invoice: "lasku",
  },

  // One line of a plan ({lines} above), joined with `separator`
  planLines: {
    invoice: "{amount} laskulle {number}",
    credit: "{amount} saldoksi",
    refund: "{amount} palautuksena",
    separator: ", ",
  },

  // What changed between two versions of a plan ({changes} above), joined with `separator`
  changes: {
    allocationAdded: "Kohdistus laskulle {number} lisätty: {amount}",
    allocationRemoved: "Kohdistus laskulle {number} poistettu (oli {amount})",
    allocationChanged: "Kohdistus laskulle {number} muutettu: {from} → {to}",
    creditAdded: "Saldo-osuus lisätty: {amount}",
    creditRemoved: "Saldo-osuus poistettu (oli {amount})",
    creditChanged: "Saldo-osuus muutettu: {from} → {to}",
    refundAdded: "Palautus lisätty: {amount}",
    refundRemoved: "Palautus poistettu (oli {amount})",
    refundChanged: "Palautus muutettu: {from} → {to}",
    destinationChanged: "Palautuksen vastaanottaja muutettu: {from} → {to}",
    destinationSet: "Palautuksen vastaanottaja asetettu: {to}",
    destinationRemoved: "Palautuksen vastaanottaja poistettu",
    separator: "; ",
  },

  // Ledger journal-entry memos
  memos: {
    received: "Vastaanotettu {amount}",
    applied: "Kohdistettu laskulle {number}",
    creditApplied: "Saldoa kohdistettu laskulle {number}",
    refundConfirmed: "Palautus {amount} vahvistettu",
    plan: "Suunnitelma v{version}: {lines}",
  },

  // Why an approval no longer applies
  approvalReasons: {
    superseded: "Korvattu versiolla v{version}: {changes}",
    resubmitted: "Korvattu versiolla v{version}: suunnitelma lähetetty uudelleen",
    changesRequested: "Yritys pyysi muutoksia: {note}",
  },
};

export default events;

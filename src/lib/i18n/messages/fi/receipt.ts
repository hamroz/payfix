import type { Messages } from "../types";

const receipt: Messages["receipt"] = {
  title: "Selvityskuitti",
  saveAsPdf: "Tallenna PDF:nä",
  private: {
    title: "Tämä kuitti on yksityinen",
    body: "Kirjaudu sisään yrityksenä tai avaa kuitti ratkaisulinkistäsi vahvistettuasi sähköpostiosoitteesi.",
  },
  eyebrow: "Selvityskuitti",
  settled: "Selvitetty",
  inProgress: "Kesken",
  withCustomer: "ja {customer}",
  withUnknownSender: "ja tunnistamaton lähettäjä",
  resolvedAt: "Ratkaistu {date}",
  openedAt: "Avattu {date}",
  everyDollarInvoice: "Jokainen laskulle {invoice} ({amount}) maksettu dollari",
  everyDollar: "Jokainen vastaanotettu dollari",
  parts: {
    otherInvoices: "muille laskuille",
    credit: "saldoksi",
    refunded: "palautettu",
    refundPending: "palautus odottaa",
    unresolved: "ratkaisematta",
  },
  incoming: "Saapuneet maksut",
  incomingFrom: "lähettäjä {address} · {date}",
  unknownAddress: "tuntematon",
  agreedPlan: "Sovittu suunnitelma · versio {version}",
  approvals: "Hyväksynnät",
  approved: "v{version} hyväksytty",
  approvalVoided: "v{version}: hyväksyntä mitätöity",
  approvedBy: "hyväksyjä {name} · {date}",
  noApprovals: "Ei vielä hyväksyntöjä.",
  refund: "Palautus",
  refundStatus: {
    awaiting_signature: "odottaa yrityksen allekirjoitusta",
    submitted: "lähetetty, odottaa vahvistusta",
    confirmed: "vahvistettu",
    failed: "edellinen yritys epäonnistui, varat yhä varattuina",
  },
  refundLine: "{amount} · {status}",
  refundTo: "vastaanottaja {address}",
  refundToAt: "vastaanottaja {address} · {date}",
  notOnChain: "ei vielä ketjussa",
  footnoteSimulated:
    "Summat ovat tarkkoja token-yksiköitä (token: {token}) simuloidussa ketjussa – testirahaa, eivät asiakasvaroja. Tämä tosite kattaa PayFixin havaitsemat siirrot ja sen käynnistämät palautukset; PayFixin ulkopuolella tehdyt maksut eivät näy siinä.",
  footnote:
    "Summat ovat tarkkoja token-yksiköitä (token: {token}) Solana {cluster} -verkossa – testirahaa, eivät asiakasvaroja. Tämä tosite kattaa PayFixin havaitsemat siirrot ja sen käynnistämät palautukset; PayFixin ulkopuolella tehdyt maksut eivät näy siinä.",
};

export default receipt;

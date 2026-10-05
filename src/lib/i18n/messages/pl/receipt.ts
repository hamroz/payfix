import type { Messages } from "../types";

const receipt: Messages["receipt"] = {
  title: "Potwierdzenie rozliczenia",
  saveAsPdf: "Zapisz jako PDF",
  private: {
    title: "To potwierdzenie jest prywatne",
    body: "Zaloguj się jako firma albo otwórz je z linku do rozwiązania sprawy po zweryfikowaniu adresu e-mail.",
  },
  eyebrow: "Potwierdzenie rozliczenia",
  settled: "Rozliczono",
  inProgress: "W toku",
  withCustomer: "i {customer}",
  withUnknownSender: "i niezidentyfikowany nadawca",
  resolvedAt: "Rozwiązano {date}",
  openedAt: "Otwarto {date}",
  everyDollarInvoice: "Każdy dolar wpłacony na fakturę {invoice} ({amount})",
  everyDollar: "Każdy otrzymany dolar",
  parts: {
    otherInvoices: "inne faktury",
    credit: "saldo",
    refunded: "zwrócone",
    refundPending: "zwrot w toku",
    unresolved: "niewyjaśnione",
  },
  incoming: "Płatności przychodzące",
  incomingFrom: "od {address} · {date}",
  unknownAddress: "nieznany",
  agreedPlan: "Uzgodniony plan · wersja {version}",
  approvals: "Zatwierdzenia",
  approved: "Zatwierdzono v{version}",
  approvalVoided: "Unieważniono zatwierdzenie v{version}",
  approvedBy: "przez {name} · {date}",
  noApprovals: "Brak zatwierdzeń.",
  refund: "Zwrot",
  refundStatus: {
    awaiting_signature: "czeka na podpis firmy",
    submitted: "wysłany, czeka na potwierdzenie",
    confirmed: "potwierdzony",
    failed: "ostatnia próba nieudana, środki nadal zarezerwowane",
  },
  refundLine: "{amount} · {status}",
  refundTo: "na {address}",
  refundToAt: "na {address} · {date}",
  notOnChain: "jeszcze nie w sieci",
  footnoteSimulated:
    "Kwoty podano w dokładnych jednostkach tokena {token} w symulowanej sieci — to środki testowe, nie środki klientów. Ten dokument obejmuje przelewy zaobserwowane przez PayFix i zwroty zainicjowane przez PayFix; płatności wykonane poza PayFix nie są tu uwzględnione.",
  footnote:
    "Kwoty podano w dokładnych jednostkach tokena {token} w sieci Solana {cluster} — to środki testowe, nie środki klientów. Ten dokument obejmuje przelewy zaobserwowane przez PayFix i zwroty zainicjowane przez PayFix; płatności wykonane poza PayFix nie są tu uwzględnione.",
};

export default receipt;

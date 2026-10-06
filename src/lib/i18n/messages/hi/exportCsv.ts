import type { Messages } from "../types";

const exportCsv: Messages["exportCsv"] = {
  columns: {
    date: "तारीख़",
    entryId: "एंट्री ID",
    kind: "प्रकार",
    memo: "विवरण",
    account: "खाता",
    amount: "राशि",
    invoice: "इनवॉइस",
    caseId: "केस ID",
  },
  kinds: {
    receipt: "प्राप्ति",
    apply: "एडजस्ट",
    credit: "क्रेडिट",
    refund: "रिफ़ंड",
    resolution: "समाधान",
  },
  accounts: {
    external: "बाहरी (ऑन-चेन)",
    unresolved: "अनसुलझा",
    invoice: "इनवॉइस",
    credit: "ग्राहक क्रेडिट",
    refund_pending: "रिफ़ंड पेंडिंग",
    refunded: "रिफ़ंड हुआ",
  },
};

export default exportCsv;

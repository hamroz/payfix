import type { Messages } from "../types";

const ledger: Messages["ledger"] = {
  title: "लेजर",
  eyebrow: "लेजर",
  heading: "डबल-एंट्री लेजर",
  subtitle: "पैसे की हर आवाजाही, सटीक टोकन यूनिट में। हर एंट्री का जोड़ शून्य होता है और हर idempotency key पर सिर्फ़ एक बार लिखी जाती है, इसलिए रीट्राई से दोहरी गिनती नहीं हो सकती।",
  exportCsv: "CSV एक्सपोर्ट करें",
  emptyTitle: "अभी कोई एंट्री नहीं",
  emptyBody: "जैसे ही कोई पेमेंट चेन पर वेरिफ़ाई होगा, एंट्री यहाँ दिखने लगेंगी।",
  accounts: {
    external: "प्राप्त (ऑन-चेन)",
    unresolved: "अनसुलझा",
    invoice: "इनवॉइस",
    credit: "ग्राहक क्रेडिट",
    refund_pending: "रिफ़ंड पेंडिंग",
    refunded: "रिफ़ंड हुआ",
  },
};

export default ledger;

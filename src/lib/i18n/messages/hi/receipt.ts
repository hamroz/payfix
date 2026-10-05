import type { Messages } from "../types";

const receipt: Messages["receipt"] = {
  title: "सेटलमेंट रसीद",
  saveAsPdf: "PDF के रूप में सेव करें",
  private: {
    title: "यह रसीद निजी है",
    body: "बिज़नेस के रूप में साइन इन करें, या अपना ईमेल वेरिफ़ाई करने के बाद इसे अपने समाधान लिंक से खोलें।",
  },
  eyebrow: "सेटलमेंट रसीद",
  settled: "सेटल",
  inProgress: "जारी है",
  withCustomer: "और {customer}",
  withUnknownSender: "और एक अज्ञात भेजने वाला",
  resolvedAt: "{date} को सुलझा",
  openedAt: "{date} को खुला",
  everyDollarInvoice: "{invoice} ({amount}) के लिए चुकाया गया हर डॉलर",
  everyDollar: "प्राप्त हुआ हर डॉलर",
  parts: {
    otherInvoices: "दूसरे इनवॉइस",
    credit: "क्रेडिट",
    refunded: "रिफ़ंड",
    refundPending: "रिफ़ंड पेंडिंग",
    unresolved: "अनसुलझा",
  },
  incoming: "आने वाले पेमेंट",
  incomingFrom: "{address} से · {date}",
  unknownAddress: "अज्ञात",
  agreedPlan: "तय हुआ प्लान · वर्ज़न {version}",
  approvals: "मंज़ूरियाँ",
  approved: "v{version} मंज़ूर",
  approvalVoided: "v{version} की मंज़ूरी रद्द",
  approvedBy: "{name} द्वारा · {date}",
  noApprovals: "अभी कोई मंज़ूरी नहीं।",
  refund: "रिफ़ंड",
  refundStatus: {
    awaiting_signature: "बिज़नेस के सिग्नेचर का इंतज़ार",
    submitted: "भेजा गया, कन्फ़र्मेशन का इंतज़ार",
    confirmed: "कन्फ़र्म",
    failed: "पिछली कोशिश फ़ेल हुई, पैसा अब भी रिज़र्व है",
  },
  refundLine: "{amount} · {status}",
  refundTo: "{address} पर",
  refundToAt: "{address} पर · {date}",
  notOnChain: "अभी चेन पर नहीं",
  footnoteSimulated:
    "राशियाँ सिम्युलेटेड चेन पर {token} की सटीक टोकन यूनिट में हैं — यह टेस्ट मनी है, ग्राहकों का असली पैसा नहीं। इस रिकॉर्ड में वे ट्रांसफ़र शामिल हैं जो PayFix ने देखे, और वे रिफ़ंड जो उसने शुरू किए; PayFix के बाहर किए गए पेमेंट इसमें नहीं दिखते।",
  footnote:
    "राशियाँ Solana {cluster} पर {token} की सटीक टोकन यूनिट में हैं — यह टेस्ट मनी है, ग्राहकों का असली पैसा नहीं। इस रिकॉर्ड में वे ट्रांसफ़र शामिल हैं जो PayFix ने देखे, और वे रिफ़ंड जो उसने शुरू किए; PayFix के बाहर किए गए पेमेंट इसमें नहीं दिखते।",
};

export default receipt;

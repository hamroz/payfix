import type { Messages } from "../types";

const events: Messages["events"] = {
  invoice: {
    created: "{customer} के लिए {number} बनाया गया: {amount}",
    paid: "{number} पूरा चुकता हो गया",
    overdue: "{number} ओवरड्यू है: {remaining} बाकी",
  },
  customer: {
    created: "{name} को ग्राहक के रूप में जोड़ा गया ({email})",
    verified: "ग्राहक ने अपना ईमेल वेरिफ़ाई किया और समाधान लिंक खोला",
  },
  payment: {
    received: {
      settled: "{customer} ने {number} के लिए {amount} चुकाए — इनवॉइस सेटल हो गया",
      settledLate: "{customer} ने {number} के लिए {amount} चुकाए — इनवॉइस सेटल हो गया (देर से)",
      partial: "{customer} ने {number} के लिए {amount} चुकाए — {remaining} बाकी",
      partialLate: "{customer} ने {number} के लिए {amount} चुकाए — {remaining} बाकी (देर से)",
    },
  },
  transfer: {
    out: "{amount} {address} को भेजे गए",
    unmatched: "{address} से बिना इनवॉइस रेफ़रेंस के {amount} आए",
  },
  case: {
    opened: {
      duplicate: "संभावित डुप्लिकेट: {number} के सेटल हो जाने के बाद {amount} आए",
      overpayment: "{number} के बैलेंस से {amount} ज़्यादा आए — समाधान चाहिए",
    },
    assigned: "पेमेंट {customer} से जोड़ा गया",
    resolved: {
      settled: "एक्सेप्शन सुलझा: तय प्लान के मुताबिक़ {amount} सेटल हुए",
      refunded: "एक्सेप्शन सुलझा: {amount} रिफ़ंड हुए",
    },
  },
  link: {
    sent: "समाधान लिंक {email} को भेजा गया",
  },
  proposal: {
    submitted: {
      first: "ग्राहक ने प्लान सुझाया (v{version}): {lines}",
      revised: "ग्राहक ने प्लान बदला (v{version}): {changes}",
      unchanged: "ग्राहक ने प्लान दोबारा भेजा (v{version}): कोई बदलाव नहीं",
    },
    approved: "बिज़नेस ने प्लान v{version} मंज़ूर किया ({shortHash})",
    declined: "बिज़नेस ने v{version} में बदलाव माँगे: “{note}”",
  },
  approval: {
    invalidated: {
      changed: "v{previous} की मंज़ूरी अब लागू नहीं — {changes}। जब तक v{version} मंज़ूर नहीं होता, प्लान लागू नहीं हो सकता।",
      resubmitted: "v{previous} की मंज़ूरी अब लागू नहीं — प्लान दोबारा भेजा गया। जब तक v{version} मंज़ूर नहीं होता, प्लान लागू नहीं हो सकता।",
    },
  },
  plan: {
    executed: {
      refundReserved: "बँटवारा दर्ज हुआ। {amount} का रिफ़ंड रिज़र्व है और बिज़नेस वॉलेट के सिग्नेचर का इंतज़ार कर रहा है।",
      resolved: "बँटवारा दर्ज हुआ। केस सुलझ गया।",
    },
  },
  refund: {
    submitted: "बिज़नेस ने {destination} को {amount} का रिफ़ंड साइन किया",
    confirmed: "{amount} का रिफ़ंड चेन पर कन्फ़र्म हुआ। केस सुलझ गया।",
    failed: "रिफ़ंड ट्रांज़ैक्शन फ़ेल हो गया और कोई पैसा नहीं गया। इसे फिर से आज़माया जा सकता है।",
    expired: "रिफ़ंड ट्रांज़ैक्शन बिना लैंड हुए एक्सपायर हो गया। कोई पैसा नहीं गया; दोबारा साइन करना सुरक्षित है।",
  },
  credit: {
    applied: "{amount} का ग्राहक क्रेडिट {number} में एडजस्ट हुआ",
  },
  member: {
    added: "{email} को {role} के रूप में जोड़ा गया",
    roleChanged: "{email} का रोल अब {role} है",
    removed: "{email} को टीम से हटा दिया गया",
  },
  wallet: {
    added: "रिसीविंग वॉलेट जोड़ा गया: {label} ({address})",
    activated: "नए पेमेंट अब {label} ({address}) में आएँगे",
    removed: "रिसीविंग वॉलेट हटाया गया: {label} ({address})",
  },

  fallbacks: {
    customer: "ग्राहक",
    member: "एक सदस्य",
    invoice: "इनवॉइस",
  },

  planLines: {
    invoice: "{number} में {amount}",
    credit: "{amount} क्रेडिट के रूप में",
    refund: "{amount} रिफ़ंड",
    separator: ", ",
  },

  changes: {
    allocationAdded: "{number} के लिए बँटवारा जोड़ा गया: {amount}",
    allocationRemoved: "{number} का बँटवारा हटाया गया (पहले {amount} था)",
    allocationChanged: "{number} का बँटवारा {from} से बदलकर {to} किया गया",
    creditAdded: "क्रेडिट जोड़ा गया: {amount}",
    creditRemoved: "क्रेडिट हटाया गया (पहले {amount} था)",
    creditChanged: "क्रेडिट {from} से बदलकर {to} किया गया",
    refundAdded: "रिफ़ंड जोड़ा गया: {amount}",
    refundRemoved: "रिफ़ंड हटाया गया (पहले {amount} था)",
    refundChanged: "रिफ़ंड {from} से बदलकर {to} किया गया",
    destinationChanged: "रिफ़ंड वॉलेट {from} से बदलकर {to} किया गया",
    destinationSet: "रिफ़ंड वॉलेट {to} सेट किया गया",
    destinationRemoved: "रिफ़ंड वॉलेट हटाया गया",
    separator: "; ",
  },

  memos: {
    received: "{amount} प्राप्त",
    applied: "{number} में एडजस्ट",
    creditApplied: "{number} में क्रेडिट एडजस्ट",
    refundConfirmed: "{amount} का रिफ़ंड कन्फ़र्म",
    plan: "प्लान v{version}: {lines}",
  },

  approvalReasons: {
    superseded: "v{version} ने इसकी जगह ली: {changes}",
    resubmitted: "v{version} ने इसकी जगह ली: प्लान दोबारा भेजा गया",
    changesRequested: "बिज़नेस ने बदलाव माँगे: {note}",
  },
};

export default events;

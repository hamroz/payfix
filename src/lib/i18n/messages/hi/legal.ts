import type { Messages } from "../types";

const legal: Messages["legal"] = {
  footer: {
    disclaimer: "हैकथॉन प्रोटोटाइप। सिर्फ़ टेस्ट टोकन के लिए; ग्राहकों के असली पैसों के लिए नहीं। ऐप के बाहर से भेजे गए रिफ़ंड PayFix नहीं देख सकता।",
    legalHeading: "क़ानूनी",
    productHeading: "प्रोडक्ट",
    howItWorks: "यह कैसे काम करता है",
    signIn: "साइन इन",
    rights: "© {year} PayFix। सर्वाधिकार सुरक्षित।",
  },
  docs: {
    privacy: "गोपनीयता नीति",
    terms: "उपयोग की शर्तें",
    cookies: "कुकी नीति",
    security: "सुरक्षा",
  },
  page: {
    updated: "अंतिम अपडेट: {date}",
    onThisPage: "इस पेज पर",
    otherDocuments: "अन्य दस्तावेज़",
    backHome: "होम पर वापस जाएँ",
    translationNote: "यह अनुवाद आपकी सुविधा के लिए दिया गया है। अगर यह अंग्रेज़ी संस्करण से अलग हो, तो अंग्रेज़ी संस्करण ही मान्य होगा।",
    fallbackNote: "यह दस्तावेज़ अभी आपकी भाषा में उपलब्ध नहीं है, इसलिए इसे अंग्रेज़ी में दिखाया जा रहा है।",
    home: "PayFix होम",
    contactEmail: "आप हमें <link>{email}</link> पर लिख सकते हैं।",
    contactFallback: "इस सेवा ने अभी तक संपर्क के लिए कोई ईमेल पता प्रकाशित नहीं किया है। तब तक, उस व्यक्ति या टीम से संपर्क करें जिसने यह PayFix सेवा आपके साथ शेयर की है।",
  },
};

export default legal;

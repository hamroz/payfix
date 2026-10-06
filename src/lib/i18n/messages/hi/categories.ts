import type { Messages } from "../types";

const categories: Messages["categories"] = {
  payments: { label: "पेमेंट", description: "आने वाले पेमेंट, बिना रेफ़रेंस वाले ट्रांसफ़र, और आपके वॉलेट से बाहर जाने वाला पैसा।" },
  exceptions: { label: "एक्सेप्शन", description: "ज़्यादा पेमेंट और डुप्लिकेट जिन पर फ़ैसला चाहिए, और उनके सुलझने की सूचना।" },
  resolutions: { label: "समाधान", description: "समाधान लिंक, ग्राहकों के प्लान, मंज़ूरियाँ और लागू हुए प्लान।" },
  refunds: { label: "रिफ़ंड", description: "साइन हुए, चेन पर कन्फ़र्म हुए, फ़ेल या एक्सपायर हुए रिफ़ंड।" },
  invoices: { label: "इनवॉइस", description: "नए इनवॉइस, पूरे चुकाए गए या ओवरड्यू इनवॉइस, और एडजस्ट हुआ क्रेडिट।" },
  customers: { label: "ग्राहक", description: "इस कंपनी में जोड़े गए नए ग्राहक।" },
  team: { label: "टीम और वॉलेट", description: "लोगों का जुड़ना, उनका रोल बदलना या टीम छोड़ना, और रिसीविंग वॉलेट में बदलाव।" },
};

export default categories;

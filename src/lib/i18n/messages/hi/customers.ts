import type { Messages } from "../types";

const customers: Messages["customers"] = {
  title: "ग्राहक",
  eyebrow: "ग्राहक",
  heading: "ग्राहक",
  subtitle: "आपके नियमित क्लाइंट, उनके बैलेंस, और वह क्रेडिट जो उन्होंने आपके पास रखना चुना है।",
  emptyTitle: "अभी कोई ग्राहक नहीं",
  emptyBody: "इनवॉइस भेजना शुरू करने के लिए एक ग्राहक जोड़ें।",
  stats: {
    paid: "चुकाया",
    outstanding: "बकाया",
    credit: "क्रेडिट",
  },
  add: {
    button: "ग्राहक जोड़ें",
    title: "ग्राहक जोड़ें",
    name: "नाम",
    email: "बिलिंग ईमेल",
    emailHint: "समाधान के कोड सिर्फ़ इसी पते पर भेजे जाते हैं।",
    submit: "ग्राहक जोड़ें",
    added: "{name} को जोड़ दिया गया",
  },
};

export default customers;

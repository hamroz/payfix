import type { Messages } from "../types";

const auth: Messages["auth"] = {
  title: "साइन इन",
  homeLink: "PayFix होम",
  email: {
    title: "साइन इन करें या अकाउंट बनाएँ",
    subtitle: "हम आपको 6 अंकों का कोड ईमेल करेंगे। पासवर्ड की ज़रूरत नहीं।",
    label: "ऑफ़िस ईमेल",
    placeholder: "you@agency.com",
    demo: "<b>लाइव डेमो।</b> कोई भी ईमेल डालें। आपको devnet टेस्ट वॉलेट के साथ अपनी निजी कंपनी मिलेगी। कोड नीचे बाईं ओर डेमो इनबॉक्स में दिखेंगे।",
  },
  code: {
    title: "अपना ईमेल देखें",
    sent: "हमने <email>{email}</email> पर 6 अंकों का कोड भेजा है।",
    verifying: "वेरिफ़ाई हो रहा है…",
    resend: "कोड फिर से भेजें",
  },
};

export default auth;

import type { Messages } from "../types";

const onboarding: Messages["onboarding"] = {
  title: "अपनी कंपनी बनाएँ",
  createAnother: "एक और कंपनी बनाएँ",
  signedInAs: "आपने <email>{email}</email> से साइन इन किया है। आप इस कंपनी के ओनर होंगे और बाद में अपनी टीम को इनवाइट कर सकते हैं।",
  companyName: "कंपनी का नाम",
  sampleData: {
    title: "डेमो ग्राहक और इनवॉइस जोड़ें",
    body: "{first} और {second} के इनवॉइस के साथ {customer}, गाइडेड डेमो के लिए तैयार। आपकी कंपनी को अपना devnet टेस्ट वॉलेट मिलता है।",
  },
  wallet: {
    label: "रिसीविंग वॉलेट",
    hint: "पेमेंट इसी में आते हैं और रिफ़ंड इसी से साइन होते हैं। यह वॉलेट आपका है, यह साबित करने के लिए आप एक मैसेज साइन करेंगे; कोई चार्ज नहीं लगेगा। बाद में और वॉलेट जोड़ सकते हैं।",
    didNotSign: "वॉलेट ने साइन नहीं किया।",
  },
  settingUpWallet: "आपका वॉलेट सेट हो रहा है…",
  waitingForWallet: "आपके वॉलेट का इंतज़ार है…",
  create: "कंपनी बनाएँ",
  openExisting: "या अपनी कोई मौजूदा कंपनी खोलें",
};

export default onboarding;

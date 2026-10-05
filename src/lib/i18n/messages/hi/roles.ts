import type { Messages } from "../types";

const roles: Messages["roles"] = {
  owner: { label: "ओनर", description: "सब कुछ, साथ ही टीम, वॉलेट और वर्कस्पेस सेटिंग्स" },
  editor: { label: "एडिटर", description: "इनवॉइस, ग्राहक, मंज़ूरियाँ और रिफ़ंड" },
  viewer: { label: "व्यूअर", description: "सिर्फ़ देखने और एक्सपोर्ट करने का एक्सेस" },
};

export default roles;

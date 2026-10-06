import type { Messages } from "../types";

const wallet: Messages["wallet"] = {
  connect: "वॉलेट कनेक्ट करें",
  connecting: "कनेक्ट हो रहा है…",
  disconnect: "वॉलेट डिस्कनेक्ट करें",
  pickerTitle: "वॉलेट कनेक्ट करें",
  devnetHint: "पहले अपने वॉलेट को Solana devnet पर स्विच करें।",
  noneFound: "इस ब्राउज़र में कोई Solana वॉलेट नहीं मिला।",
  getPhantom: "Phantom इंस्टॉल करें",
  detected: "मौजूद है",
  connectFirst: "पहले वॉलेट कनेक्ट करें।",
  cannotSign: "यह वॉलेट मैसेज साइन नहीं कर सकता। Phantom या Solflare आज़माएँ।",
};

export default wallet;

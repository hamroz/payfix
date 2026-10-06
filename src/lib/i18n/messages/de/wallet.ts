import type { Messages } from "../types";

const wallet: Messages["wallet"] = {
  connect: "Wallet verbinden",
  connecting: "Wird verbunden…",
  disconnect: "Wallet trennen",
  pickerTitle: "Wallet verbinden",
  devnetHint: "Stellen Sie Ihr Wallet zuerst auf Solana Devnet um.",
  noneFound: "In diesem Browser wurde kein Solana-Wallet gefunden.",
  getPhantom: "Phantom installieren",
  detected: "Erkannt",
  connectFirst: "Verbinden Sie zuerst ein Wallet.",
  cannotSign: "Dieses Wallet kann keine Nachrichten signieren. Versuchen Sie es mit Phantom oder Solflare.",
};

export default wallet;

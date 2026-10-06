import type { Messages } from "../types";

const wallet: Messages["wallet"] = {
  connect: "Połącz portfel",
  connecting: "Łączenie…",
  disconnect: "Odłącz portfel",
  pickerTitle: "Połącz portfel",
  devnetHint: "Najpierw przełącz portfel na Solana devnet.",
  noneFound: "W tej przeglądarce nie znaleziono portfela Solana.",
  getPhantom: "Pobierz Phantom",
  detected: "Wykryto",
  connectFirst: "Najpierw połącz portfel.",
  cannotSign: "Ten portfel nie podpisuje wiadomości. Użyj Phantom lub Solflare.",
};

export default wallet;

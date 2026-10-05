import type { Messages } from "../types";

const wallet: Messages["wallet"] = {
  connect: "Подключить кошелёк",
  connecting: "Подключаем…",
  disconnect: "Отключить кошелёк",
  pickerTitle: "Подключите кошелёк",
  devnetHint: "Сначала переключите кошелёк на Solana devnet.",
  noneFound: "В этом браузере не найден кошелёк Solana.",
  getPhantom: "Установить Phantom",
  detected: "Найден",
  connectFirst: "Сначала подключите кошелёк.",
  cannotSign: "Этот кошелёк не умеет подписывать сообщения. Попробуйте Phantom или Solflare.",
};

export default wallet;

import type { Messages } from "../types";

const wallet: Messages["wallet"] = {
  connect: "连接钱包",
  connecting: "连接中…",
  disconnect: "断开钱包",
  pickerTitle: "连接钱包",
  devnetHint: "请先将钱包切换到 Solana devnet。",
  noneFound: "此浏览器中未找到 Solana 钱包。",
  getPhantom: "获取 Phantom",
  detected: "已检测到",
  connectFirst: "请先连接钱包。",
  cannotSign: "此钱包无法签名消息，请改用 Phantom 或 Solflare。",
};

export default wallet;

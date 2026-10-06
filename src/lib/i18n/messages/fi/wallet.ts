import type { Messages } from "../types";

const wallet: Messages["wallet"] = {
  connect: "Yhdistä lompakko",
  connecting: "Yhdistetään…",
  disconnect: "Katkaise lompakon yhteys",
  pickerTitle: "Yhdistä lompakko",
  devnetHint: "Vaihda lompakkosi ensin Solana devnet -verkkoon.",
  noneFound: "Tästä selaimesta ei löytynyt Solana-lompakkoa.",
  getPhantom: "Hanki Phantom",
  detected: "Löydetty",
  connectFirst: "Yhdistä ensin lompakko.",
  cannotSign: "Tämä lompakko ei osaa allekirjoittaa viestejä. Kokeile Phantomia tai Solflarea.",
};

export default wallet;

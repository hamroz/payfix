import type { Messages } from "../types";

const wallet: Messages["wallet"] = {
  connect: "Conectar billetera",
  connecting: "Conectando…",
  disconnect: "Desconectar billetera",
  pickerTitle: "Conecta una billetera",
  devnetHint: "Primero cambia tu billetera a Solana devnet.",
  noneFound: "No se ha encontrado ninguna billetera de Solana en este navegador.",
  getPhantom: "Instalar Phantom",
  detected: "Detectada",
  connectFirst: "Primero conecta una billetera.",
  cannotSign: "Esta billetera no puede firmar mensajes. Prueba con Phantom o Solflare.",
};

export default wallet;

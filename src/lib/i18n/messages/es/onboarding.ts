import type { Messages } from "../types";

const onboarding: Messages["onboarding"] = {
  title: "Crea tu empresa",
  createAnother: "Crear otra empresa",
  signedInAs: "Has iniciado sesión como <email>{email}</email>. Serás el propietario y podrás invitar a tu equipo más adelante.",
  companyName: "Nombre de la empresa",
  sampleData: {
    title: "Añadir el cliente y las facturas de la demo",
    body: "{customer} con una factura de {first} y otra de {second}, listas para la demo guiada. Tu empresa tendrá su propia billetera de prueba en devnet.",
  },
  wallet: {
    label: "Billetera de cobro",
    hint: "Aquí llegan los pagos y desde aquí se firman los reembolsos. Firmarás un mensaje para demostrar que es tuya; no se cobra nada. Puedes añadir más billeteras después.",
    didNotSign: "La billetera no ha firmado.",
  },
  settingUpWallet: "Configurando tu billetera…",
  waitingForWallet: "Esperando a tu billetera…",
  create: "Crear empresa",
  openExisting: "O abre una de las tuyas",
};

export default onboarding;

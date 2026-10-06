import type { Messages } from "../types";

const emails: Messages["emails"] = {
  signInCode: {
    subject: "{code} es tu código de PayFix",
    body: "Introduce {code} para continuar. Caduca en 10 minutos. Si no lo has solicitado, puedes ignorar este mensaje.",
  },
  resolutionLink: {
    subject: "Resolvamos los {amount} que pagaste de más",
    body: "Hola, {name}: hemos recibido {amount} más de lo que requería tu factura. Elige qué prefieres hacer con ese importe: aplicarlo a otra factura, mantenerlo como saldo a favor o que te lo reembolsemos. No se moverá nada hasta que ambas partes aprobemos exactamente el mismo plan.",
  },
  changesRequested: {
    subject: "{business} ha pedido un cambio en tu plan",
    body: "{business} ha revisado la versión {version} y te pide lo siguiente: «{note}». Abre tu enlace de resolución para enviar un plan revisado.",
  },
  memberAdded: {
    subject: "Te han añadido a {business} en PayFix",
    body: "{invitedBy} te ha añadido con el rol de {role}. Inicia sesión con esta dirección de correo para abrir el espacio de trabajo.",
  },
};

export default emails;

import type { Messages } from "../types";

const receipt: Messages["receipt"] = {
  title: "Comprobante de liquidación",
  saveAsPdf: "Guardar como PDF",
  private: {
    title: "Este comprobante es privado",
    body: "Inicia sesión como empresa o ábrelo desde tu enlace de resolución después de verificar tu correo.",
  },
  eyebrow: "Comprobante de liquidación",
  settled: "Liquidado",
  inProgress: "En curso",
  withCustomer: "y {customer}",
  withUnknownSender: "y un remitente sin identificar",
  resolvedAt: "Fecha de resolución: {date}",
  openedAt: "Fecha de apertura: {date}",
  everyDollarInvoice: "Cada dólar pagado por {invoice} ({amount})",
  everyDollar: "Cada dólar recibido",
  parts: {
    otherInvoices: "en otras facturas",
    credit: "saldo a favor",
    refunded: "reembolsado",
    refundPending: "reembolso pendiente",
    unresolved: "sin resolver",
  },
  incoming: "Pagos entrantes",
  incomingFrom: "de {address} · {date}",
  unknownAddress: "desconocida",
  agreedPlan: "Plan acordado · versión {version}",
  approvals: "Aprobaciones",
  approved: "v{version} aprobada",
  approvalVoided: "Aprobación de la v{version} anulada",
  approvedBy: "por {name} · {date}",
  noApprovals: "Aún no hay aprobaciones.",
  refund: "Reembolso",
  refundStatus: {
    awaiting_signature: "pendiente de la firma de la empresa",
    submitted: "enviado, pendiente de confirmación",
    confirmed: "confirmado",
    failed: "el último intento falló; los fondos siguen reservados",
  },
  refundLine: "{amount} · {status}",
  refundTo: "a {address}",
  refundToAt: "a {address} · {date}",
  notOnChain: "aún no está en la cadena",
  footnoteSimulated:
    "Los importes son unidades exactas del token {token} en una cadena simulada: dinero de prueba, no fondos de clientes. Este registro abarca las transferencias que PayFix detectó y los reembolsos que inició; no refleja los pagos realizados fuera de PayFix.",
  footnote:
    "Los importes son unidades exactas del token {token} en Solana {cluster}: dinero de prueba, no fondos de clientes. Este registro abarca las transferencias que PayFix detectó y los reembolsos que inició; no refleja los pagos realizados fuera de PayFix.",
};

export default receipt;

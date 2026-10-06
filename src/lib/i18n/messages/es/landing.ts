import type { Messages } from "../types";

const landing: Messages["landing"] = {
  nav: {
    howItWorks: "Cómo funciona",
    signIn: "Iniciar sesión",
    dashboard: "Panel",
  },
  hero: {
    simulatedChain: "Cadena simulada",
    cluster: "Solana {cluster}",
    tagline: "Resolución de pagos en USDC para agencias",
    titleLead: "Pagos erróneos,",
    titleAccent: "bien resueltos.",
    body: "Cuando un cliente paga de más, paga dos veces o envía USDC sin referencia, PayFix lo convierte en una liquidación acordada y completada, con un único enlace compartido en el que ambas partes pueden confiar.",
    tryDemo: "Prueba la demo en vivo",
    getStarted: "Empezar",
    seeHow: "Ver cómo funciona",
    signIn: "Iniciar sesión",
    testNote: "La demo usa un token de prueba claramente identificado, nunca fondos reales.",
    equation: "{received} recibidos = {invoice} + {applied} + {refunded}.",
  },
  how: {
    eyebrow: "El ciclo de resolución",
    title: "De «has enviado de más» a liquidado, en cuatro pasos.",
  },
  steps: {
    detect: {
      title: "Detectar",
      body: "Cada transferencia a tu billetera se verifica en Solana (mint, importe, destinatario y confirmación) y se vincula con su factura. Los sobrepagos, los duplicados y las transferencias sin referencia llegan a una única bandeja.",
    },
    propose: {
      title: "Proponer",
      body: "Tu cliente recibe un único enlace seguro y elige adónde va el excedente: otra factura, saldo a favor, un reembolso o un reparto. La titularidad de la billetera de reembolso se demuestra con una firma.",
    },
    approve: {
      title: "Aprobar",
      body: "Apruebas la versión exacta. Si cambia un importe, una factura o el destino, la aprobación queda anulada hasta que vuelvas a aprobar.",
    },
    settle: {
      title: "Liquidar",
      body: "Firmas el reembolso desde tu propia billetera. Se registran las asignaciones, el reembolso se confirma en la cadena y ambas partes reciben el mismo comprobante.",
    },
  },
  film: {
    eyebrow: "Míralo en acción",
    title: "Un sobrepago, de principio a fin.",
    note: "49 segundos · el escenario de la demo en vivo, con dinero de prueba",
  },
  controls: {
    eyebrow: "Pensado para el dinero",
    title: "Controles que aprobaría cualquier equipo de finanzas.",
    body: "Solana nos da pagos entrantes verificables y reembolsos firmados por el comercio. PayFix añade lo que hay entre medias: acuerdo, autorización y un libro mayor que siempre cuadra.",
  },
  guarantees: {
    neverDoubleCounted: {
      title: "Nada se cuenta dos veces",
      body: "Cada firma en la cadena se registra una sola vez. Ni las resincronizaciones, ni los reintentos, ni los reinicios pueden inflar lo que has recibido.",
    },
    hashBound: {
      title: "Aprobación ligada a un hash",
      body: "Las aprobaciones cubren importes, facturas y destino. Cualquier cambio crea una nueva versión que necesita su propia aprobación.",
    },
    oneRefund: {
      title: "Un solo reembolso en curso",
      body: "PayFix registra la firma del reembolso antes de difundirlo y solo permite reintentarlo si su blockhash caduca sin que haya llegado a la cadena.",
    },
    everyDollar: {
      title: "Cada dólar, explicado",
      body: "Un libro mayor de partida doble en unidades exactas del token. Lo recibido siempre es igual a lo aplicado + saldo a favor + reembolsado + pendiente + sin resolver.",
    },
  },
  heroDemo: {
    invoiceCount: { one: "{count} factura", other: "{count} facturas" },
    incomingTransfer: "Transferencia entrante",
    received: "{amount} recibidos",
    reconciled: "Conciliado",
    needsResolution: "{amount} por resolver",
    verifying: "Verificando…",
    refunded: "Reembolsado",
    unresolved: "Sin resolver",
    stages: {
      arrive: { title: "Llegan los pagos", note: "Dos transferencias verificadas en Solana" },
      excess: { title: "Factura liquidada, {amount} de más", note: "El excedente se señala, no se adivina" },
      propose: { title: "El cliente propone un reparto", note: "{applied} → {invoice} · {refund} de reembolso" },
      approve: { title: "La empresa aprueba la {version}", note: "Plan exacto, aprobación ligada al hash" },
      settled: { title: "Cada dólar tiene su sitio", note: "Reembolso confirmado · {amount} sin resolver" },
    },
  },
};

export default landing;

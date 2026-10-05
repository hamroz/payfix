import type { Messages } from "../types";

const events: Messages["events"] = {
  invoice: {
    created: "{number} creada para {customer}: {amount}",
    paid: "{number} está pagada por completo",
    overdue: "{number} está vencida: quedan {remaining} pendientes",
  },
  customer: {
    created: "Nuevo cliente: {name} ({email})",
    verified: "El cliente verificó su correo y abrió el enlace de resolución",
  },
  payment: {
    received: {
      settled: "{customer} pagó {amount} de {number}: factura liquidada",
      settledLate: "{customer} pagó {amount} de {number}: factura liquidada (con retraso)",
      partial: "{customer} pagó {amount} de {number}: quedan {remaining}",
      partialLate: "{customer} pagó {amount} de {number}: quedan {remaining} (con retraso)",
    },
  },
  transfer: {
    out: "{amount} enviados a {address}",
    unmatched: "Llegaron {amount} desde {address} sin referencia de factura",
  },
  case: {
    opened: {
      duplicate: "Posible duplicado: llegaron {amount} cuando {number} ya estaba liquidada",
      overpayment: "Hay que resolver {amount} que superan el saldo de {number}",
    },
    assigned: "Pago asignado a {customer}",
    resolved: {
      settled: "Incidencia resuelta: {amount} liquidados según lo acordado",
      refunded: "Incidencia resuelta: {amount} reembolsados",
    },
  },
  link: {
    sent: "Enlace de resolución enviado a {email}",
  },
  proposal: {
    submitted: {
      first: "El cliente propuso un plan (v{version}): {lines}",
      revised: "El cliente revisó el plan (v{version}): {changes}",
      unchanged: "El cliente revisó el plan (v{version}): sin cambios",
    },
    approved: "La empresa aprobó el plan v{version} ({shortHash})",
    declined: "La empresa pidió cambios en la v{version}: «{note}»",
  },
  approval: {
    invalidated: {
      changed: "La aprobación de la v{previous} ya no es válida: {changes}. La ejecución queda bloqueada hasta que se apruebe la v{version}.",
      resubmitted: "La aprobación de la v{previous} ya no es válida: el plan se volvió a enviar. La ejecución queda bloqueada hasta que se apruebe la v{version}.",
    },
  },
  plan: {
    executed: {
      refundReserved: "Asignaciones registradas. Reembolso de {amount} reservado, a la espera de la firma de la billetera de la empresa.",
      resolved: "Asignaciones registradas. Caso resuelto.",
    },
  },
  refund: {
    submitted: "La empresa firmó el reembolso de {amount} a {destination}",
    confirmed: "Reembolso de {amount} confirmado en la cadena. Caso resuelto.",
    failed: "La transacción de reembolso falló y no movió fondos. Se puede reintentar.",
    expired: "La transacción de reembolso caducó sin llegar a la cadena. No se movieron fondos; se puede volver a firmar sin riesgo.",
  },
  credit: {
    applied: "{amount} de saldo a favor del cliente aplicados a {number}",
  },
  member: {
    added: "{email} se unió como {role}",
    roleChanged: "{email} ahora tiene el rol {role}",
    removed: "{email} ya no forma parte del equipo",
  },
  wallet: {
    added: "Billetera de cobro añadida: {label} ({address})",
    activated: "Los nuevos pagos llegan ahora a {label} ({address})",
    removed: "Billetera de cobro eliminada: {label} ({address})",
  },

  // Stand-ins when a name is unknown
  fallbacks: {
    customer: "El cliente",
    member: "Un miembro",
    invoice: "una factura",
  },

  // One line of a plan ({lines} above), joined with `separator`
  planLines: {
    invoice: "{amount} a {number}",
    credit: "{amount} como saldo a favor",
    refund: "{amount} reembolsados",
    separator: ", ",
  },

  // What changed between two versions of a plan ({changes} above), joined with `separator`
  changes: {
    allocationAdded: "Asignación a {number} añadida: {amount}",
    allocationRemoved: "Asignación a {number} eliminada (era de {amount})",
    allocationChanged: "Asignación a {number} cambiada de {from} a {to}",
    creditAdded: "Saldo a favor añadido: {amount}",
    creditRemoved: "Saldo a favor eliminado (era de {amount})",
    creditChanged: "Saldo a favor cambiado de {from} a {to}",
    refundAdded: "Reembolso añadido: {amount}",
    refundRemoved: "Reembolso eliminado (era de {amount})",
    refundChanged: "Reembolso cambiado de {from} a {to}",
    destinationChanged: "Destino del reembolso cambiado de {from} a {to}",
    destinationSet: "Destino del reembolso fijado en {to}",
    destinationRemoved: "Destino del reembolso eliminado",
    separator: "; ",
  },

  // Ledger journal-entry memos
  memos: {
    received: "Recibido: {amount}",
    applied: "Aplicado a {number}",
    creditApplied: "Saldo a favor aplicado a {number}",
    refundConfirmed: "Reembolso de {amount} confirmado",
    plan: "Plan v{version}: {lines}",
  },

  // Why an approval no longer applies
  approvalReasons: {
    superseded: "Sustituida por la v{version}: {changes}",
    resubmitted: "Sustituida por la v{version}: plan reenviado",
    changesRequested: "La empresa pidió cambios: {note}",
  },
};

export default events;

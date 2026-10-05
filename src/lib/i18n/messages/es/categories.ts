import type { Messages } from "../types";

const categories: Messages["categories"] = {
  payments: { label: "Pagos", description: "Pagos entrantes, transferencias sin referencia y dinero que sale de tu billetera." },
  exceptions: { label: "Incidencias", description: "Sobrepagos y duplicados que requieren una decisión, y su resolución." },
  resolutions: { label: "Resoluciones", description: "Enlaces de resolución, propuestas de clientes, aprobaciones y planes ejecutados." },
  refunds: { label: "Reembolsos", description: "Reembolsos firmados, confirmados en la cadena, fallidos o caducados." },
  invoices: { label: "Facturas", description: "Facturas nuevas, facturas pagadas por completo o vencidas, y saldo a favor aplicado." },
  customers: { label: "Clientes", description: "Clientes nuevos añadidos a esta empresa." },
  team: { label: "Equipo y billeteras", description: "Altas, cambios de rol y bajas en el equipo, y cambios en las billeteras de cobro." },
};

export default categories;

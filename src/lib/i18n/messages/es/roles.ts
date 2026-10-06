import type { Messages } from "../types";

const roles: Messages["roles"] = {
  owner: { label: "Propietario", description: "Todo, además del equipo, las billeteras y los ajustes del espacio de trabajo" },
  editor: { label: "Editor", description: "Facturas, clientes, aprobaciones y reembolsos" },
  viewer: { label: "Lector", description: "Acceso de solo lectura y exportaciones" },
};

export default roles;

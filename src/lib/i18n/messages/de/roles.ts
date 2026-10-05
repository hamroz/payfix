import type { Messages } from "../types";

const roles: Messages["roles"] = {
  owner: { label: "Inhaber", description: "Alles, dazu Team, Wallets und Workspace-Einstellungen" },
  editor: { label: "Bearbeiter", description: "Rechnungen, Kunden, Freigaben und Rückerstattungen" },
  viewer: { label: "Betrachter", description: "Nur Lesezugriff und Exporte" },
};

export default roles;

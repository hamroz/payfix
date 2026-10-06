import type { Messages } from "../types";

const categories: Messages["categories"] = {
  payments: { label: "Zahlungen", description: "Eingehende Zahlungen, Transfers ohne Referenz und Geld, das Ihr Wallet verlässt." },
  exceptions: { label: "Abweichungen", description: "Überzahlungen und Doppelzahlungen, die eine Entscheidung brauchen – und ihre Klärung." },
  resolutions: { label: "Klärungen", description: "Klärungslinks, Pläne von Kunden, Freigaben und ausgeführte Pläne." },
  refunds: { label: "Rückerstattungen", description: "Rückerstattungen, die signiert, on-chain bestätigt, fehlgeschlagen oder abgelaufen sind." },
  invoices: { label: "Rechnungen", description: "Neue Rechnungen, vollständig bezahlte oder überfällige Rechnungen und verrechnetes Guthaben." },
  customers: { label: "Kunden", description: "Neue Kunden in diesem Unternehmen." },
  team: { label: "Team und Wallets", description: "Neue Mitglieder, Rollenwechsel und Austritte sowie Änderungen an Empfangs-Wallets." },
};

export default categories;

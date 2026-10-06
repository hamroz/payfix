// Team roles (see src/lib/roles.ts). Keys match the `Role` type.
const roles = {
  owner: { label: "Owner", description: "Everything, plus team, wallets, and workspace settings" },
  editor: { label: "Editor", description: "Invoices, customers, approvals, and refunds" },
  viewer: { label: "Viewer", description: "Read-only access and exports" },
};

export default roles;

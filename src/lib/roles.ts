import type { Role } from "@/lib/db/schema";

export type { Role };

const RANK: Record<Role, number> = { viewer: 0, editor: 1, owner: 2 };

/** True when `role` is at least `min`. Owners can do everything editors can, editors everything viewers can. */
export const can = (role: Role | null | undefined, min: Role) => role !== null && role !== undefined && RANK[role] >= RANK[min];

export const ROLES: { role: Role; label: string; description: string }[] = [
  { role: "owner", label: "Owner", description: "Everything, plus team, wallets, and workspace settings" },
  { role: "editor", label: "Editor", description: "Invoices, customers, approvals, and refunds" },
  { role: "viewer", label: "Viewer", description: "Read-only access and exports" },
];

export const roleLabel = (role: Role) => ROLES.find((r) => r.role === role)!.label;

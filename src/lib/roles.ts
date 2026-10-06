import type { Role } from "@/lib/db/schema";

export type { Role };

const RANK: Record<Role, number> = { viewer: 0, editor: 1, owner: 2 };

/** True when `role` is at least `min`. Owners can do everything editors can, editors everything viewers can. */
export const can = (role: Role | null | undefined, min: Role) => role !== null && role !== undefined && RANK[role] >= RANK[min];

/** Every role, most powerful first. Labels and descriptions are in the dictionary (`m.roles[role]`). */
export const ROLES: { role: Role }[] = [{ role: "owner" }, { role: "editor" }, { role: "viewer" }];

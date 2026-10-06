/**
 * Notification categories: the toggles a member sees in Settings, and which activity-log
 * event types each one covers. An event type in no category is never a notification.
 * Labels and descriptions are in the dictionary (`m.categories[id]`).
 */
export const CATEGORIES = [
  {
    id: "payments",
    types: ["payment.received", "transfer.unmatched", "transfer.out"],
  },
  {
    id: "exceptions",
    types: ["case.opened", "case.assigned", "case.resolved"],
  },
  {
    id: "resolutions",
    types: ["link.sent", "customer.verified", "proposal.submitted", "proposal.approved", "proposal.declined", "approval.invalidated", "plan.executed"],
  },
  {
    id: "refunds",
    types: ["refund.submitted", "refund.confirmed", "refund.failed", "refund.expired"],
  },
  {
    id: "invoices",
    types: ["invoice.created", "invoice.paid", "invoice.overdue", "credit.applied"],
  },
  {
    id: "customers",
    types: ["customer.created"],
  },
  {
    id: "team",
    types: ["member.added", "member.role_changed", "member.removed", "wallet.added", "wallet.activated", "wallet.removed"],
  },
] as const satisfies readonly { id: string; types: readonly string[] }[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];

const byType = new Map<string, CategoryId>(CATEGORIES.flatMap((c) => c.types.map((t) => [t, c.id] as const)));

export function categoryOf(type: string): CategoryId | null {
  return byType.get(type) ?? null;
}

export function isCategoryId(v: string): v is CategoryId {
  return CATEGORIES.some((c) => c.id === v);
}

/** Event types a member receives, given the categories they muted. */
export function enabledTypes(muted: readonly string[]): string[] {
  return CATEGORIES.filter((c) => !muted.includes(c.id)).flatMap((c) => [...c.types]);
}

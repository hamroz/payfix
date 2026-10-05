/**
 * Notification categories: the toggles a member sees in Settings, and which activity-log
 * event types each one covers. An event type in no category is never a notification.
 */
export const CATEGORIES = [
  {
    id: "payments",
    label: "Payments",
    description: "Incoming payments, transfers without a reference, and money leaving your wallet.",
    types: ["payment.received", "transfer.unmatched", "transfer.out"],
  },
  {
    id: "exceptions",
    label: "Exceptions",
    description: "Overpayments and duplicates that need a decision, and when they're resolved.",
    types: ["case.opened", "case.assigned", "case.resolved"],
  },
  {
    id: "resolutions",
    label: "Resolutions",
    description: "Resolution links, customer proposals, approvals, and executed plans.",
    types: ["link.sent", "customer.verified", "proposal.submitted", "proposal.approved", "proposal.declined", "approval.invalidated", "plan.executed"],
  },
  {
    id: "refunds",
    label: "Refunds",
    description: "Refunds signed, confirmed on chain, failed, or expired.",
    types: ["refund.submitted", "refund.confirmed", "refund.failed", "refund.expired"],
  },
  {
    id: "invoices",
    label: "Invoices",
    description: "New invoices, invoices paid in full or overdue, and credit applied.",
    types: ["invoice.created", "invoice.paid", "invoice.overdue", "credit.applied"],
  },
  {
    id: "customers",
    label: "Customers",
    description: "New customers added to this company.",
    types: ["customer.created"],
  },
  {
    id: "team",
    label: "Team and wallets",
    description: "People joining, changing role, or leaving, and receiving wallet changes.",
    types: ["member.added", "member.role_changed", "member.removed", "wallet.added", "wallet.activated", "wallet.removed"],
  },
] as const satisfies readonly { id: string; label: string; description: string; types: readonly string[] }[];

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

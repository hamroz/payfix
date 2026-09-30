import type { CaseKind, CaseStatus } from "@/lib/db/schema";
import { Badge } from "@/components/ui/primitives";

export const caseKindLabel: Record<CaseKind, string> = {
  overpayment: "Overpayment",
  duplicate: "Apparent duplicate",
  unmatched: "Unmatched transfer",
};

const statusMeta: Record<CaseStatus, { label: string; tone: "amber" | "violet" | "indigo" | "cyan" | "mint"; pulse?: boolean }> = {
  open: { label: "Needs a plan", tone: "amber", pulse: true },
  proposed: { label: "Awaiting your approval", tone: "violet", pulse: true },
  approved: { label: "Approved · ready to run", tone: "indigo" },
  executing: { label: "Refund in progress", tone: "cyan", pulse: true },
  resolved: { label: "Resolved", tone: "mint" },
};

export function CaseStatusBadge({ status, customerView = false }: { status: CaseStatus; customerView?: boolean }) {
  const m = statusMeta[status];
  const label = customerView && status === "proposed" ? "Waiting for the business" : customerView && status === "open" ? "Your choice needed" : m.label;
  return (
    <Badge tone={m.tone} pulse={m.pulse}>
      {label}
    </Badge>
  );
}

export function InvoiceStatusBadge({ status }: { status: "paid" | "partial" | "overdue" | "open" }) {
  const m = {
    paid: { label: "Paid", tone: "mint" as const },
    partial: { label: "Partially paid", tone: "cyan" as const },
    overdue: { label: "Overdue", tone: "rose" as const },
    open: { label: "Open", tone: "neutral" as const },
  }[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

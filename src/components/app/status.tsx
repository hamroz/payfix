"use client";

import type { CaseStatus } from "@/lib/db/schema";
import { Badge } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/client";

const statusMeta: Record<CaseStatus, { tone: "amber" | "violet" | "indigo" | "cyan" | "mint"; pulse?: boolean }> = {
  open: { tone: "amber", pulse: true },
  proposed: { tone: "violet", pulse: true },
  approved: { tone: "indigo" },
  executing: { tone: "cyan", pulse: true },
  resolved: { tone: "mint" },
};

export function CaseStatusBadge({ status, customerView = false }: { status: CaseStatus; customerView?: boolean }) {
  const { m } = useI18n();
  const meta = statusMeta[status];
  const label = customerView && (status === "proposed" || status === "open") ? m.cases.customerStatus[status] : m.cases.status[status];
  return (
    <Badge tone={meta.tone} pulse={meta.pulse}>
      {label}
    </Badge>
  );
}

export function InvoiceStatusBadge({ status }: { status: "paid" | "partial" | "overdue" | "open" }) {
  const { m } = useI18n();
  const tone = ({ paid: "mint", partial: "cyan", overdue: "rose", open: "neutral" } as const)[status];
  return <Badge tone={tone}>{m.cases.invoiceStatus[status]}</Badge>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, FileText } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/app/status";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { formatUsd } from "@/lib/money";
import { deps, requireWorkspace } from "@/lib/server/context";
import { can } from "@/lib/roles";
import { invoiceList } from "@/lib/server/views";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.invoices.list.title };
}

export default async function InvoicesPage() {
  const { biz, role } = await requireWorkspace();
  const { db } = await deps();
  const rows = await invoiceList(db, biz.id);
  const { m, t, date } = await getI18n();
  const l = m.invoices.list;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={l.eyebrow}
        title={l.heading}
        subtitle={l.subtitle}
        actions={
          can(role, "editor") && (
            <ButtonLink href="/app/invoices/new">
              <FilePlus2 className="size-4" /> {l.newInvoice}
            </ButtonLink>
          )
        }
      />
      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={<FileText className="size-5" />} title={l.emptyTitle} body={l.emptyBody} action={<ButtonLink href="/app/invoices/new">{l.newInvoice}</ButtonLink>} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_140px_150px_120px] gap-4 border-b border-veil/[0.06] px-5 py-3 text-xs text-fg-3 md:grid">
            <span>{l.columns.invoice}</span>
            <span>{l.columns.status}</span>
            <span>{l.columns.paid}</span>
            <span className="text-right">{l.columns.amount}</span>
          </div>
          <Stagger className="divide-y divide-veil/[0.05]">
            {rows.map((i) => {
              const pct = Number((BigInt(i.applied) * 100n) / (BigInt(i.amount) || 1n));
              return (
                <StaggerItem key={i.id}>
                  <Link href={`/app/invoices/${i.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 transition hover:bg-veil/[0.03] md:grid-cols-[1fr_140px_150px_120px] md:gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">{i.title}</p>
                      <p className="mt-0.5 truncate text-xs text-fg-3">
                        <span className="font-mono">{i.number}</span> · {i.customerName} · {t(l.due, { date: date(i.dueAt) })}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <InvoiceStatusBadge status={i.status} />
                    </div>
                    <div className="hidden md:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-veil/[0.06]">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#6366F1,#5EF2C2)]" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="tabular mt-1.5 text-xs text-fg-3">{t(l.applied, { amount: formatUsd(BigInt(i.applied)) })}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular font-display text-sm font-semibold">{formatUsd(BigInt(i.amount))}</p>
                      <div className="mt-1 md:hidden">
                        <InvoiceStatusBadge status={i.status} />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Card>
      )}
    </div>
  );
}

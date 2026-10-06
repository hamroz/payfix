import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleCheckBig, Clock, Copy, HelpCircle, Layers } from "lucide-react";
import { CaseStatusBadge } from "@/components/app/status";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { formatUsd } from "@/lib/money";
import { deps, requireBusiness } from "@/lib/server/context";
import { caseRows, latePayments } from "@/lib/server/views";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.cases.list.title };
}

const kindIcon = { overpayment: Layers, duplicate: Copy, unmatched: HelpCircle };

export default async function ExceptionsPage() {
  const biz = await requireBusiness();
  const { m, t, p, timeAgo } = await getI18n();
  const L = m.cases.list;
  const { db } = await deps();
  const rows = await caseRows(db, biz.id);
  const late = await latePayments(db, biz.id);
  const open = rows.filter((r) => r.status !== "resolved");
  const done = rows.filter((r) => r.status === "resolved");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={L.eyebrow}
        title={L.heading}
        subtitle={L.subtitle}
      />
      {late.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{t(L.latePayments, { count: late.length })}</h2>
          <div className="space-y-2.5">
            {late.map((l) => (
              <Link key={l.id} href={`/app/invoices/${l.invoiceId}`} className="glass group flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:border-veil/15 sm:px-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose/10 text-rose">
                  <Clock className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p(L.paidLate, l.daysLate)}</p>
                  <p className="mt-1 truncate text-xs text-fg-3">
                    {t(L.lateMeta, { customer: l.customerName ?? m.common.customer, invoice: l.invoiceNumber, when: timeAgo(l.receivedAt) })}
                  </p>
                </div>
                <span className="tabular font-display text-base font-semibold">{formatUsd(BigInt(l.amount))}</span>
                <ArrowUpRight className="hidden size-4 text-fg-3 transition group-hover:text-fg sm:block" />
              </Link>
            ))}
          </div>
        </section>
      )}
      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={<CircleCheckBig className="size-5 text-mint" />} title={L.emptyTitle} body={L.emptyBody} />
        </Card>
      ) : (
        <div className="space-y-8">
          {[
            { key: "open", title: L.openGroup, list: open },
            { key: "resolved", title: L.resolvedGroup, list: done },
          ]
            .filter((g) => g.list.length)
            .map((g) => (
              <section key={g.key}>
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{t(g.title, { count: g.list.length })}</h2>
                <Stagger className="space-y-2.5">
                  {g.list.map((c) => {
                    const Icon = kindIcon[c.kind];
                    return (
                      <StaggerItem key={c.id}>
                        <Link href={`/app/exceptions/${c.id}`} className="glass group flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:border-veil/15 sm:px-5">
                          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${c.status === "resolved" ? "bg-mint/10 text-mint" : "bg-amber/10 text-amber"}`}>
                            <Icon className="size-[18px]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">{m.cases.kind[c.kind]}</span>
                              <CaseStatusBadge status={c.status} />
                            </div>
                            <p className="mt-1 truncate text-xs text-fg-3">
                              {c.invoiceNumber
                                ? t(L.rowMetaInvoice, { customer: c.customerName ?? L.unknownSender, invoice: c.invoiceNumber, when: timeAgo(c.createdAt) })
                                : t(L.rowMeta, { customer: c.customerName ?? L.unknownSender, when: timeAgo(c.createdAt) })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`tabular font-display text-base font-semibold ${c.status === "resolved" ? "text-fg-2" : "text-amber"}`}>
                              {formatUsd(BigInt(c.status === "resolved" ? c.original : c.available))}
                            </p>
                            <p className="text-[11px] text-fg-3">{c.status === "resolved" ? L.amountResolved : L.amountUnresolved}</p>
                          </div>
                          <ArrowUpRight className="hidden size-4 text-fg-3 transition group-hover:text-fg sm:block" />
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleCheckBig, Clock, Copy, HelpCircle, Layers } from "lucide-react";
import { CaseStatusBadge, caseKindLabel } from "@/components/app/status";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { formatUsd } from "@/lib/money";
import { timeAgo } from "@/lib/format";
import { deps, requireBusiness } from "@/lib/server/context";
import { caseRows, latePayments } from "@/lib/server/views";

export const metadata: Metadata = { title: "Exceptions" };

const kindIcon = { overpayment: Layers, duplicate: Copy, unmatched: HelpCircle };

export default async function ExceptionsPage() {
  const biz = await requireBusiness();
  const { db } = await deps();
  const rows = await caseRows(db, biz.id);
  const late = await latePayments(db, biz.id);
  const open = rows.filter((r) => r.status !== "resolved");
  const done = rows.filter((r) => r.status === "resolved");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Exception inbox"
        title="Payments that need a decision"
        subtitle="Overpayments, apparent duplicates, and transfers without an invoice reference. Nothing here moves until your customer proposes a plan and you approve it."
      />
      {late.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">Late payments · {late.length}</h2>
          <div className="space-y-2.5">
            {late.map((l) => (
              <Link key={l.id} href={`/app/invoices/${l.invoiceId}`} className="glass group flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:border-veil/15 sm:px-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose/10 text-rose">
                  <Clock className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    Paid {l.daysLate} day{l.daysLate === 1 ? "" : "s"} after the due date
                  </p>
                  <p className="mt-1 truncate text-xs text-fg-3">
                    {l.customerName ?? "Customer"} · {l.invoiceNumber} · {timeAgo(l.receivedAt)} · applied normally, no action needed
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
          <EmptyState icon={<CircleCheckBig className="size-5 text-mint" />} title="No exceptions" body="When a payment doesn’t match an invoice exactly, it shows up here." />
        </Card>
      ) : (
        <div className="space-y-8">
          {[
            { title: "Open", list: open },
            { title: "Resolved", list: done },
          ]
            .filter((g) => g.list.length)
            .map((g) => (
              <section key={g.title}>
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">
                  {g.title} · {g.list.length}
                </h2>
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
                              <span className="text-sm font-medium">{caseKindLabel[c.kind]}</span>
                              <CaseStatusBadge status={c.status} />
                            </div>
                            <p className="mt-1 truncate text-xs text-fg-3">
                              {c.customerName ?? "Sender not identified"}
                              {c.invoiceNumber ? ` · ${c.invoiceNumber}` : ""} · opened {timeAgo(c.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`tabular font-display text-base font-semibold ${c.status === "resolved" ? "text-fg-2" : "text-amber"}`}>
                              {formatUsd(BigInt(c.status === "resolved" ? c.original : c.available))}
                            </p>
                            <p className="text-[11px] text-fg-3">{c.status === "resolved" ? "resolved" : "unresolved"}</p>
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

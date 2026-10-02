import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleCheckBig, FilePlus2, Inbox } from "lucide-react";
import { ActivityFeed } from "@/components/app/activity";
import { GuidedDemo } from "@/components/app/guided-demo";
import { Equation, ReconBar } from "@/components/app/recon-bar";
import { CaseStatusBadge, InvoiceStatusBadge, caseKindLabel } from "@/components/app/status";
import { AnimatedAmount, FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { ButtonLink, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/primitives";
import { env } from "@/lib/env";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/cn";
import { deps, requireWorkspace } from "@/lib/server/context";
import { can } from "@/lib/roles";
import { dashboardView } from "@/lib/server/views";
import { amountFit, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

export default async function Dashboard() {
  const { biz, role } = await requireWorkspace();
  const { db } = await deps();
  const v = await dashboardView(db, biz.id);
  const b = v.balances;
  const refunds = (BigInt(b.refunded) + BigInt(b.refundPending)).toString();
  const unresolved = BigInt(b.unresolved);

  const stats = [
    { label: "Received", units: b.received, note: "Verified on chain", tone: "text-fg" },
    { label: "Applied to invoices", units: b.invoice, note: "Settled against invoices", tone: "text-fg" },
    { label: "Needs resolution", units: b.unresolved, note: unresolved > 0n ? `${v.open.length} open exception${v.open.length === 1 ? "" : "s"}` : "Nothing waiting", tone: unresolved > 0n ? "text-amber" : "text-mint" },
    { label: "Refunds", units: refunds, note: BigInt(b.refundPending) > 0n ? `${formatUsd(BigInt(b.refundPending))} pending` : "All confirmed", tone: "text-fg" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${biz.name.split(" ")[0]}`}
        subtitle="Every payment that reached your wallet, and where each dollar ended up."
        actions={
          <>
            <ButtonLink href="/app/exceptions" variant="secondary">
              <Inbox className="size-4" /> Exceptions
            </ButtonLink>
            {can(role, "editor") && (
              <ButtonLink href="/app/invoices/new">
                <FilePlus2 className="size-4" /> New invoice
              </ButtonLink>
            )}
          </>
        }
      />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Card className="@container h-full min-w-0 overflow-hidden p-4 sm:p-5" title={formatUsd(BigInt(s.units))}>
              <p className="text-xs text-fg-3">{s.label}</p>
              <AnimatedAmount units={s.units} className={cn("tabular mt-2 block whitespace-nowrap font-display font-semibold tracking-tight", s.tone)} style={amountFit(s.units, 1.625)} />
              <p className="mt-1 text-xs text-fg-3">{s.note}</p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-[1.45fr_1fr] lg:gap-5">
        <div className="flex flex-col gap-4 lg:gap-5">
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader title="Where every dollar went" subtitle="Double-entry ledger in exact token units" />
              <div className="px-5 pb-5 pt-4">
                <ReconBar
                  segments={[
                    { key: "inv", label: "Applied to invoices", units: b.invoice, tone: "indigo" },
                    { key: "credit", label: "Customer credit", units: b.credit, tone: "violet" },
                    { key: "refunded", label: "Refunded", units: b.refunded, tone: "mint" },
                    { key: "pending", label: "Refund pending", units: b.refundPending, tone: "cyan" },
                    { key: "unres", label: "Unresolved", units: b.unresolved, tone: "amber" },
                  ]}
                />
                <div className="mt-5 rounded-xl border border-veil/[0.06] bg-ink-950/40 p-3">
                  <Equation
                    received={b.received}
                    parts={[
                      { label: "invoices", units: b.invoice, tone: "indigo" },
                      { label: "credit", units: b.credit, tone: "violet" },
                      { label: "refunded", units: b.refunded, tone: "mint" },
                      { label: "pending", units: b.refundPending, tone: "cyan" },
                      { label: "unresolved", units: b.unresolved, tone: "amber" },
                    ]}
                  />
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card>
              <CardHeader
                title="Needs attention"
                subtitle="Payments that didn’t match an invoice exactly"
                action={
                  <Link href="/app/exceptions" className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-fg">
                    All <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
              {v.open.length === 0 ? (
                <EmptyState icon={<CircleCheckBig className="size-5 text-mint" />} title="All clear" body="Every payment is matched, applied, or resolved." />
              ) : (
                <div className="mt-3 divide-y divide-veil/[0.05] pb-2">
                  {v.open.map((c) => (
                    <Link key={c.id} href={`/app/exceptions/${c.id}`} className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-veil/[0.03]">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-fg">{caseKindLabel[c.kind]}</span>
                          <CaseStatusBadge status={c.status} />
                        </div>
                        <p className="mt-1 truncate text-xs text-fg-3">
                          {c.customerName ?? "Unknown sender"}
                          {c.invoiceNumber ? ` · ${c.invoiceNumber}` : ""} · {timeAgo(c.createdAt)}
                        </p>
                      </div>
                      <span className="tabular font-display text-base font-semibold text-amber">{formatUsd(BigInt(c.available))}</span>
                      <ArrowUpRight className="size-4 text-fg-3 transition group-hover:text-fg" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card>
              <CardHeader
                title="Invoices"
                action={
                  <Link href="/app/invoices" className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-fg">
                    All <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
              <div className="mt-3 divide-y divide-veil/[0.05] pb-2">
                {v.invoices.map((i) => (
                  <Link key={i.id} href={`/app/invoices/${i.id}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-veil/[0.03]">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fg">
                        <span className="font-mono text-xs text-fg-3">{i.number}</span> · {i.title}
                      </p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-veil/[0.06]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#6366F1,#5EF2C2)]"
                          style={{ width: `${Number((BigInt(i.applied) * 100n) / (BigInt(i.amount) || 1n))}%` }}
                        />
                      </div>
                    </div>
                    <InvoiceStatusBadge status={i.status} />
                    <span className="tabular w-24 text-right font-display text-sm font-semibold">{formatUsd(BigInt(i.amount))}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </FadeIn>
        </div>

        <div className="flex flex-col gap-4 lg:gap-5">
          {env().DEMO_MODE && (
            <FadeIn delay={0.12}>
              <GuidedDemo state={v.demo} />
            </FadeIn>
          )}
          <FadeIn delay={0.18}>
            <Card>
              <CardHeader title="Activity" subtitle="Updates live as the chain confirms" />
              <ActivityFeed events={v.activity} />
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

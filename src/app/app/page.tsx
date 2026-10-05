import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleCheckBig, FilePlus2, Inbox } from "lucide-react";
import { ActivityFeed } from "@/components/app/activity";
import { GuidedDemo } from "@/components/app/guided-demo";
import { Equation, ReconBar } from "@/components/app/recon-bar";
import { CaseStatusBadge, InvoiceStatusBadge } from "@/components/app/status";
import { AnimatedAmount, FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { ButtonLink, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/primitives";
import { env } from "@/lib/env";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/cn";
import { deps, requireWorkspace } from "@/lib/server/context";
import { can } from "@/lib/roles";
import { dashboardView } from "@/lib/server/views";
import { amountFit } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.app.overview.title };
}

export default async function Dashboard() {
  const { biz, role } = await requireWorkspace();
  const { db } = await deps();
  const v = await dashboardView(db, biz.id);
  const { m, t, p, timeAgo } = await getI18n();
  const o = m.app.overview;
  const eq = m.app.equation;
  const b = v.balances;
  const refunds = (BigInt(b.refunded) + BigInt(b.refundPending)).toString();
  const unresolved = BigInt(b.unresolved);

  const stats = [
    { label: o.stats.received, units: b.received, note: o.stats.receivedNote, tone: "text-fg" },
    { label: o.stats.applied, units: b.invoice, note: o.stats.appliedNote, tone: "text-fg" },
    { label: o.stats.unresolved, units: b.unresolved, note: unresolved > 0n ? p(o.stats.openExceptions, v.open.length) : o.stats.nothingWaiting, tone: unresolved > 0n ? "text-amber" : "text-mint" },
    { label: o.stats.refunds, units: refunds, note: BigInt(b.refundPending) > 0n ? t(o.stats.refundsPending, { amount: formatUsd(BigInt(b.refundPending)) }) : o.stats.allConfirmed, tone: "text-fg" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow={o.eyebrow}
        title={t(o.greeting, { name: biz.name.split(" ")[0] })}
        subtitle={o.subtitle}
        actions={
          <>
            <ButtonLink href="/app/exceptions" variant="secondary">
              <Inbox className="size-4" /> {o.exceptions}
            </ButtonLink>
            {can(role, "editor") && (
              <ButtonLink href="/app/invoices/new">
                <FilePlus2 className="size-4" /> {o.newInvoice}
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

      <div className="mt-4 grid gap-4 *:min-w-0 lg:mt-5 lg:grid-cols-[1.45fr_1fr] lg:gap-5">
        <div className="flex flex-col gap-4 lg:gap-5">
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader title={o.where.title} subtitle={o.where.subtitle} />
              <div className="px-5 pb-5 pt-4">
                <ReconBar
                  segments={[
                    { key: "inv", label: o.segments.applied, units: b.invoice, tone: "indigo" },
                    { key: "credit", label: o.segments.credit, units: b.credit, tone: "violet" },
                    { key: "refunded", label: o.segments.refunded, units: b.refunded, tone: "mint" },
                    { key: "pending", label: o.segments.pending, units: b.refundPending, tone: "cyan" },
                    { key: "unres", label: o.segments.unresolved, units: b.unresolved, tone: "amber" },
                  ]}
                />
                <div className="mt-5 rounded-xl border border-veil/[0.06] bg-ink-950/40 p-3">
                  <Equation
                    received={b.received}
                    parts={[
                      { label: eq.invoices, units: b.invoice, tone: "indigo" },
                      { label: eq.credit, units: b.credit, tone: "violet" },
                      { label: eq.refunded, units: b.refunded, tone: "mint" },
                      { label: eq.pending, units: b.refundPending, tone: "cyan" },
                      { label: eq.unresolved, units: b.unresolved, tone: "amber" },
                    ]}
                  />
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card>
              <CardHeader
                title={o.attention.title}
                subtitle={o.attention.subtitle}
                action={
                  <Link href="/app/exceptions" className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-fg">
                    {o.all} <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
              {v.open.length === 0 ? (
                <EmptyState icon={<CircleCheckBig className="size-5 text-mint" />} title={o.attention.clearTitle} body={o.attention.clearBody} />
              ) : (
                <div className="mt-3 divide-y divide-veil/[0.05] pb-2">
                  {v.open.map((c) => (
                    <Link key={c.id} href={`/app/exceptions/${c.id}`} className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-veil/[0.03]">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-fg">{m.cases.kind[c.kind]}</span>
                          <CaseStatusBadge status={c.status} />
                        </div>
                        <p className="mt-1 truncate text-xs text-fg-3">
                          {c.customerName ?? o.attention.unknownSender}
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
                title={o.invoices}
                action={
                  <Link href="/app/invoices" className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-fg">
                    {o.all} <ArrowRight className="size-3.5" />
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
              <CardHeader title={o.activity.title} subtitle={o.activity.subtitle} />
              <ActivityFeed events={v.activity} />
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, ExternalLink, Shuffle } from "lucide-react";
import { ActivityFeed } from "@/components/app/activity";
import { CaseStatusBadge, InvoiceStatusBadge } from "@/components/app/status";
import { AnimatedAmount, FadeIn } from "@/components/ui/motion";
import { CopyButton } from "@/components/ui/interactive";
import { ButtonLink, Card, CardHeader, Mono } from "@/components/ui/primitives";
import { env, publicConfig } from "@/lib/env";
import { amountFit } from "@/lib/format";
import { renderMemo } from "@/lib/i18n/english";
import { getI18n } from "@/lib/i18n/server";
import { formatUsd } from "@/lib/money";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";
import { deps, requireWorkspace } from "@/lib/server/context";
import { can } from "@/lib/roles";
import { ApplyCredit } from "./apply-credit";
import { invoiceDetail } from "@/lib/server/views";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.invoices.detail.title };
}

export default async function InvoicePage({ params }: PageProps<"/app/invoices/[id]">) {
  const { id } = await params;
  const { biz, role } = await requireWorkspace();
  const { db } = await deps();
  const d = await invoiceDetail(db, biz.id, id);
  if (!d) notFound();
  const config = publicConfig();
  const payUrl = `${env().APP_URL}/pay/${d.invoice.id}`;
  const i = d.invoice;
  const i18n = await getI18n();
  const { m, t, date, dateTime } = i18n;
  const x = m.invoices.detail;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/app/invoices" className="mb-5 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-fg">
        <ArrowLeft className="size-4" /> {x.back}
      </Link>
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Mono>{i.number}</Mono>
              <InvoiceStatusBadge status={i.status} />
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[28px]">{i.title}</h1>
            <p className="mt-1 text-sm text-fg-2">
              {d.customer.name} · {d.customer.email} · {t(x.due, { date: date(i.dueAt) })}
            </p>
          </div>
          <ButtonLink href={`/pay/${i.id}`} target="_blank" variant="secondary">
            {x.openPaymentPage} <ArrowUpRight className="size-4" />
          </ButtonLink>
        </div>
      </FadeIn>

      <div className="mt-6 grid gap-5 *:min-w-0 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <FadeIn delay={0.05}>
            <Card className="grid grid-cols-3 divide-x divide-veil/[0.06] overflow-hidden">
              {[
                { label: x.amount, v: i.amount },
                { label: x.applied, v: i.applied },
                { label: x.remaining, v: i.remaining },
              ].map((s) => (
                <div key={s.label} className="@container min-w-0 p-4 sm:p-5" title={formatUsd(BigInt(s.v))}>
                  <p className="text-xs text-fg-3">{s.label}</p>
                  <AnimatedAmount units={s.v} className="tabular mt-1.5 block whitespace-nowrap font-display font-semibold" style={amountFit(s.v, 1.5)} />
                </div>
              ))}
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader title={x.payments.title} subtitle={x.payments.subtitle} />
              <div className="space-y-2 p-5">
                {d.transfers.length === 0 && d.allocations.length === 0 && <p className="rounded-xl border border-dashed border-veil/10 px-4 py-6 text-center text-sm text-fg-3">{x.payments.empty}</p>}
                {d.transfers.map((tr) => (
                  <div key={tr.id} className="flex items-center gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.025] px-3.5 py-3">
                    <span className="grid size-8 place-items-center rounded-lg bg-mint/10 text-mint">
                      <ArrowDownLeft className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="tabular text-sm font-medium">
                        {formatUsd(BigInt(tr.amount))}
                        {BigInt(tr.appliedHere) < BigInt(tr.amount) && <span className="ml-2 text-xs font-normal text-amber">{t(x.payments.excess, { amount: formatUsd(BigInt(tr.amount) - BigInt(tr.appliedHere)) })}</span>}
                        {tr.flags.includes("late") && <span className="ml-2 text-xs font-normal text-rose">{x.payments.late}</span>}
                      </p>
                      <p className="truncate text-xs text-fg-3">
                        {t(x.payments.from, { address: tr.counterparty ? shortAddress(tr.counterparty) : x.payments.unknown })} · {tr.blockTime ? dateTime(tr.blockTime) : ""}
                      </p>
                    </div>
                    {config.simulated ? (
                      <Mono className="text-[11px] text-fg-3">{shortAddress(tr.signature)}</Mono>
                    ) : (
                      <a href={explorerUrl("tx", tr.signature, config.cluster)} target="_blank" rel="noreferrer" className="text-fg-3 hover:text-fg" aria-label={x.payments.explorer}>
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                ))}
                {d.allocations.map((a, idx) => (
                  <Link key={idx} href={a.caseId ? `/app/exceptions/${a.caseId}` : "#"} className="flex items-center gap-3 rounded-xl border border-violet/20 bg-violet/[0.05] px-3.5 py-3 transition hover:bg-violet/[0.08]">
                    <span className="grid size-8 place-items-center rounded-lg bg-violet/15 text-violet">
                      <Shuffle className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="tabular text-sm font-medium">
                        {t(a.kind === "credit" ? x.payments.fromCredit : x.payments.fromOverpayment, { amount: formatUsd(BigInt(a.amount)) })}
                      </p>
                      <p className="truncate text-xs text-fg-3">
                        {renderMemo(i18n, a.memo)} · {dateTime(a.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </FadeIn>

          {d.cases.length > 0 && (
            <FadeIn delay={0.15}>
              <Card>
                <CardHeader title={x.exceptions} />
                <div className="space-y-2 p-5">
                  {d.cases.map((c) => (
                    <Link key={c.id} href={`/app/exceptions/${c.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.025] px-3.5 py-3 hover:bg-veil/[0.05]">
                      <span className="text-sm">{m.cases.kind[c.kind]}</span>
                      <CaseStatusBadge status={c.status} />
                    </Link>
                  ))}
                </div>
              </Card>
            </FadeIn>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {can(role, "editor") && BigInt(d.credit) > 0n && BigInt(i.remaining) > 0n && (
            <FadeIn delay={0.06}>
              <ApplyCredit invoiceId={i.id} credit={d.credit} remaining={i.remaining} customerName={d.customer.name} />
            </FadeIn>
          )}
          <FadeIn delay={0.08}>
            <Card className="p-5">
              <h3 className="font-display text-[15px] font-semibold">{x.paymentLink.title}</h3>
              <p className="mt-1 text-xs text-fg-3">{t(x.paymentLink.body, { name: d.customer.name })}</p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-veil/10 bg-ink-950/60 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-fg-2">{payUrl}</span>
                <CopyButton value={payUrl} label={m.common.copy} />
              </div>
            </Card>
          </FadeIn>
          <FadeIn delay={0.12}>
            <Card>
              <CardHeader title={x.activity} />
              <ActivityFeed events={d.activity} />
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

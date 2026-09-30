import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, ExternalLink, Shuffle } from "lucide-react";
import { ActivityFeed } from "@/components/app/activity";
import { CaseStatusBadge, InvoiceStatusBadge, caseKindLabel } from "@/components/app/status";
import { AnimatedAmount, FadeIn } from "@/components/ui/motion";
import { CopyButton } from "@/components/ui/interactive";
import { ButtonLink, Card, CardHeader, Mono } from "@/components/ui/primitives";
import { env, publicConfig } from "@/lib/env";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatUsd } from "@/lib/money";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";
import { deps, requireBusiness } from "@/lib/server/context";
import { invoiceDetail } from "@/lib/server/views";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: PageProps<"/app/invoices/[id]">) {
  const { id } = await params;
  const biz = await requireBusiness();
  const { db } = await deps();
  const d = await invoiceDetail(db, biz.id, id);
  if (!d) notFound();
  const config = publicConfig();
  const payUrl = `${env().APP_URL}/pay/${d.invoice.id}`;
  const i = d.invoice;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/app/invoices" className="mb-5 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-fg">
        <ArrowLeft className="size-4" /> Invoices
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
              {d.customer.name} · {d.customer.email} · due {formatDate(i.dueAt)}
            </p>
          </div>
          <ButtonLink href={`/pay/${i.id}`} target="_blank" variant="secondary">
            Open payment page <ArrowUpRight className="size-4" />
          </ButtonLink>
        </div>
      </FadeIn>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <FadeIn delay={0.05}>
            <Card className="grid grid-cols-3 divide-x divide-veil/[0.06]">
              {[
                { label: "Amount", v: i.amount },
                { label: "Applied", v: i.applied },
                { label: "Remaining", v: i.remaining },
              ].map((s) => (
                <div key={s.label} className="p-4 sm:p-5">
                  <p className="text-xs text-fg-3">{s.label}</p>
                  <AnimatedAmount units={s.v} className="tabular mt-1.5 block font-display text-lg font-semibold sm:text-2xl" />
                </div>
              ))}
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader title="Payments and allocations" subtitle="Verified on chain; each signature counted once" />
              <div className="space-y-2 p-5">
                {d.transfers.length === 0 && d.allocations.length === 0 && <p className="rounded-xl border border-dashed border-veil/10 px-4 py-6 text-center text-sm text-fg-3">No payments yet. Share the link below.</p>}
                {d.transfers.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.025] px-3.5 py-3">
                    <span className="grid size-8 place-items-center rounded-lg bg-mint/10 text-mint">
                      <ArrowDownLeft className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="tabular text-sm font-medium">
                        {formatUsd(BigInt(t.amount))}
                        {BigInt(t.appliedHere) < BigInt(t.amount) && <span className="ml-2 text-xs font-normal text-amber">{formatUsd(BigInt(t.amount) - BigInt(t.appliedHere))} excess</span>}
                        {t.flags.includes("late") && <span className="ml-2 text-xs font-normal text-rose">late</span>}
                      </p>
                      <p className="truncate text-xs text-fg-3">
                        from {t.counterparty ? shortAddress(t.counterparty) : "unknown"} · {t.blockTime ? formatDateTime(t.blockTime) : ""}
                      </p>
                    </div>
                    {config.simulated ? (
                      <Mono className="text-[11px] text-fg-3">{shortAddress(t.signature)}</Mono>
                    ) : (
                      <a href={explorerUrl("tx", t.signature, config.cluster)} target="_blank" rel="noreferrer" className="text-fg-3 hover:text-fg" aria-label="Explorer">
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
                      <p className="tabular text-sm font-medium">{formatUsd(BigInt(a.amount))} allocated from an overpayment</p>
                      <p className="truncate text-xs text-fg-3">
                        {a.memo} · {formatDateTime(a.createdAt)}
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
                <CardHeader title="Exceptions" />
                <div className="space-y-2 p-5">
                  {d.cases.map((c) => (
                    <Link key={c.id} href={`/app/exceptions/${c.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.025] px-3.5 py-3 hover:bg-veil/[0.05]">
                      <span className="text-sm">{caseKindLabel[c.kind]}</span>
                      <CaseStatusBadge status={c.status} />
                    </Link>
                  ))}
                </div>
              </Card>
            </FadeIn>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <FadeIn delay={0.08}>
            <Card className="p-5">
              <h3 className="font-display text-[15px] font-semibold">Payment link</h3>
              <p className="mt-1 text-xs text-fg-3">Send this to {d.customer.name}. It always asks for the exact remaining balance, and each payment carries a unique reference.</p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-veil/10 bg-ink-950/60 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-fg-2">{payUrl}</span>
                <CopyButton value={payUrl} label="Copy" />
              </div>
            </Card>
          </FadeIn>
          <FadeIn delay={0.12}>
            <Card>
              <CardHeader title="Activity" />
              <ActivityFeed events={d.activity} />
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

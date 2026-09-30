import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowDownLeft, ArrowLeft, ExternalLink, History, ReceiptText } from "lucide-react";
import { ActivityFeed } from "@/components/app/activity";
import { ApprovalChip, PlanLines } from "@/components/app/plan";
import { ReconBar } from "@/components/app/recon-bar";
import { CaseStatusBadge, caseKindLabel } from "@/components/app/status";
import { Stepper } from "@/components/app/stepper";
import { STEPS, stepFor } from "@/components/app/case-steps";
import { FadeIn } from "@/components/ui/motion";
import { Badge, ButtonLink, Card, CardHeader, Mono } from "@/components/ui/primitives";
import { WalletProviders } from "@/components/wallet/providers";
import { cases, customers } from "@/lib/db/schema";
import { publicConfig } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { formatUsd } from "@/lib/money";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";
import { deps, requireBusiness } from "@/lib/server/context";
import { demoKeys } from "@/lib/server/demo";
import { caseDetail } from "@/lib/server/views";
import { CaseActions } from "./case-actions";

export const metadata: Metadata = { title: "Exception" };

export default async function CasePage({ params }: PageProps<"/app/exceptions/[id]">) {
  const { id } = await params;
  const biz = await requireBusiness();
  const { db } = await deps();
  const [owned] = await db.select().from(cases).where(and(eq(cases.id, id), eq(cases.businessId, biz.id)));
  if (!owned) notFound();
  const d = (await caseDetail(db, id))!;
  const config = publicConfig();
  const allCustomers = await db.select({ id: customers.id, name: customers.name }).from(customers).where(eq(customers.businessId, biz.id));
  const current = d.proposals[0] ?? null;
  const history = d.proposals.slice(1);
  const step = stepFor(d);
  const demoMerchant = demoKeys()?.merchant?.publicKey.toBase58() === biz.walletAddress;

  const applied = (acct: string) => d.applied.filter((a) => a.account === acct).reduce((s, a) => s + BigInt(a.amount), 0n);
  const originalInvoiceApplied = d.transfers.reduce((s, t) => s + BigInt(t.appliedHere), 0n);
  const resolvedToInvoices = applied("invoice");

  return (
    <WalletProviders rpcUrl={config.rpcUrl}>
      <div className="mx-auto max-w-6xl">
        <Link href="/app/exceptions" className="mb-5 inline-flex items-center gap-1.5 text-sm text-fg-3 transition hover:text-fg">
          <ArrowLeft className="size-4" /> Exceptions
        </Link>

        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{caseKindLabel[d.case.kind]}</Badge>
                <CaseStatusBadge status={d.case.status} />
              </div>
              <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-[28px]">
                {d.case.status === "resolved" ? (
                  <>Resolved — every dollar placed</>
                ) : (
                  <>
                    <span className="text-amber">{formatUsd(BigInt(d.available || "0"))}</span> {d.case.kind === "unmatched" ? "arrived without an invoice" : "needs a plan"}
                  </>
                )}
              </h1>
              <p className="mt-1.5 text-sm text-fg-2">
                {d.customer ? d.customer.name : "Unknown sender"}
                {d.invoice ? ` · paid toward ${d.invoice.number} (${d.invoice.title})` : ""} · opened {formatDateTime(d.case.createdAt)}
              </p>
            </div>
            {d.case.status === "resolved" && (
              <ButtonLink href={`/receipt/${d.case.id}`} variant="success" target="_blank">
                <ReceiptText className="size-4" /> Shared receipt
              </ButtonLink>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="mt-6 px-5 py-5 sm:px-8">
            <Stepper steps={STEPS} current={step} complete={d.case.status === "resolved"} />
          </Card>
        </FadeIn>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5">
            <FadeIn delay={0.08}>
              <Card>
                <CardHeader title="The money" subtitle="Verified incoming transfers and where each dollar sits now" />
                <div className="space-y-2 px-5 pt-4">
                  {d.transfers
                    .filter((t) => t.direction === "in")
                    .map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.025] px-3.5 py-3">
                        <span className="grid size-8 place-items-center rounded-lg bg-mint/10 text-mint">
                          <ArrowDownLeft className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="tabular text-sm font-medium">{formatUsd(BigInt(t.amount))}</p>
                          <p className="truncate text-xs text-fg-3">
                            from <span className="font-mono">{t.counterparty ? shortAddress(t.counterparty) : "unknown"}</span>
                            {t.blockTime ? ` · ${formatDateTime(t.blockTime)}` : ""}
                            {t.flags.includes("late") ? " · late" : ""}
                          </p>
                        </div>
                        {config.simulated ? (
                          <Mono className="text-[11px] text-fg-3">{shortAddress(t.signature)}</Mono>
                        ) : (
                          <a href={explorerUrl("tx", t.signature, config.cluster)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-fg">
                            {shortAddress(t.signature)} <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    ))}
                </div>
                <div className="px-5 pb-5 pt-5">
                  <ReconBar
                    segments={[
                      { key: "orig", label: d.invoice ? `Applied to ${d.invoice.number}` : "Applied", units: originalInvoiceApplied.toString(), tone: "indigo" },
                      { key: "inv", label: "Allocated to other invoices", units: resolvedToInvoices.toString(), tone: "violet" },
                      { key: "credit", label: "Credit", units: applied("credit").toString(), tone: "violet" },
                      { key: "refunded", label: "Refunded", units: applied("refunded").toString(), tone: "mint" },
                      {
                        key: "pending",
                        label: "Refund pending",
                        units: (applied("refund_pending") - applied("refunded")).toString(),
                        tone: "cyan",
                      },
                      { key: "unres", label: "Unresolved", units: d.available, tone: "amber" },
                    ]}
                  />
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.12}>
              <Card>
                <CardHeader
                  title={current ? `Plan · version ${current.version}` : "Plan"}
                  subtitle={current ? `Proposed by the customer · ${formatDateTime(current.createdAt)}` : "Waiting for the customer to choose how to handle the extra"}
                  action={current && <Mono className="rounded-lg border border-veil/10 px-2 py-1 text-[11px]">#{current.hash.slice(0, 10)}</Mono>}
                />
                <div className="px-5 pb-5 pt-4">
                  {current ? (
                    <div className="space-y-3">
                      <PlanLines lines={current.lines} destination={current.refundDestination} proofMethod={current.proofMethod} invoiceNumbers={d.invoiceNumbers} />
                      {current.note && <p className="rounded-xl bg-veil/[0.03] px-3.5 py-2.5 text-sm text-fg-2">“{current.note}”</p>}
                      {current.approvals.map((a) => (
                        <ApprovalChip key={a.id} approval={a} />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-veil/10 px-4 py-6 text-center text-sm text-fg-3">
                      {d.customer ? "Send the customer a resolution link. They choose; you approve." : "Attribute this payment to a customer first."}
                    </p>
                  )}

                  {history.length > 0 && (
                    <details className="group mt-4">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-fg-3 hover:text-fg">
                        <History className="size-4" /> Earlier versions ({history.length})
                      </summary>
                      <div className="mt-3 space-y-3">
                        {history.map((p) => (
                          <div key={p.id} className="rounded-2xl border border-veil/[0.06] bg-ink-950/30 p-3 opacity-80">
                            <div className="mb-2 flex items-center justify-between text-xs text-fg-3">
                              <span>
                                v{p.version} · {p.status} · {formatDateTime(p.createdAt)}
                              </span>
                              <span className="font-mono">#{p.hash.slice(0, 10)}</span>
                            </div>
                            <PlanLines compact lines={p.lines} destination={p.refundDestination} proofMethod={p.proofMethod} invoiceNumbers={d.invoiceNumbers} />
                            {p.approvals.map((a) => (
                              <div key={a.id} className="mt-2">
                                <ApprovalChip approval={a} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </Card>
            </FadeIn>
          </div>

          <div className="flex flex-col gap-5">
            <FadeIn delay={0.1}>
              <CaseActions
                caseId={d.case.id}
                status={d.case.status}
                kind={d.case.kind}
                customer={d.customer}
                customers={allCustomers}
                linkActive={d.linkActive}
                current={current ? { id: current.id, version: current.version, status: current.status, hash: current.hash } : null}
                refund={d.refund}
                businessWallet={biz.walletAddress}
                demoMerchant={demoMerchant}
                config={config}
              />
            </FadeIn>
            <FadeIn delay={0.16}>
              <Card>
                <CardHeader title="Timeline" subtitle="Shared with the customer on the receipt" />
                <ActivityFeed events={d.activity} />
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </WalletProviders>
  );
}

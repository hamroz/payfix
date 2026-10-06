import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Ban, ExternalLink, Lock } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Equation } from "@/components/app/recon-bar";
import { PlanLines } from "@/components/app/plan";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Card, EmptyState } from "@/components/ui/primitives";
import { businesses, cases, postings, transfers, type Account } from "@/lib/db/schema";
import { publicConfig } from "@/lib/env";
import { formatUsd } from "@/lib/money";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";
import { currentCustomerId, currentUser, deps } from "@/lib/server/context";
import { membershipRole } from "@/lib/server/workspaces";
import { caseDetail } from "@/lib/server/views";
import { getI18n } from "@/lib/i18n/server";
import { renderApprovalReason } from "@/lib/i18n/events";
import { PrintButton } from "./print-button";
import { ThemeToggle } from "@/components/theme/theme";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.receipt.title, robots: { index: false } };
}

/** The same record for both sides. Visible only to the business and the verified invoice customer. */
export default async function ReceiptPage({ params }: PageProps<"/receipt/[caseId]">) {
  const { caseId } = await params;
  const { db } = await deps();
  const i18n = await getI18n();
  const { m, t, dateTime: formatDateTime } = i18n;
  const R = m.receipt;
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId));
  if (!c) notFound();
  const user = await currentUser();
  const customerId = await currentCustomerId();
  const member = user ? await membershipRole(db, user.id, c.businessId) : null;
  const allowed = member !== null || (c.customerId !== null && customerId === c.customerId);
  if (!allowed) {
    return (
      <>
        <div className="mx-auto max-w-md px-5 py-20">
          <Card>
            <EmptyState icon={<Lock className="size-5" />} title={R.private.title} body={R.private.body} />
          </Card>
        </div>
        <SiteFooter minimal />
      </>
    );
  }

  const d = (await caseDetail(db, caseId))!;
  const [business] = await db.select().from(businesses).where(eq(businesses.id, c.businessId));
  const config = publicConfig();

  // The whole story of the invoice this case belongs to (or just the case's transfers if unmatched).
  const incoming = d.invoice
    ? await db.select().from(transfers).where(and(eq(transfers.invoiceId, d.invoice.id), eq(transfers.direction, "in"))).orderBy(transfers.slot)
    : await db.select().from(transfers).where(inArray(transfers.id, d.transfers.map((t) => t.id)));
  const rows = incoming.length ? await db.select().from(postings).where(inArray(postings.transferId, incoming.map((t) => t.id))) : [];
  const refundRows = d.refund ? await db.select().from(postings).where(eq(postings.refundId, d.refund.id)) : [];
  const by = (acct: Account, pred: (p: (typeof rows)[number]) => boolean = () => true) =>
    [...rows, ...refundRows.filter((r) => !rows.some((x) => x.id === r.id))].filter((p) => p.account === acct && pred(p)).reduce((a, p) => a + p.amount, 0n);
  const received = incoming.reduce((a, t) => a + t.amount, 0n);
  const toOriginal = d.invoice ? by("invoice", (p) => p.invoiceId === d.invoice!.id) : 0n;
  const toOthers = by("invoice") - toOriginal;
  const parts = [
    ...(d.invoice ? [{ label: d.invoice.number, units: toOriginal.toString(), tone: "indigo" as const }] : []),
    ...(toOthers > 0n ? [{ label: R.parts.otherInvoices, units: toOthers.toString(), tone: "violet" as const }] : []),
    ...(by("credit") > 0n ? [{ label: R.parts.credit, units: by("credit").toString(), tone: "violet" as const }] : []),
    { label: R.parts.refunded, units: by("refunded").toString(), tone: "mint" as const },
    ...(by("refund_pending") > 0n ? [{ label: R.parts.refundPending, units: by("refund_pending").toString(), tone: "cyan" as const }] : []),
    { label: R.parts.unresolved, units: by("unresolved").toString(), tone: "amber" as const },
  ];
  const final = d.proposals.find((p) => p.status === "executed") ?? d.proposals[0];
  const txLink = (sig: string) =>
    config.simulated ? (
      <span className="font-mono text-[11px] text-fg-3">{shortAddress(sig, 6)}</span>
    ) : (
      <a href={explorerUrl("tx", sig, config.cluster)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-violet hover:underline">
        {shortAddress(sig, 6)} <ExternalLink className="size-3" />
      </a>
    );

  return (
    <>
      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Logo size={24} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PrintButton />
          </div>
        </div>

        <Card className="relative overflow-hidden p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 opacity-[0.06]">
            <LogoMark size={300} />
          </div>
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-fg-3">{R.eyebrow}</p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{d.case.status === "resolved" ? R.settled : R.inProgress}</h1>
                <p className="mt-1 font-mono text-xs text-fg-3">{d.case.id}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-fg">{business.name}</p>
                <p className="text-fg-3">{d.customer ? t(R.withCustomer, { customer: d.customer.name }) : R.withUnknownSender}</p>
                <p className="mt-2 text-xs text-fg-3">{d.case.resolvedAt ? t(R.resolvedAt, { date: formatDateTime(d.case.resolvedAt) }) : t(R.openedAt, { date: formatDateTime(d.case.createdAt) })}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-veil/[0.07] bg-ink-950/40 p-4">
              <p className="mb-3 text-xs text-fg-3">{d.invoice ? t(R.everyDollarInvoice, { invoice: d.invoice.number, amount: formatUsd(BigInt(d.invoice.amount)) }) : R.everyDollar}</p>
              <Equation received={received.toString()} parts={parts} />
            </div>

            <Section title={R.incoming}>
              {incoming.map((tr) => (
                <Row key={tr.id} icon={<ArrowDownLeft className="size-4 text-mint" />} left={formatUsd(tr.amount)} sub={t(R.incomingFrom, { address: tr.counterpartyOwner ? shortAddress(tr.counterpartyOwner) : R.unknownAddress, date: formatDateTime(tr.blockTime ?? tr.createdAt) })} right={txLink(tr.signature)} />
              ))}
            </Section>

            {final && (
              <Section title={t(R.agreedPlan, { version: String(final.version) })}>
                <PlanLines lines={final.lines} destination={final.refundDestination} proofMethod={final.proofMethod} invoiceNumbers={d.invoiceNumbers} compact />
              </Section>
            )}

            <Section title={R.approvals}>
              {d.proposals
                .slice()
                .reverse()
                .flatMap((p) =>
                  p.approvals.map((a) => (
                    <Row
                      key={a.id}
                      icon={a.invalidatedAt ? <Ban className="size-4 text-rose" /> : <BadgeCheck className="size-4 text-periwinkle" />}
                      left={t(a.invalidatedAt ? R.approvalVoided : R.approved, { version: String(p.version) })}
                      sub={a.invalidatedAt ? renderApprovalReason(i18n, a) : t(R.approvedBy, { name: a.approvedBy, date: formatDateTime(a.createdAt) })}
                      right={<span className="font-mono text-[11px] text-fg-3">#{a.hash.slice(0, 12)}</span>}
                    />
                  )),
                )}
              {d.proposals.every((p) => p.approvals.length === 0) && <p className="text-sm text-fg-3">{R.noApprovals}</p>}
            </Section>

            {d.refund && (
              <Section title={R.refund}>
                <Row
                  icon={<ArrowUpRight className="size-4 text-cyan" />}
                  left={t(R.refundLine, { amount: formatUsd(BigInt(d.refund.amount)), status: R.refundStatus[d.refund.status] })}
                  sub={d.refund.confirmedAt ? t(R.refundToAt, { address: shortAddress(d.refund.destination, 6), date: formatDateTime(d.refund.confirmedAt) }) : t(R.refundTo, { address: shortAddress(d.refund.destination, 6) })}
                  right={d.refund.signature ? txLink(d.refund.signature) : <span className="text-xs text-amber">{R.notOnChain}</span>}
                />
              </Section>
            )}

            <p className="mt-8 border-t border-veil/[0.06] pt-5 text-xs leading-relaxed text-fg-3">
              {config.simulated ? t(R.footnoteSimulated, { token: config.tokenLabel }) : t(R.footnote, { token: config.tokenLabel, cluster: config.cluster })}
            </p>
          </div>
        </Card>
      </div>
      <div className="print:hidden">
        <SiteFooter minimal />
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ icon, left, sub, right }: { icon: React.ReactNode; left: string; sub: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.02] px-3.5 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-veil/[0.04]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="tabular text-sm text-fg">{left}</p>
        <p className="truncate text-xs text-fg-3">{sub}</p>
      </div>
      {right}
    </div>
  );
}

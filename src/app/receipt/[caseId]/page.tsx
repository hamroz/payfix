import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Ban, ExternalLink, Lock } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Equation } from "@/components/app/recon-bar";
import { PlanLines } from "@/components/app/plan";
import { Card, EmptyState } from "@/components/ui/primitives";
import { businesses, cases, postings, transfers, type Account } from "@/lib/db/schema";
import { publicConfig } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { formatUsd } from "@/lib/money";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";
import { currentBusiness, currentCustomerId, deps } from "@/lib/server/context";
import { caseDetail } from "@/lib/server/views";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Settlement receipt", robots: { index: false } };

/** The same record for both sides. Visible only to the business and the verified invoice customer. */
export default async function ReceiptPage({ params }: PageProps<"/receipt/[caseId]">) {
  const { caseId } = await params;
  const { db } = await deps();
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId));
  if (!c) notFound();
  const biz = await currentBusiness();
  const customerId = await currentCustomerId();
  const allowed = biz?.id === c.businessId || (c.customerId !== null && customerId === c.customerId);
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <Card>
          <EmptyState icon={<Lock className="size-5" />} title="This receipt is private" body="Sign in as the business, or open it from your resolution link after verifying your email." />
        </Card>
      </div>
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
    ...(toOthers > 0n ? [{ label: "other invoices", units: toOthers.toString(), tone: "violet" as const }] : []),
    ...(by("credit") > 0n ? [{ label: "credit", units: by("credit").toString(), tone: "violet" as const }] : []),
    { label: "refunded", units: by("refunded").toString(), tone: "mint" as const },
    ...(by("refund_pending") > 0n ? [{ label: "refund pending", units: by("refund_pending").toString(), tone: "cyan" as const }] : []),
    { label: "unresolved", units: by("unresolved").toString(), tone: "amber" as const },
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
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Logo size={24} />
        <PrintButton />
      </div>

      <Card className="relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 opacity-[0.06]">
          <LogoMark size={300} />
        </div>
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-fg-3">Settlement receipt</p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{d.case.status === "resolved" ? "Settled" : "In progress"}</h1>
              <p className="mt-1 font-mono text-xs text-fg-3">{d.case.id}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-fg">{business.name}</p>
              <p className="text-fg-3">and {d.customer?.name ?? "unattributed sender"}</p>
              <p className="mt-2 text-xs text-fg-3">{d.case.resolvedAt ? `Resolved ${formatDateTime(d.case.resolvedAt)}` : `Opened ${formatDateTime(d.case.createdAt)}`}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/[0.07] bg-ink-950/40 p-4">
            <p className="mb-3 text-xs text-fg-3">{d.invoice ? `Every dollar paid toward ${d.invoice.number} (${formatUsd(BigInt(d.invoice.amount))})` : "Every dollar received"}</p>
            <Equation received={received.toString()} parts={parts} />
          </div>

          <Section title="Incoming payments">
            {incoming.map((t) => (
              <Row key={t.id} icon={<ArrowDownLeft className="size-4 text-mint" />} left={formatUsd(t.amount)} sub={`from ${shortAddress(t.counterpartyOwner ?? "unknown")} · ${formatDateTime(t.blockTime ?? t.createdAt)}`} right={txLink(t.signature)} />
            ))}
          </Section>

          {final && (
            <Section title={`Agreed plan · version ${final.version}`}>
              <PlanLines lines={final.lines} destination={final.refundDestination} proofMethod={final.proofMethod} invoiceNumbers={d.invoiceNumbers} compact />
            </Section>
          )}

          <Section title="Approvals">
            {d.proposals
              .slice()
              .reverse()
              .flatMap((p) =>
                p.approvals.map((a) => (
                  <Row
                    key={a.id}
                    icon={a.invalidatedAt ? <Ban className="size-4 text-rose" /> : <BadgeCheck className="size-4 text-[#A5B4FC]" />}
                    left={`v${p.version} ${a.invalidatedAt ? "approval voided" : "approved"}`}
                    sub={a.invalidatedAt ? a.invalidatedReason ?? "" : `by ${a.approvedBy} · ${formatDateTime(a.createdAt)}`}
                    right={<span className="font-mono text-[11px] text-fg-3">#{a.hash.slice(0, 12)}</span>}
                  />
                )),
              )}
            {d.proposals.every((p) => p.approvals.length === 0) && <p className="text-sm text-fg-3">No approvals yet.</p>}
          </Section>

          {d.refund && (
            <Section title="Refund">
              <Row
                icon={<ArrowUpRight className="size-4 text-cyan" />}
                left={`${formatUsd(BigInt(d.refund.amount))} · ${d.refund.status === "confirmed" ? "confirmed" : d.refund.status.replace("_", " ")}`}
                sub={`to ${shortAddress(d.refund.destination, 6)}${d.refund.confirmedAt ? ` · ${formatDateTime(d.refund.confirmedAt)}` : ""}`}
                right={d.refund.signature ? txLink(d.refund.signature) : <span className="text-xs text-amber">not yet on chain</span>}
              />
            </Section>
          )}

          <p className="mt-8 border-t border-white/[0.06] pt-5 text-xs leading-relaxed text-fg-3">
            Amounts are exact token units of {config.tokenLabel}, {config.simulated ? "on a simulated chain" : `on Solana ${config.cluster}`} — test money, not customer funds. This record covers transfers PayFix observed and refunds it initiated; payments made outside PayFix are not reflected.
          </p>
        </div>
      </Card>
    </div>
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
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.04]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="tabular text-sm text-fg">{left}</p>
        <p className="truncate text-xs text-fg-3">{sub}</p>
      </div>
      {right}
    </div>
  );
}

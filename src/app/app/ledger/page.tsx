import type { Metadata } from "next";
import { BookOpenText, Download } from "lucide-react";
import { Equation } from "@/components/app/recon-bar";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui/primitives";
import type { Account } from "@/lib/db/schema";
import { renderMemo } from "@/lib/i18n/english";
import { getI18n } from "@/lib/i18n/server";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/cn";
import { deps, requireBusiness } from "@/lib/server/context";
import { businessBalances } from "@/lib/server/queries";
import { ledgerView } from "@/lib/server/views";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.ledger.title };
}

const accountTone: Record<Account, string> = {
  external: "text-fg-3",
  unresolved: "text-amber",
  invoice: "text-periwinkle",
  credit: "text-violet",
  refund_pending: "text-cyan",
  refunded: "text-mint",
};

export default async function LedgerPage() {
  const biz = await requireBusiness();
  const { db } = await deps();
  const entries = await ledgerView(db, biz.id);
  const b = await businessBalances(db, biz.id);
  const i18n = await getI18n();
  const { m, dateTime } = i18n;
  const l = m.ledger;
  const eq = m.app.equation;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={l.eyebrow}
        title={l.heading}
        subtitle={l.subtitle}
        actions={
          <a href="/api/export/ledger" className={buttonClass("secondary")}>
            <Download className="size-4" /> {l.exportCsv}
          </a>
        }
      />
      <FadeIn>
        <Card className="mb-5 p-4">
          <Equation
            received={b.received.toString()}
            parts={[
              { label: eq.invoices, units: b.invoice.toString(), tone: "indigo" },
              { label: eq.credit, units: b.credit.toString(), tone: "violet" },
              { label: eq.refunded, units: b.refunded.toString(), tone: "mint" },
              { label: eq.pending, units: b.refund_pending.toString(), tone: "cyan" },
              { label: eq.unresolved, units: b.unresolved.toString(), tone: "amber" },
            ]}
          />
        </Card>
      </FadeIn>
      {entries.length === 0 ? (
        <Card>
          <EmptyState icon={<BookOpenText className="size-5" />} title={l.emptyTitle} body={l.emptyBody} />
        </Card>
      ) : (
        <Stagger className="space-y-2.5" step={0.03}>
          {entries.map((e) => (
            <StaggerItem key={e.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-veil/[0.06] px-2 py-0.5 font-mono text-[11px] text-fg-2">{e.kind}</span>
                    <span className="text-sm text-fg">{renderMemo(i18n, e.memo)}</span>
                  </div>
                  <span className="text-xs text-fg-3">{dateTime(e.createdAt)}</span>
                </div>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {e.postings.map((p, i) => {
                    const amt = BigInt(p.amount);
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-veil/[0.025] px-3 py-1.5 text-[13px]">
                        <span className={cn(accountTone[p.account])}>
                          {l.accounts[p.account]}
                          {p.invoiceNumber ? ` · ${p.invoiceNumber}` : ""}
                        </span>
                        <span className={cn("tabular font-mono text-xs", amt < 0n ? "text-fg-3" : "text-fg")}>
                          {amt < 0n ? "−" : "+"}
                          {formatUsd(amt < 0n ? -amt : amt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

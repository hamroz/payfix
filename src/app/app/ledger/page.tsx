import type { Metadata } from "next";
import { BookOpenText, Download } from "lucide-react";
import { Equation } from "@/components/app/recon-bar";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui/primitives";
import type { Account } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/cn";
import { deps, requireBusiness } from "@/lib/server/context";
import { businessBalances } from "@/lib/server/queries";
import { ledgerView } from "@/lib/server/views";

export const metadata: Metadata = { title: "Ledger" };

const accountLabel: Record<Account, string> = {
  external: "Received (on chain)",
  unresolved: "Unresolved",
  invoice: "Invoice",
  credit: "Customer credit",
  refund_pending: "Refund pending",
  refunded: "Refunded",
};
const accountTone: Record<Account, string> = {
  external: "text-fg-3",
  unresolved: "text-amber",
  invoice: "text-[#A5B4FC]",
  credit: "text-violet",
  refund_pending: "text-cyan",
  refunded: "text-mint",
};

export default async function LedgerPage() {
  const biz = await requireBusiness();
  const { db } = await deps();
  const entries = await ledgerView(db, biz.id);
  const b = await businessBalances(db, biz.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Ledger"
        title="Double-entry ledger"
        subtitle="Every movement of money, in exact token units. Each entry balances to zero and is written once per idempotency key, so retries can’t double-count."
        actions={
          <a href="/api/export/ledger" className={buttonClass("secondary")}>
            <Download className="size-4" /> Export CSV
          </a>
        }
      />
      <FadeIn>
        <Card className="mb-5 p-4">
          <Equation
            received={b.received.toString()}
            parts={[
              { label: "invoices", units: b.invoice.toString(), tone: "indigo" },
              { label: "credit", units: b.credit.toString(), tone: "violet" },
              { label: "refunded", units: b.refunded.toString(), tone: "mint" },
              { label: "pending", units: b.refund_pending.toString(), tone: "cyan" },
              { label: "unresolved", units: b.unresolved.toString(), tone: "amber" },
            ]}
          />
        </Card>
      </FadeIn>
      {entries.length === 0 ? (
        <Card>
          <EmptyState icon={<BookOpenText className="size-5" />} title="No entries yet" body="Entries appear as soon as a payment is verified on chain." />
        </Card>
      ) : (
        <Stagger className="space-y-2.5" step={0.03}>
          {entries.map((e) => (
            <StaggerItem key={e.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-fg-2">{e.kind}</span>
                    <span className="text-sm text-fg">{e.memo}</span>
                  </div>
                  <span className="text-xs text-fg-3">{formatDateTime(e.createdAt)}</span>
                </div>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {e.postings.map((p, i) => {
                    const amt = BigInt(p.amount);
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.025] px-3 py-1.5 text-[13px]">
                        <span className={cn(accountTone[p.account])}>
                          {accountLabel[p.account]}
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

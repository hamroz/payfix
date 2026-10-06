"use client";

import { ArrowUpRight, BadgeCheck, Ban, FileText, PiggyBank, ShieldCheck } from "lucide-react";
import type { ProposalLine } from "@/lib/db/schema";
import { formatUsd } from "@/lib/money";
import { shortAddress } from "@/lib/solana/tx";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import { renderApprovalReason, type ApprovalReason } from "@/lib/i18n/events";

export function PlanLines({ lines, destination, proofMethod, invoiceNumbers, compact }: { lines: ProposalLine[]; destination: string | null; proofMethod?: string | null; invoiceNumbers: Record<string, string>; compact?: boolean }) {
  const { m, t } = useI18n();
  return (
    <ul className="space-y-2">
      {lines.map((l, i) => {
        const Icon = l.type === "invoice" ? FileText : l.type === "credit" ? PiggyBank : ArrowUpRight;
        const tone = l.type === "invoice" ? "bg-indigo/15 text-periwinkle" : l.type === "credit" ? "bg-violet/15 text-violet" : "bg-mint/10 text-mint";
        return (
          <li key={i} className={cn("flex items-center gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.025]", compact ? "px-3 py-2" : "px-3.5 py-3")}>
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tone)}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg">
                {l.type === "invoice"
                  ? invoiceNumbers[l.invoiceId]
                    ? t(m.cases.plan.applyTo, { invoice: invoiceNumbers[l.invoiceId] })
                    : m.cases.plan.applyToInvoice
                  : l.type === "credit"
                    ? m.cases.plan.keepAsCredit
                    : m.cases.plan.refundToCustomer}
              </p>
              {l.type === "refund" && destination && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-3">
                  <span className="font-mono">{shortAddress(destination, 6)}</span>
                  {proofMethod && (
                    <span className="inline-flex items-center gap-1 text-mint">
                      <ShieldCheck className="size-3" /> {proofMethod === "demo_wallet" ? m.cases.plan.demoWalletSigned : m.cases.plan.walletSigned}
                    </span>
                  )}
                </p>
              )}
            </div>
            <span className="tabular font-display text-sm font-semibold">{formatUsd(BigInt(l.amount))}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ApprovalChip({
  approval,
}: {
  approval: { approvedBy: string; createdAt: string; invalidatedAt: string | null; invalidatedReason: string | null; invalidation?: ApprovalReason | null; hash: string };
}) {
  const i18n = useI18n();
  const { m, rich } = i18n;
  if (approval.invalidatedAt) {
    return (
      <div className="rounded-xl border border-rose/20 bg-rose/[0.06] px-3.5 py-2.5 text-[13px]">
        <p className="flex items-center gap-1.5 font-medium text-rose">
          <Ban className="size-3.5" /> {m.cases.plan.approvalVoided}
        </p>
        <p className="mt-0.5 text-fg-2">{renderApprovalReason(i18n, approval)}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-indigo/25 bg-indigo/[0.08] px-3.5 py-2.5 text-[13px]">
      <BadgeCheck className="size-4 text-periwinkle" />
      <span className="text-fg-2">
        {rich(m.cases.plan.approvedBy, { name: (c) => <span className="text-fg">{c}</span> }, { name: approval.approvedBy })}
      </span>
      <span className="ml-auto font-mono text-[11px] text-fg-3">#{approval.hash.slice(0, 10)}</span>
    </div>
  );
}

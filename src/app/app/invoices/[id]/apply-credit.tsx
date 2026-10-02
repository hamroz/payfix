"use client";

import { PiggyBank } from "lucide-react";
import { useTransition } from "react";
import { applyCreditAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Card } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { formatUsd } from "@/lib/money";

/** Spend a customer's stored credit on this invoice — up to whatever is still owed. */
export function ApplyCredit({ invoiceId, credit, remaining, customerName }: { invoiceId: string; credit: string; remaining: string; customerName: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const amount = BigInt(credit) < BigInt(remaining) ? BigInt(credit) : BigInt(remaining);
  return (
    <Card className="border-violet/20 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet/15 text-violet">
          <PiggyBank className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[15px] font-semibold">{formatUsd(BigInt(credit))} of credit available</h3>
          <p className="mt-0.5 text-xs text-fg-3">{customerName} chose to keep this as credit with you. Applying it settles part of this invoice without a new payment.</p>
        </div>
      </div>
      <Button
        className="mt-4 w-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await applyCreditAction(invoiceId);
            toast.push(res.ok ? { tone: "success", title: `${formatUsd(BigInt(res.applied))} of credit applied` } : { tone: "error", title: "Credit not applied", body: res.error });
          })
        }
      >
        {pending ? <LogoSpinner size={18} /> : <PiggyBank className="size-4" />} Apply {formatUsd(amount)} credit
      </Button>
    </Card>
  );
}

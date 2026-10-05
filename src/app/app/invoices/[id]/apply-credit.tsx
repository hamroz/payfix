"use client";

import { PiggyBank } from "lucide-react";
import { useTransition } from "react";
import { applyCreditAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Card } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n/client";
import { formatUsd } from "@/lib/money";

/** Spend a customer's stored credit on this invoice — up to whatever is still owed. */
export function ApplyCredit({ invoiceId, credit, remaining, customerName }: { invoiceId: string; credit: string; remaining: string; customerName: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const { m, t } = useI18n();
  const a = m.invoices.applyCredit;
  const amount = BigInt(credit) < BigInt(remaining) ? BigInt(credit) : BigInt(remaining);
  return (
    <Card className="border-violet/20 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet/15 text-violet">
          <PiggyBank className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[15px] font-semibold">{t(a.available, { amount: formatUsd(BigInt(credit)) })}</h3>
          <p className="mt-0.5 text-xs text-fg-3">{t(a.body, { name: customerName })}</p>
        </div>
      </div>
      <Button
        className="mt-4 w-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await applyCreditAction(invoiceId);
            toast.push(res.ok ? { tone: "success", title: t(a.applied, { amount: formatUsd(BigInt(res.applied)) }) } : { tone: "error", title: a.failed, body: res.error });
          })
        }
      >
        {pending ? <LogoSpinner size={18} /> : <PiggyBank className="size-4" />} {t(a.button, { amount: formatUsd(amount) })}
      </Button>
    </Card>
  );
}

"use client";

import { motion } from "motion/react";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type State = {
  firstInvoiceId: string | null;
  firstCaseId: string | null;
  partial: boolean;
  overpaid: boolean;
  linkSent: boolean;
  proposed: boolean;
  approved: boolean;
  invalidated: boolean;
  executed: boolean;
  refunded: boolean;
};

/** The demo script as a live checklist; each step ticks itself off from real state. */
export function GuidedDemo({ state }: { state: State }) {
  const pay = state.firstInvoiceId ? `/pay/${state.firstInvoiceId}` : "/app/invoices";
  const kase = state.firstCaseId ? `/app/exceptions/${state.firstCaseId}` : "/app/exceptions";
  const steps = [
    { done: state.partial, title: "Customer pays $600 toward INV-0001", hint: "Open the payment page and pay with the demo customer wallet", href: pay, external: true },
    { done: state.overpaid, title: "Customer pays $500 more — $100 over", hint: "Same payment page; PayFix flags the excess", href: pay, external: true },
    { done: state.linkSent, title: "Send the customer a resolution link", hint: "From the exception, send the link", href: kase },
    { done: state.proposed, title: "Customer proposes $60 → INV-0002 + $40 refund", hint: "Open the link from the demo inbox", href: kase },
    { done: state.approved, title: "Approve that exact plan", hint: "Approval is bound to the plan’s hash", href: kase },
    { done: state.invalidated, title: "Customer changes the refund wallet", hint: "Watch the approval become invalid", href: kase },
    { done: state.executed, title: "Re-approve v2 and run the plan", hint: "$60 posts to INV-0002 immediately", href: kase },
    { done: state.refunded, title: "Sign the $40 refund and confirm", hint: "A settled, $0-unresolved receipt", href: kase },
  ];
  const next = steps.findIndex((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-veil/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-violet/15 text-violet">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-[15px] font-semibold">Guided demo</h3>
            <p className="text-xs text-fg-3">The full resolution story, step by step</p>
          </div>
        </div>
        <span className="tabular text-xs text-fg-3">
          {doneCount}/{steps.length}
        </span>
      </div>
      <div className="h-1 bg-veil/[0.04]">
        <motion.div className="h-full bg-[linear-gradient(90deg,#6366F1,#A78BFA,#5EF2C2)]" initial={{ width: 0 }} animate={{ width: `${(doneCount / steps.length) * 100}%` }} transition={{ duration: 0.8 }} />
      </div>
      <ol className="p-2">
        {steps.map((s, i) => {
          const active = i === next;
          return (
            <li key={s.title}>
              <Link
                href={s.href}
                target={s.external ? "_blank" : undefined}
                className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 transition", active ? "bg-veil/[0.05]" : "hover:bg-veil/[0.03]")}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition",
                    s.done ? "border-mint/30 bg-mint/15 text-mint" : active ? "border-violet/50 text-violet" : "border-veil/10 text-fg-3",
                  )}
                >
                  {s.done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[13.5px]", s.done ? "text-fg-3 line-through decoration-veil/20" : "text-fg")}>{s.title}</p>
                  {active && <p className="mt-0.5 text-xs text-violet">{s.hint}</p>}
                </div>
                {active && <ChevronRight className="size-4 text-fg-3 transition group-hover:translate-x-0.5 group-hover:text-fg" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

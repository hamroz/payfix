"use client";

import { motion } from "motion/react";
import { Check, ChevronRight, MessageSquareHeart, Sparkles } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
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
  const { m, t } = useI18n();
  const g = m.app.guidedDemo.steps;
  const pay = state.firstInvoiceId ? `/pay/${state.firstInvoiceId}` : "/app/invoices";
  const kase = state.firstCaseId ? `/app/exceptions/${state.firstCaseId}` : "/app/exceptions";
  const steps = [
    { done: state.partial, title: t(g.partial.title, { amount: "$600", invoice: "INV-0001" }), hint: g.partial.hint, href: pay, external: true },
    { done: state.overpaid, title: t(g.overpaid.title, { amount: "$500", excess: "$100" }), hint: g.overpaid.hint, href: pay, external: true },
    { done: state.linkSent, title: g.linkSent.title, hint: g.linkSent.hint, href: kase },
    { done: state.proposed, title: t(g.proposed.title, { credit: "$60", invoice: "INV-0002", refund: "$40" }), hint: g.proposed.hint, href: kase },
    { done: state.approved, title: g.approved.title, hint: g.approved.hint, href: kase },
    { done: state.invalidated, title: g.invalidated.title, hint: g.invalidated.hint, href: kase },
    { done: state.executed, title: g.executed.title, hint: t(g.executed.hint, { amount: "$60", invoice: "INV-0002" }), href: kase },
    { done: state.refunded, title: t(g.refunded.title, { amount: "$40" }), hint: t(g.refunded.hint, { zero: "$0" }), href: kase },
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
            <h3 className="font-display text-[15px] font-semibold">{m.app.guidedDemo.title}</h3>
            <p className="text-xs text-fg-3">{m.app.guidedDemo.subtitle}</p>
          </div>
        </div>
        <span className="tabular text-xs text-fg-3">
          {t(m.app.guidedDemo.progress, { done: doneCount, total: steps.length })}
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
      {doneCount === steps.length && (
        <Link
          href="/feedback?c=guided-demo"
          target="_blank"
          className="group flex items-center justify-between gap-3 border-t border-veil/[0.06] px-5 py-3.5 text-sm font-medium text-violet transition hover:bg-veil/[0.03]"
        >
          <span className="inline-flex items-center gap-2">
            <MessageSquareHeart className="size-4" /> {m.feedback.guidedDemoLink}
          </span>
          <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

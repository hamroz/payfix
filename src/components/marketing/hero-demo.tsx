"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Check, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

// A scripted loop of the product's core story, all amounts from the demo scenario.
const STAGES = [
  { title: "Payments arrive", note: "Two transfers verified on Solana" },
  { title: "Invoice settled, $100 extra", note: "The excess is flagged, not guessed" },
  { title: "Customer proposes a split", note: "$60 → INV-0002 · $40 refund" },
  { title: "Business approves v2", note: "Exact plan, hash-bound approval" },
  { title: "Every dollar has a home", note: "Refund confirmed · $0 unresolved" },
];

export function HeroDemo() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2600);
    return () => clearInterval(id);
  }, []);

  const bars = [
    { key: "a", label: "INV-0001", amount: "$1,000", pct: 90.9, tone: "from-indigo to-[#818CF8]", show: stage >= 1 },
    { key: "b", label: "INV-0002", amount: "$60", pct: 5.45, tone: "from-violet to-[#C4B5FD]", show: stage >= 3 },
    { key: "r", label: "Refunded", amount: "$40", pct: 3.64, tone: "from-[#34D399] to-mint", show: stage >= 4 },
    { key: "x", label: "Unresolved", amount: stage >= 3 ? "$0" : "$100", pct: 9.09, tone: "from-amber to-[#FCD34D]", show: stage >= 1 && stage < 3 },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(closest-side,rgba(99,102,241,0.25),transparent)] blur-2xl" />
      <div className="glass overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-fg-3">
            <FileText className="size-3.5" /> Acme Robotics · 2 invoices
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-fg-3">Test money</span>
        </div>

        <div className="mt-5 space-y-2">
          {[
            { amt: "$600.00", t: 0 },
            { amt: "$500.00", t: 0.15 },
          ].map((p) => (
            <motion.div
              key={p.amt}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: p.t + 0.3, duration: 0.5 }}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-mint/10 text-mint">
                  <ArrowDownLeft className="size-3.5" />
                </span>
                <span className="text-sm text-fg-2">Incoming transfer</span>
              </div>
              <span className="tabular font-display text-sm font-semibold">{p.amt}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.14em] text-fg-3">$1,100 received</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={stage >= 3 ? "ok" : "no"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={cn("text-xs font-medium", stage >= 3 ? "text-mint" : "text-amber")}
              >
                {stage >= 3 ? "Reconciled" : stage >= 1 ? "$100 needs resolution" : "Verifying…"}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex h-3.5 gap-1 overflow-hidden rounded-full bg-white/[0.05] p-0.5">
            {bars.map((b) => (
              <motion.div
                key={b.key}
                className={cn("h-full rounded-full bg-gradient-to-r", b.tone)}
                initial={false}
                animate={{ width: b.show ? `${b.pct}%` : "0%", opacity: b.show ? 1 : 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] sm:grid-cols-4">
            {bars.map((b) => (
              <motion.div key={b.key} animate={{ opacity: b.show ? 1 : 0.35 }} className="rounded-lg bg-white/[0.03] px-2.5 py-2">
                <div className="text-[11px] text-fg-3">{b.label}</div>
                <div className="tabular font-display font-semibold text-fg">{b.amount}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-ink-950/50 p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl",
                stage === 4 ? "bg-mint/15 text-mint" : stage === 1 ? "bg-amber/15 text-amber" : "bg-violet/15 text-violet",
              )}
            >
              {stage === 0 ? <ArrowDownLeft className="size-4" /> : stage === 1 ? <Sparkles className="size-4" /> : stage === 2 ? <ArrowUpRight className="size-4" /> : stage === 3 ? <ShieldCheck className="size-4" /> : <Check className="size-4" />}
            </motion.div>
          </AnimatePresence>
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                <div className="text-sm font-medium text-fg">{STAGES[stage].title}</div>
                <div className="truncate text-xs text-fg-3">{STAGES[stage].note}</div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-1">
            {STAGES.map((_, i) => (
              <motion.span key={i} className="h-1.5 rounded-full bg-white/20" animate={{ width: i === stage ? 16 : 6, backgroundColor: i <= stage ? "#A78BFA" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

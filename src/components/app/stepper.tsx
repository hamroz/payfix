"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Horizontal progress of a case through the resolution loop. */
export function Stepper({ steps, current, complete = false }: { steps: string[]; current: number; complete?: boolean }) {
  return (
    <div className="relative">
      <div className="absolute left-3 right-3 top-3 h-px bg-veil/10" />
      <motion.div
        className="absolute left-3 top-3 h-px bg-[linear-gradient(90deg,#6366F1,#A78BFA,#5EF2C2)]"
        initial={{ width: 0 }}
        animate={{ width: `calc(${((complete ? steps.length - 1 : Math.min(current, steps.length - 1)) / (steps.length - 1)) * 100}% - ${complete ? 24 : 12}px)` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <ol className="relative flex justify-between">
        {steps.map((s, i) => {
          const done = i < current || complete;
          const active = i === current && !complete;
          return (
            <li key={s} className="flex w-0 flex-1 flex-col items-center first:items-start last:items-end">
              <motion.span
                initial={false}
                animate={{ scale: active ? 1.08 : 1 }}
                className={cn(
                  "relative grid size-6 place-items-center rounded-full border text-[10px] font-semibold",
                  done ? "border-transparent bg-[linear-gradient(135deg,#6366F1,#A78BFA)] text-white" : active ? "border-violet bg-ink-900 text-violet" : "border-veil/15 bg-ink-900 text-fg-3",
                )}
              >
                {active && <span className="absolute inset-0 animate-pulse-ring rounded-full border border-violet" />}
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </motion.span>
              <span className={cn("mt-2 hidden text-center text-[11px] sm:block", done || active ? "text-fg-2" : "text-fg-3")}>{s}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

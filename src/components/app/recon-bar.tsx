"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/money";

export type Segment = { key: string; label: string; units: string; tone: "indigo" | "violet" | "mint" | "cyan" | "amber" | "rose" | "slate" };

const fills: Record<Segment["tone"], string> = {
  indigo: "bg-[linear-gradient(90deg,#6366F1,#818CF8)]",
  violet: "bg-[linear-gradient(90deg,#8B5CF6,#A78BFA)]",
  mint: "bg-[linear-gradient(90deg,#34D399,#5EF2C2)]",
  cyan: "bg-[linear-gradient(90deg,#06B6D4,#22D3EE)]",
  amber: "bg-[repeating-linear-gradient(135deg,#F59E0B_0_6px,#FBBF24_6px_12px)]",
  rose: "bg-[linear-gradient(90deg,#F43F5E,#FB7185)]",
  slate: "bg-veil/15",
};
const dots: Record<Segment["tone"], string> = {
  indigo: "bg-indigo",
  violet: "bg-violet",
  mint: "bg-mint",
  cyan: "bg-cyan",
  amber: "bg-amber",
  rose: "bg-rose",
  slate: "bg-veil/30",
};

/**
 * Where every unit of received money went, as one animated bar plus a legend.
 * Widths are proportions of the total; labels always show exact amounts.
 */
export function ReconBar({ segments, className, showLegend = true, height = 12 }: { segments: Segment[]; className?: string; showLegend?: boolean; height?: number }) {
  const total = segments.reduce((a, s) => a + BigInt(s.units), 0n);
  const visible = segments.filter((s) => BigInt(s.units) > 0n);
  return (
    <div className={className}>
      <div className="flex w-full gap-1 overflow-hidden rounded-full bg-veil/[0.04] p-0.5" style={{ height }}>
        {visible.map((s, i) => {
          const pct = total === 0n ? 0 : Number((BigInt(s.units) * 10000n) / total) / 100;
          return (
            <motion.div
              key={s.key}
              layout
              className={cn("h-full rounded-full", fills[s.tone])}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${pct}%`, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ minWidth: 6 }}
            />
          );
        })}
      </div>
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {segments.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-[13px]">
              <span className={cn("size-2 rounded-full", dots[s.tone])} />
              <span className="text-fg-3">{s.label}</span>
              <span className="tabular font-medium text-fg">{formatUsd(BigInt(s.units))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** "$1,100 received = $1,000 + $60 + $40 + $0" — the sentence every resolution must satisfy. */
export function Equation({ received, parts, className }: { received: string; parts: { label: string; units: string; tone?: Segment["tone"] }[]; className?: string }) {
  const sum = parts.reduce((a, p) => a + BigInt(p.units), 0n);
  const balanced = sum === BigInt(received);
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-2 font-display text-sm", className)}>
      <Chip tone="slate" label="received" units={received} />
      <span className={cn("px-1 text-lg", balanced ? "text-mint" : "text-rose")}>{balanced ? "=" : "≠"}</span>
      {parts.map((p, i) => (
        <span key={p.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-fg-3">+</span>}
          <Chip tone={p.tone ?? "indigo"} label={p.label} units={p.units} />
        </span>
      ))}
    </div>
  );
}

function Chip({ label, units, tone }: { label: string; units: string; tone: Segment["tone"] }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-veil/10 bg-veil/[0.04] px-2.5 py-1">
      <span className={cn("size-1.5 translate-y-[-1px] self-center rounded-full", dots[tone])} />
      <span className="tabular font-semibold text-fg">{formatUsd(BigInt(units))}</span>
      <span className="text-xs font-normal text-fg-3">{label}</span>
    </span>
  );
}

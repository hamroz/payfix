"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

export function CopyButton({ value, label, className }: { value: string; label?: string; className?: string }) {
  const { m } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-fg-2 transition hover:bg-veil/[0.06] hover:text-fg",
        className,
      )}
      aria-label={label ?? m.common.copy}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={copied ? "y" : "n"} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
          {copied ? <Check className="size-3.5 text-mint" /> : <Copy className="size-3.5" />}
        </motion.span>
      </AnimatePresence>
      {label && <span>{copied ? m.common.copied : label}</span>}
    </button>
  );
}

/** A card whose border glows under the pointer. */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  return (
    <div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerLeave={() => setPos({ x: -999, y: -999 })}
      className={cn("glass group relative overflow-hidden rounded-2xl", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.10), transparent 45%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

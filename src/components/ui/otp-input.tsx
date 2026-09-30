"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

/** Six-box one-time-code input with paste support. Calls onComplete when all digits are entered. */
export function OtpInput({ value, onChange, onComplete, disabled, error }: { value: string; onChange: (v: string) => void; onComplete?: (v: string) => void; disabled?: boolean; error?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    if (clean.length === 6) onComplete?.(clean);
    refs.current[Math.min(clean.length, 5)]?.focus();
  };

  return (
    <motion.div className="flex justify-between gap-2" animate={error ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          disabled={disabled}
          value={d.trim()}
          autoFocus={i === 0}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) return set(value.slice(0, i) + v);
            const arr = value.padEnd(6, " ").split("");
            arr[i] = v || " ";
            set(arr.join("").replace(/\s+$/, "").replace(/ /g, ""));
            if (v) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d.trim() && i > 0) {
              refs.current[i - 1]?.focus();
              onChange(value.slice(0, i - 1));
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            set(e.clipboardData.getData("text"));
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-xl border bg-ink-950/60 text-center font-display text-2xl font-semibold text-fg outline-none transition",
            "focus:border-violet/60 focus:ring-4 focus:ring-violet/15",
            error ? "border-rose/50" : d.trim() ? "border-violet/40" : "border-white/10",
          )}
        />
      ))}
    </motion.div>
  );
}

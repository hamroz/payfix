"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

// Geometry from brand/payfix-mark.svg: a 300° ring and the returning dot in its gap.
const ARC = 76 / (2 * Math.PI * 17);

type MarkProps = { size?: number; animate?: boolean; className?: string; delay?: number };

/** The PayFix mark. With `animate`, the ring draws itself and the missing piece lands in the gap. */
export function LogoMark({ size = 28, animate = false, className, delay = 0 }: MarkProps) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const play = animate && !reduce;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn("shrink-0 overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`ring-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="32"
        cy="33"
        r="17"
        fill="none"
        stroke={`url(#ring-${id})`}
        strokeWidth="10"
        strokeLinecap="round"
        style={{ originX: "32px", originY: "33px" }}
        initial={play ? { pathLength: 0, rotate: -140 } : { pathLength: ARC, rotate: 0 }}
        animate={{ pathLength: ARC, rotate: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        r="5.5"
        fill="#5EF2C2"
        initial={play ? { cx: 78, cy: -14, opacity: 0, scale: 0.6 } : { cx: 47, cy: 15, opacity: 1, scale: 1 }}
        animate={{ cx: 47, cy: 15, opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: delay + 0.85, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export function Logo({ size = 28, animate = false, className }: MarkProps) {
  // Block-level flex, not inline-flex: an inline box sits on the text baseline and picks up
  // descender space below it, which pushes the logo above center in a flex row like a header.
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} animate={animate} />
      <span className="font-display font-semibold tracking-tight" style={{ fontSize: size * 0.72 }}>
        <span className="text-fg">pay</span>
        <span className="text-gradient">fix</span>
      </span>
    </span>
  );
}

/** Brand loader: the ring spins while the dot orbits back into place. */
export function LogoSpinner({ size = 40, className }: { size?: number; className?: string }) {
  const { m } = useI18n();
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn("overflow-visible", className)} role="img" aria-label={m.common.loading}>
      <defs>
        <linearGradient id={`spin-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <motion.g style={{ originX: "32px", originY: "32px" }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}>
        <circle cx="32" cy="32" r="17" fill="none" stroke={`url(#spin-${id})`} strokeWidth="9" strokeLinecap="round" strokeDasharray="76 30.8" />
        <motion.circle
          cx="47"
          cy="14"
          r="5"
          fill="#5EF2C2"
          animate={{ scale: [1, 1.35, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        />
      </motion.g>
    </svg>
  );
}

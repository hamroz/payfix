"use client";

import { animate, motion, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatUsd } from "@/lib/money";

export const ease = [0.22, 1, 0.36, 1] as const;

export function FadeIn({ delay = 0, y = 10, className, children, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, delay = 0, step = 0.06 }: { children: ReactNode; className?: string; delay?: number; step?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Counts up to an exact amount. The animation is cosmetic: intermediate frames are
 * rounded, and the final frame renders the exact value from integer units.
 */
export function AnimatedAmount({ units, decimals = 6, className, duration = 1.1 }: { units: string; decimals?: number; className?: string; duration?: number }) {
  const exact = BigInt(units);
  const target = Number(exact) / 10 ** decimals;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [text, setText] = useState(() => formatUsd(0n, decimals));
  const last = useRef(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(last.current, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setText(`$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
      onComplete: () => {
        last.current = target;
        setText(formatUsd(exact, decimals));
      },
    });
    return () => controls.stop();
  }, [inView, target, exact, decimals, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {reduce ? formatUsd(exact, decimals) : text}
    </span>
  );
}

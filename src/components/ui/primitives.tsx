import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary:
    "text-white bg-[linear-gradient(135deg,#6366F1,#8B5CF6_55%,#A78BFA)] shadow-[0_8px_30px_-10px_rgba(124,92,246,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_10px_40px_-8px_rgba(124,92,246,0.95),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110",
  success:
    "text-[#06080e] bg-[linear-gradient(135deg,#5EF2C2,#22D3EE)] shadow-[0_8px_30px_-10px_rgba(94,242,194,0.7),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-105",
  secondary: "text-fg bg-veil/[0.06] border border-veil/10 hover:bg-veil/[0.1] hover:border-veil/15",
  ghost: "text-fg-2 hover:text-fg hover:bg-veil/[0.06]",
  danger: "text-rose bg-rose/10 border border-rose/20 hover:bg-rose/15",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(base, variants[variant], sizes[size], className);

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("glass rounded-2xl", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-fg">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-fg-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "neutral" | "amber" | "violet" | "indigo" | "cyan" | "mint" | "rose";
const tones: Record<Tone, string> = {
  neutral: "bg-veil/[0.06] text-fg-2 border-veil/10",
  amber: "bg-amber/10 text-amber border-amber/20",
  violet: "bg-violet/10 text-violet border-violet/20",
  indigo: "bg-indigo/15 text-periwinkle border-indigo/25",
  cyan: "bg-cyan/10 text-cyan border-cyan/20",
  mint: "bg-mint/10 text-mint border-mint/20",
  rose: "bg-rose/10 text-rose border-rose/20",
};
const dots: Record<Tone, string> = {
  neutral: "bg-fg-3",
  amber: "bg-amber",
  violet: "bg-violet",
  indigo: "bg-indigo",
  cyan: "bg-cyan",
  mint: "bg-mint",
  rose: "bg-rose",
};

export function Badge({ tone = "neutral", pulse, children, className }: { tone?: Tone; pulse?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      <span className="relative flex size-1.5">
        {pulse && <span className={cn("absolute inset-0 rounded-full animate-pulse-ring", dots[tone])} />}
        <span className={cn("relative size-1.5 rounded-full", dots[tone])} />
      </span>
      {children}
    </span>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-[13px] font-medium text-fg-2", className)} {...props} />;
}

export const inputClass =
  "h-11 w-full rounded-xl border border-veil/10 bg-ink-950/60 px-3.5 text-[15px] text-fg placeholder:text-fg-3/70 outline-none transition focus:border-violet/60 focus:bg-ink-950/80 focus:ring-4 focus:ring-violet/15";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputClass, "appearance-none pr-9", className)} {...props} />;
}

export function Mono({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("font-mono text-[12.5px] text-fg-2", className)} {...props} />;
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{eyebrow}</div>}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-fg-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-veil/10 bg-veil/[0.04] text-fg-2">{icon}</div>}
      <p className="font-display text-[15px] font-semibold text-fg">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-fg-3">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Alert({ tone = "amber", title, children, className }: { tone?: "amber" | "rose" | "mint" | "violet"; title?: ReactNode; children?: ReactNode; className?: string }) {
  const t = {
    amber: "border-amber/20 bg-amber/[0.07] text-amber",
    rose: "border-rose/25 bg-rose/[0.08] text-rose",
    mint: "border-mint/20 bg-mint/[0.07] text-mint",
    violet: "border-violet/20 bg-violet/[0.08] text-violet",
  }[tone];
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", t, className)}>
      {title && <div className="font-medium">{title}</div>}
      {children && <div className={cn("text-fg-2", title && "mt-0.5")}>{children}</div>}
    </div>
  );
}

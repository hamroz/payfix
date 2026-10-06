"use client";

import { useInView, useReducedMotion } from "motion/react";
import {
  ArrowDownLeft,
  Check,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Link2,
  Lock,
  LockOpen,
  Pause,
  PenLine,
  Play,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { buttonClass } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n/messages";
import type { Translator } from "@/lib/i18n/translate";

/*
 * A short film of the demo scenario, drawn in code rather than shipped as a video file:
 * it renders instantly, stays sharp at any size, and follows the theme. Every frame is a
 * pure function of the playhead `t` (seconds), so pausing or jumping to a chapter shows
 * exactly the frame a video would. Amounts are whole dollars and purely cosmetic.
 */

const DURATION = 49;
/** Shown, fully composed, when the viewer prefers reduced motion and hasn't pressed play. */
const POSTER = 45;

type ChapterKey = keyof Messages["film"]["chapters"];

const CHAPTERS = (
  [
    { key: "invoices", start: 0 },
    { key: "payments", start: 4 },
    { key: "detect", start: 11, step: 1 },
    { key: "propose", start: 17, step: 2 },
    { key: "approve", start: 25.5, step: 3 },
    { key: "settle", start: 34.5, step: 4 },
    { key: "receipt", start: 41.5 },
  ] as { key: ChapterKey; start: number; step?: number }[]
).map((c, i, all) => ({ ...c, end: all[i + 1]?.start ?? DURATION }));

type Text = (i18n: Translator) => string;

const CAPTIONS: [number, Text][] = [
  [0, ({ m, t }) => t(m.film.captions.billed, { invoiceA: "$1,000", invoiceB: "$400" })],
  [4.4, ({ m, t }) => t(m.film.captions.firstPayment, { amount: "$600" })],
  [6.9, ({ m, t }) => t(m.film.captions.secondPayment, { amount: "$500" })],
  [11.2, ({ m, t }) => t(m.film.captions.settled, { amount: "$1,000" })],
  [13.8, ({ m, t }) => t(m.film.captions.flagged, { amount: "$100" })],
  [17.2, ({ m }) => m.film.captions.linkSent],
  [18.9, ({ m }) => m.film.captions.verifyCode],
  [20.8, ({ m, t }) => t(m.film.captions.proposeSplit, { applied: "$60", refund: "$40" })],
  [23.2, ({ m }) => m.film.captions.proveWallet],
  [25.7, ({ m }) => m.film.captions.approveFirst],
  [28.3, ({ m, t }) => t(m.film.captions.changeWallet, { version: "v2" })],
  [30, ({ m, t }) => t(m.film.captions.approvalVoid, { version: "v1" })],
  [31.7, ({ m, t }) => t(m.film.captions.approveSecond, { version: "v2" })],
  [34.7, ({ m, t }) => t(m.film.captions.runPlan, { amount: "$60" })],
  [35.9, ({ m, t }) => t(m.film.captions.signRefund, { amount: "$40" })],
  [37.6, ({ m }) => m.film.captions.refundConfirmed],
  [41.7, ({ m, t }) => t(m.film.captions.balanced, { received: "$1,100", invoice: "$1,000", applied: "$60", refund: "$40", unresolved: "$0" })],
  [44.2, ({ m }) => m.film.captions.receipt],
];

type Tone = "mint" | "violet" | "periwinkle";

/** Things that travel between the customer (0) and the business (1). */
const TRIPS: { at: number; d: number; from: number; to: number; label: Text; icon: LucideIcon; tone: Tone }[] = [
  { at: 1, d: 1.3, from: 1, to: 0, label: ({ m, p }) => p(m.film.trips.invoices, 2), icon: FileText, tone: "periwinkle" },
  { at: 4.6, d: 1.4, from: 0, to: 1, label: () => "$600", icon: CircleDollarSign, tone: "mint" },
  { at: 7, d: 1.4, from: 0, to: 1, label: () => "$500", icon: CircleDollarSign, tone: "mint" },
  { at: 17.3, d: 1.3, from: 1, to: 0, label: ({ m }) => m.film.trips.resolutionLink, icon: Link2, tone: "violet" },
  { at: 24.1, d: 1.2, from: 0, to: 1, label: ({ m, t }) => t(m.film.trips.proposal, { version: "v1" }), icon: PenLine, tone: "violet" },
  { at: 28.4, d: 1.1, from: 0, to: 1, label: ({ m, t }) => t(m.film.trips.proposal, { version: "v2" }), icon: PenLine, tone: "violet" },
  { at: 37.6, d: 1.4, from: 1, to: 0, label: ({ m, t }) => t(m.film.trips.refund, { amount: "$40" }), icon: CircleDollarSign, tone: "mint" },
  { at: 43.8, d: 1.1, from: 0.5, to: 0, label: ({ m }) => m.film.trips.receipt, icon: FileCheck2, tone: "mint" },
  { at: 43.8, d: 1.1, from: 0.5, to: 1, label: ({ m }) => m.film.trips.receipt, icon: FileCheck2, tone: "mint" },
];

// ---------------------------------------------------------------------------------------
// Timing helpers. `at` is an absolute time on the playhead; `d` a duration in seconds.

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const prog = (t: number, at: number, d = 0.5) => clamp((t - at) / d);
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const out3 = (x: number) => 1 - (1 - x) ** 3;
const inOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const back = (x: number) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
/** 0 → 1 → 0 over `d` seconds, for one-off pulses. */
const pulse = (t: number, at: number, d: number) => {
  const x = (t - at) / d;
  return x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0;
};

function rise(t: number, at: number, y = 10, d = 0.55): CSSProperties {
  const p = out3(prog(t, at, d));
  return { opacity: p, transform: `translate3d(0, ${(1 - p) * y}px, 0)` };
}

function popIn(t: number, at: number, from = 0.85, d = 0.45): CSSProperties {
  const x = prog(t, at, d);
  return { opacity: clamp(x * 2.5), transform: `scale(${lerp(from, 1, back(x))})` };
}

/** A button press: a quick squeeze. */
const press = (t: number, at: number): CSSProperties => ({ transform: `scale(${1 - 0.07 * pulse(t, at, 0.28)})` });

const HEX = "0123456789abcdef";
function scramble(t: number, at: number, d: number, from: string, to: string) {
  if (t < at) return from;
  const x = prog(t, at, d);
  if (x >= 1) return to;
  const settled = Math.floor(x * to.length);
  const frame = Math.floor(t * 24);
  return [...to].map((ch, i) => (i < settled || ch === "…" ? ch : HEX[(frame * 7 + i * 11) % 16])).join("");
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ---------------------------------------------------------------------------------------
// Small pieces.

const panel = "rounded-2xl border border-veil/[0.08] bg-ink-850/90 p-3.5 shadow-[var(--glass-shadow)] sm:p-4";

const chipTones = {
  mint: "border-mint/25 bg-mint/10 text-mint",
  amber: "border-amber/25 bg-amber/10 text-amber",
  violet: "border-violet/25 bg-violet/10 text-violet",
  rose: "border-rose/25 bg-rose/10 text-rose",
  neutral: "border-veil/10 bg-veil/[0.05] text-fg-3",
};

function Chip({ tone, icon: Icon, children, style }: { tone: keyof typeof chipTones; icon?: LucideIcon; children: ReactNode; style?: CSSProperties }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", chipTones[tone])} style={style}>
      {Icon && <Icon className="size-3" />}
      {children}
    </span>
  );
}

/** An empty ring that pops into a mint check at `at`. */
function Tick({ t, at }: { t: number; at: number }) {
  const x = prog(t, at, 0.4);
  return (
    <span className="relative grid size-4 shrink-0 place-items-center rounded-full border border-veil/15">
      <span
        className="absolute -inset-px grid place-items-center rounded-full bg-mint text-ink-900"
        style={{ opacity: clamp(x * 3), transform: `scale(${lerp(0.4, 1, back(x))})` }}
      >
        <Check className="size-2.5" strokeWidth={3.5} />
      </span>
    </span>
  );
}

function Spinner({ t, className }: { t: number; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("size-4", className)} style={{ transform: `rotate(${t * 420}deg)` }}>
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.2" />
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="var(--violet)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="13 50" />
    </svg>
  );
}

function Ring({ value }: { value: number }) {
  const c = 2 * Math.PI * 7.5;
  return (
    <svg viewBox="0 0 20 20" className="size-4 -rotate-90">
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.2" />
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="var(--violet)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
    </svg>
  );
}

/** Stack children in one grid cell so phases can crossfade without layout jumps. */
const stack = "grid [&>*]:col-start-1 [&>*]:row-start-1";

// ---------------------------------------------------------------------------------------
// The two parties and the rail between them.

function Actor({ t, side, name, role, initials, className }: { t: number; side: 0 | 1; name: string; role: string; initials: string; className: string }) {
  const bump = TRIPS.reduce((m, trip) => (trip.to === side ? Math.max(m, pulse(t, trip.at + trip.d - 0.1, 0.7)) : m), 0);
  const done = prog(t, 44.8, 0.4);
  return (
    <div className={cn("relative z-0 flex min-w-0 items-center gap-2 sm:gap-2.5", side === 1 && "flex-row-reverse text-right")}>
      <div
        className={cn("relative grid size-[var(--av)] shrink-0 place-items-center rounded-xl font-display text-[12px] font-semibold sm:text-[13px]", className)}
        style={{
          transform: `scale(${1 + bump * 0.1})`,
          boxShadow: `0 0 0 ${bump * 7}px color-mix(in srgb, var(--violet) ${Math.round(bump * 22)}%, transparent)`,
        }}
      >
        {initials}
        <span
          className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-mint text-ink-900 ring-2 ring-ink-900"
          style={{ opacity: clamp(done * 3), transform: `scale(${done === 0 ? 0.3 : lerp(0.3, 1, back(done))})` }}
        >
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-medium text-fg sm:text-[13px]">{name}</div>
        <div className="hidden text-[11px] text-fg-3 sm:block">{role}</div>
      </div>
    </div>
  );
}

const toneVar: Record<Tone, string> = { mint: "var(--mint)", violet: "var(--violet)", periwinkle: "var(--periwinkle)" };

function Trips({ t }: { t: number }) {
  const i18n = useI18n();
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {TRIPS.map((trip, i) => {
        const p = (t - trip.at) / trip.d;
        if (p <= 0 || p >= 1) return null;
        const x = lerp(trip.from, trip.to, inOut(p));
        const fade = Math.min(clamp(p / 0.12), clamp((1 - p) / 0.2));
        const color = toneVar[trip.tone];
        const lo = Math.min(trip.from, x);
        const hi = Math.max(trip.from, x);
        const Icon = trip.icon;
        return (
          <div key={i}>
            {/* The rail lights up behind the traveller. */}
            <div
              className="absolute top-1/2 h-px -translate-y-1/2"
              style={{
                left: `calc(var(--av) / 2 + (100% - var(--av)) * ${lo})`,
                width: `calc((100% - var(--av)) * ${hi - lo})`,
                background: `linear-gradient(${x > trip.from ? 90 : 270}deg, transparent, ${color})`,
                opacity: fade * 0.8,
              }}
            />
            <div
              className="absolute top-1/2"
              style={{
                left: `calc(var(--av) / 2 + (100% - var(--av)) * ${x})`,
                opacity: fade,
                transform: `translate(-50%, calc(-50% - ${Math.sin(Math.PI * p) * 7}px)) scale(${lerp(0.7, 1, fade)})`,
              }}
            >
              <span
                className="tabular flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-ink-850 px-2.5 py-1 text-[11.5px] font-semibold sm:text-xs"
                style={{
                  color,
                  borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
                  boxShadow: `0 8px 26px -10px color-mix(in srgb, ${color} 80%, transparent)`,
                }}
              >
                <Icon className="size-3.5" />
                {trip.label(i18n)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Strip({ t }: { t: number }) {
  const { m } = useI18n();
  return (
    <div className="relative flex items-center gap-3 [--av:32px] sm:gap-4 sm:[--av:40px]">
      <Actor t={t} side={0} name="Acme Robotics" role={m.common.customer} initials="AR" className="bg-indigo/15 text-periwinkle" />
      <div className="relative flex-1">
        <div className="border-t border-dashed border-veil/15" />
        <div className="absolute inset-x-0 top-2 hidden text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fg-3/80 md:block">{m.film.rail}</div>
      </div>
      <Actor t={t} side={1} name="Lumen Studio" role={m.common.business} initials="LS" className="bg-violet/15 text-violet" />
      <Trips t={t} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// Scenes. Each receives the global playhead and uses absolute times from the script.

function InvoicesScene({ t }: { t: number }) {
  const { m, t: tr, rich } = useI18n();
  const f = m.film.invoices;
  const invoices = [
    { id: "INV-0001", label: "Website redesign", amount: "$1,000.00", at: 0.35 },
    { id: "INV-0002", label: "October retainer", amount: "$400.00", at: 0.6 },
  ];
  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {invoices.map((inv) => (
          <div key={inv.id} className={panel} style={rise(t, inv.at, 18, 0.7)}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-fg-2 sm:text-[12px]">
                <FileText className="size-3.5 text-periwinkle" />
                {inv.id}
              </span>
              <span className="hidden sm:inline">
                <Chip tone="neutral">{f.open}</Chip>
              </span>
            </div>
            <div className="mt-3 truncate text-[12px] text-fg-3 sm:text-[13px]">{inv.label}</div>
            <div className="tabular mt-0.5 font-display text-lg font-semibold sm:text-2xl">{inv.amount}</div>
            <div className="mt-2 text-[11px] text-fg-3">{tr(f.billedTo, { customer: "Acme Robotics" })}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-[12px] text-fg-3" style={rise(t, 1.4)}>
        {rich(f.totalDue, { amount: (c) => <span className="tabular font-medium text-fg-2">{c}</span> }, { amount: "$1,400" })}
      </div>
    </div>
  );
}

const TRANSFERS = [
  { amount: "$600.00", sig: "5Gh2…kQ9e", arrive: 6.0 },
  { amount: "$500.00", sig: "3nWx…Lp4c", arrive: 8.4 },
];
const CHECKS = ["mint", "amount", "recipient", "finalized"] as const;

function PaymentsScene({ t }: { t: number }) {
  const { m, t: tr } = useI18n();
  const f = m.film.payments;
  return (
    <div className={cn(panel, "mx-auto w-full max-w-[28rem]")}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium">{tr(f.incomingTo, { business: "Lumen Studio" })}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-fg-3">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint" />
            <span className="relative size-1.5 rounded-full bg-mint" />
          </span>
          {f.watching}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {TRANSFERS.map((x) => (
          <div key={x.sig} className={stack}>
            <div className="flex items-center rounded-xl border border-dashed border-veil/10 px-3 text-[12px] text-fg-3" style={{ opacity: 1 - prog(t, x.arrive, 0.4) }}>
              {f.waiting}
            </div>
            <div className="rounded-xl border border-veil/[0.07] bg-veil/[0.03] px-3 py-2.5" style={rise(t, x.arrive, 8)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-mint/10 text-mint">
                    <ArrowDownLeft className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="tabular font-display text-sm font-semibold">{x.amount}</div>
                    <div className="truncate font-mono text-[10.5px] text-fg-3">{tr(f.reference, { signature: x.sig, invoice: "INV-0001" })}</div>
                  </div>
                </div>
                <Chip tone="mint" icon={ShieldCheck} style={popIn(t, x.arrive + 1.1)}>
                  {f.verified}
                </Chip>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                {CHECKS.map((c, i) => (
                  <span key={c} className="flex items-center gap-1.5 text-[11px] text-fg-3">
                    <Tick t={t} at={x.arrive + 0.3 + i * 0.17} />
                    {f.checks[c]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetectScene({ t }: { t: number }) {
  const { m, t: tr } = useI18n();
  const f = m.film.detect;
  const received = 600 * inOut(prog(t, 11.6, 0.9)) + 500 * inOut(prog(t, 12.9, 0.8));
  const applied = Math.min(received, 1000);
  const excess = received - applied;
  const status =
    t < 11.6 ? { tone: "neutral" as const, label: f.open, at: 11 } : t < 13.4 ? { tone: "amber" as const, label: f.partiallyPaid, at: 11.6 } : { tone: "mint" as const, label: f.paid, at: 13.4 };
  return (
    <div className="mx-auto w-full max-w-[28rem]">
      <div className={panel}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-fg-2">
            <FileText className="size-3.5 text-periwinkle" />
            INV-0001
          </span>
          <Chip tone={status.tone} style={popIn(t, status.at)}>
            {status.label}
          </Chip>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-fg-3">{f.received}</div>
            <div className="tabular font-display text-lg font-semibold sm:text-xl">{usd(received)}</div>
          </div>
          <div>
            <div className="text-[11px] text-fg-3">{f.applied}</div>
            <div className="tabular font-display text-lg font-semibold sm:text-xl">
              {usd(applied)}
              <span className="text-[13px] font-normal text-fg-3"> / $1,000</span>
            </div>
          </div>
        </div>
        <div className="relative mt-3">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-veil/[0.06]">
            <div className="h-full bg-[linear-gradient(90deg,var(--indigo),var(--violet))]" style={{ width: `${(applied / 1100) * 100}%` }} />
            <div className="h-full bg-amber" style={{ width: `${(excess / 1100) * 100}%` }} />
          </div>
          <div className="absolute -bottom-1 -top-1 w-px bg-fg-3/60" style={{ left: `${(1000 / 1100) * 100}%` }} />
          <div className="mt-1.5 text-right text-[10.5px] text-fg-3" style={{ marginRight: `${(100 / 1100) * 100}%` }}>
            {tr(f.due, { amount: "$1,000" })}
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-amber/25 bg-ink-850/90 px-3.5 py-2.5" style={popIn(t, 13.9, 0.9)}>
        <span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-amber/15 text-amber">
          <span className="absolute inset-0 animate-pulse-ring rounded-lg bg-amber/30" />
          <Sparkles className="relative size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="tabular text-sm font-semibold text-amber">{tr(f.excess, { amount: "$100" })}</div>
          <div className="truncate text-[11.5px] text-fg-3">{f.excessNote}</div>
        </div>
        <Chip tone="amber">{f.flagged}</Chip>
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[11.5px] text-fg-3" style={rise(t, 14.6, 6)}>
        <span className="font-mono">INV-0002 · October retainer</span>
        <span className="tabular">{tr(f.stillOpen, { amount: "$400" })}</span>
      </div>
    </div>
  );
}

const CODE = ["4", "8", "2", "9", "1", "3"];

function ProposeScene({ t }: { t: number }) {
  const { m, t: tr, rich } = useI18n();
  const f = m.film.propose;
  const verify = out3(prog(t, 18.7, 0.4)) * (1 - inOut(prog(t, 20.45, 0.35)));
  const split = out3(prog(t, 20.8, 0.45));
  const sent = t >= 24.05;
  return (
    <div className={cn(panel, "mx-auto w-full max-w-[28rem] overflow-hidden p-0 sm:p-0")}>
      <div className="flex items-center gap-2 border-b border-veil/[0.06] px-3 py-2">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-veil/15" />
          ))}
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-veil/[0.05] px-2 py-0.5 font-mono text-[10.5px] text-fg-3">
          <Lock className="size-3" />
          payfix · /r/7Qx2Fm
        </span>
        <span className="w-8" />
      </div>
      <div className={cn(stack, "p-3.5 sm:p-4")}>
        <div style={{ opacity: verify, transform: `translateY(${(1 - verify) * -6}px)` }}>
          <div className="text-[13px] font-medium">{f.verifyTitle}</div>
          <div className="mt-0.5 text-[11.5px] text-fg-3">{tr(f.codeSent, { customer: "Acme Robotics" })}</div>
          <div className="mt-3 flex gap-1.5">
            {CODE.map((d, i) => {
              const x = prog(t, 19.1 + i * 0.16, 0.22);
              return (
                <span
                  key={i}
                  className={cn("grid h-10 flex-1 place-items-center rounded-lg border font-mono text-base", x > 0 ? "border-violet/50 bg-violet/[0.06]" : "border-veil/10")}
                >
                  <span style={{ opacity: x, transform: `translateY(${(1 - x) * 6}px)` }}>{d}</span>
                </span>
              );
            })}
          </div>
          <div className="mt-3">
            <Chip tone="mint" icon={Check} style={popIn(t, 20.15)}>
              {f.verified}
            </Chip>
          </div>
        </div>
        <div style={{ opacity: split, transform: `translateY(${(1 - split) * 8}px)` }}>
          <div className="text-[13px] font-medium">{rich(f.question, { amount: (c) => <span className="tabular">{c}</span> }, { amount: "$100" })}</div>
          <div className="mt-3 flex h-2.5 gap-1 overflow-hidden rounded-full bg-veil/[0.06]">
            <div className="h-full rounded-full bg-violet" style={{ width: `${60 * out3(prog(t, 21.1, 0.8))}%` }} />
            <div className="h-full rounded-full bg-mint" style={{ width: `${40 * out3(prog(t, 21.5, 0.8))}%` }} />
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { dot: "bg-violet", label: tr(f.applyTo, { invoice: "INV-0002" }), amount: "$60", at: 21.9 },
              { dot: "bg-mint", label: rich(f.refundTo, { address: (c) => <span className="font-mono text-[11.5px]">{c}</span> }, { address: "7xKX…9fQd" }), amount: "$40", at: 22.2 },
            ].map((row) => (
              <div key={row.amount} className="flex items-center justify-between rounded-lg bg-veil/[0.03] px-2.5 py-1.5 text-[12.5px]" style={rise(t, row.at, 6)}>
                <span className="flex items-center gap-2 text-fg-2">
                  <span className={cn("size-2 rounded-full", row.dot)} />
                  {row.label}
                </span>
                <span className="tabular font-semibold">{row.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Chip tone="mint" icon={PenLine} style={popIn(t, 23.3)}>
              {f.walletProven}
            </Chip>
            <span className={buttonClass("primary", "sm", "pointer-events-none transition-none")} style={{ ...rise(t, 22.6, 6), ...press(t, 23.9) }}>
              {sent ? (
                <>
                  <Check className="size-3.5" /> {f.sent}
                </>
              ) : (
                f.submit
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stamp({ tone, icon: Icon, title, sub, style }: { tone: "mint" | "rose" | "neutral"; icon: LucideIcon; title: ReactNode; sub: ReactNode; style?: CSSProperties }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2", chipTones[tone])} style={style}>
      <Icon className="size-4 shrink-0" />
      <div className="min-w-0">
        <div className="truncate text-[12.5px] font-medium">{title}</div>
        <div className="truncate font-mono text-[10.5px] text-fg-3">{sub}</div>
      </div>
    </div>
  );
}

function ApproveScene({ t }: { t: number }) {
  const { m, t: tr, rich } = useI18n();
  const f = m.film.approve;
  const v2 = t >= 29.5;
  const hash = scramble(t, 29.5, 0.6, "9c41…e2a7", "3b7a…d04f");
  const morph = out3(prog(t, 29.5, 0.5));
  const flash = 1 - prog(t, 29.9, 1.6);

  const stamp =
    t < 27.1 ? (
      <Stamp tone="neutral" icon={ShieldCheck} title={f.awaiting} sub={f.nothingRuns} />
    ) : t < 30 ? (
      <Stamp tone="mint" icon={ShieldCheck} title={tr(f.approved, { version: "v1" })} sub={tr(f.boundTo, { hash: "9c41…e2a7" })} style={popIn(t, 27.1, 0.9)} />
    ) : t < 32.4 ? (
      <Stamp
        tone="rose"
        icon={ShieldX}
        title={rich(f.void, { old: (c) => <span className="line-through decoration-rose/60">{c}</span> }, { version: "v1" })}
        sub={f.voidReason}
        style={popIn(t, 30, 0.9)}
      />
    ) : (
      <Stamp tone="mint" icon={ShieldCheck} title={tr(f.approved, { version: "v2" })} sub={tr(f.boundTo, { hash: "3b7a…d04f" })} style={popIn(t, 32.4, 0.9)} />
    );
  const button =
    t < 27.1
      ? { label: tr(f.approveButton, { version: "v1" }), at: 26.2, press: 26.85 }
      : t >= 30.4 && t < 32.4
        ? { label: tr(f.approveButton, { version: "v2" }), at: 31.4, press: 32.15 }
        : null;
  const exec =
    t < 27.1 ? <Chip tone="neutral" icon={Lock}>{f.needsApproval}</Chip>
    : t < 30.3 ? <Chip tone="mint" icon={LockOpen} style={popIn(t, 27.3)}>{f.readyToRun}</Chip>
    : t < 32.4 ? <Chip tone="amber" icon={Lock} style={popIn(t, 30.3)}>{f.blocked}</Chip>
    : <Chip tone="mint" icon={LockOpen} style={popIn(t, 32.6)}>{f.readyToRun}</Chip>;

  return (
    <div className={cn(panel, "mx-auto w-full max-w-[28rem]")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium">{f.proposal}</span>
          <span className="rounded-md bg-violet/10 px-1.5 py-0.5 font-mono text-[11px] text-violet" style={v2 ? popIn(t, 29.5, 0.6) : undefined}>
            {v2 ? "v2" : "v1"}
          </span>
        </div>
        <span className="font-mono text-[11px] text-fg-3">
          sha256 <span className={cn(t >= 29.5 && t < 30.1 && "text-violet")}>{hash}</span>
        </span>
      </div>
      <div className="mt-3 space-y-1.5" style={rise(t, 25.9, 6)}>
        <div className="flex items-center justify-between rounded-lg bg-veil/[0.03] px-2.5 py-1.5 text-[12.5px]">
          <span className="flex items-center gap-2 text-fg-2">
            <span className="size-2 rounded-full bg-violet" />
            {tr(m.film.propose.applyTo, { invoice: "INV-0002" })}
          </span>
          <span className="tabular font-semibold">$60</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-veil/[0.03] px-2.5 py-1.5 text-[12.5px]">
          <span className="flex items-center gap-2 text-fg-2">
            <span className="size-2 rounded-full bg-mint" />
            {rich(
              m.film.propose.refundTo,
              {
                address: () => (
                  <span className={cn(stack, "font-mono text-[11.5px]")}>
                    <span style={{ opacity: 1 - morph, transform: `translateY(${-morph * 6}px)` }}>7xKX…9fQd</span>
                    <span
                      className="-mx-1 rounded px-1 text-violet"
                      style={{ opacity: morph, transform: `translateY(${(1 - morph) * 6}px)`, backgroundColor: `color-mix(in srgb, var(--violet) ${Math.round(18 * flash)}%, transparent)` }}
                    >
                      9pLm…3hVw
                    </span>
                  </span>
                ),
              },
              { address: "9pLm…3hVw" },
            )}
          </span>
          <span className="tabular font-semibold">$40</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2" style={rise(t, 26.1, 6)}>
        <div className="min-w-0 flex-1">{stamp}</div>
        {button && (
          <span className={buttonClass("primary", "sm", "pointer-events-none shrink-0 transition-none")} style={{ ...popIn(t, button.at, 0.9), ...press(t, button.press) }}>
            {button.label}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-veil/[0.06] pt-3 text-[12px] text-fg-3" style={rise(t, 26.3, 6)}>
        <span>{f.execution}</span>
        {exec}
      </div>
    </div>
  );
}

function SettleStep({ t, start, done, title, children }: { t: number; start: number; done: number; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex gap-3" style={{ opacity: t < start ? 0.45 : 1 }}>
      <div className="grid size-5 shrink-0 place-items-center pt-0.5">
        {t < start ? (
          <span className="size-3.5 rounded-full border border-dashed border-veil/25" />
        ) : t < done ? (
          <Spinner t={t} className="text-fg-3" />
        ) : (
          <Tick t={t} at={done} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium text-fg">{title}</div>
        {children}
      </div>
    </div>
  );
}

function SettleScene({ t }: { t: number }) {
  const { m, t: tr, rich } = useI18n();
  const f = m.film.settle;
  const remaining = 400 - 60 * inOut(prog(t, 35.0, 0.6));
  const unresolved = 100 - 60 * inOut(prog(t, 35.0, 0.6)) - 40 * inOut(prog(t, 38.7, 0.5));
  const complete = t >= 39.9;
  const signing = prog(t, 36.2, 1.2);
  return (
    <div className={cn(panel, "mx-auto w-full max-w-[28rem]")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium">{rich(f.plan, { version: (c) => <span className="font-mono text-violet">{c}</span> }, { version: "v2" })}</span>
        {complete ? (
          <Chip tone="mint" icon={Check} style={popIn(t, 39.9)}>
            {f.complete}
          </Chip>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-fg-3">
            <Spinner t={t} className="size-3.5" /> {f.running}
          </span>
        )}
      </div>
      <div className="mt-3.5 space-y-3">
        <SettleStep t={t} start={34.9} done={35.6} title={tr(f.applyStep, { amount: "$60", invoice: "INV-0002" })}>
          <div className="tabular text-[11.5px] text-fg-3">{tr(f.remaining, { invoice: "INV-0002", amount: usd(remaining) })}</div>
        </SettleStep>
        <SettleStep t={t} start={35.9} done={39.0} title={rich(f.refundStep, { address: (c) => <span className="font-mono text-[11.5px]">{c}</span> }, { amount: "$40", address: "9pLm…3hVw" })}
        >
          <div className={cn(stack, "mt-1.5")}>
            <div
              className="flex items-center gap-2 rounded-lg border border-violet/20 bg-violet/[0.06] px-2.5 py-1.5"
              style={{ opacity: out3(prog(t, 36.0, 0.3)) * (1 - prog(t, 38.9, 0.3)) }}
            >
              <Wallet className="size-3.5 shrink-0 text-violet" />
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-fg-2">
                {t < 37.4 ? f.signPrompt : t < 37.6 ? f.signedBy : f.broadcasting}
              </span>
              {t < 37.4 ? <Ring value={signing} /> : t < 37.6 ? <Tick t={t} at={37.4} /> : <Spinner t={t} className="text-fg-3" />}
            </div>
            <div className="flex items-center gap-2 py-1.5 text-[11.5px] text-fg-3" style={rise(t, 39.0, 6)}>
              <span className="text-mint">{f.confirmed}</span>
              <span className="font-mono">4kVd…Tz8w</span>
            </div>
          </div>
        </SettleStep>
        <SettleStep t={t} start={34.9} done={39.3} title={f.unresolvedStep}>
          <div className="tabular text-[11.5px] text-fg-3">
            {rich(f.unresolvedOf, { amount: (c) => <span className={cn(unresolved < 0.5 && "text-mint")}>{c}</span> }, { amount: usd(unresolved), total: "$100" })}
          </div>
        </SettleStep>
      </div>
    </div>
  );
}

function ReceiptScene({ t }: { t: number }) {
  const { m, t: tr } = useI18n();
  const f = m.film.receipt;
  const parts = [
    { key: "a", label: "INV-0001", amount: "$1,000", pct: (1000 / 1100) * 100, at: 42.0, d: 0.8, color: "bg-[linear-gradient(90deg,var(--indigo),var(--violet))]", dot: "bg-indigo" },
    { key: "b", label: "INV-0002", amount: "$60", pct: (60 / 1100) * 100, at: 42.75, d: 0.4, color: "bg-violet", dot: "bg-violet" },
    { key: "r", label: f.refunded, amount: "$40", pct: (40 / 1100) * 100, at: 43.1, d: 0.4, color: "bg-mint", dot: "bg-mint" },
  ];
  return (
    <div className="mx-auto w-full max-w-[28rem]">
      <div className={panel} style={popIn(t, 41.55, 0.94, 0.6)}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[13px] font-medium">
            <LogoMark size={18} />
            {f.title}
          </span>
          <span className="font-mono text-[11px] text-fg-3">{f.sameForBoth}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3" style={rise(t, 41.8, 6)}>
          <span className="tabular font-display text-lg font-semibold sm:text-xl">{tr(f.received, { amount: "$1,100" })}</span>
          <span className="tabular text-[12px] text-fg-3">{tr(f.equation, { invoice: "$1,000", applied: "$60", refund: "$40" })}</span>
        </div>
        <div className="mt-3 flex h-2.5 gap-1 overflow-hidden rounded-full bg-veil/[0.06]">
          {parts.map((p) => (
            <div key={p.key} className={cn("h-full rounded-full", p.color)} style={{ width: `${p.pct * out3(prog(t, p.at, p.d))}%` }} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {parts.map((p) => (
            <div key={p.key} className="rounded-lg bg-veil/[0.03] px-2 py-1.5" style={rise(t, p.at + 0.1, 6)}>
              <div className="flex items-center gap-1.5 text-[10.5px] text-fg-3">
                <span className={cn("size-1.5 rounded-full", p.dot)} />
                {p.label}
              </div>
              <div className="tabular font-display text-[13px] font-semibold sm:text-sm">{p.amount}</div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between rounded-xl border border-mint/20 bg-mint/[0.07] px-3 py-2" style={popIn(t, 43.6, 0.9)}>
          <span className="text-[12.5px] text-fg-2">{f.unresolved}</span>
          <span className="tabular flex items-center gap-1.5 font-display text-sm font-semibold text-mint">
            <Check className="size-4" strokeWidth={3} /> $0
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 font-display text-[15px] font-semibold tracking-tight sm:text-base" style={rise(t, 45.6, 8, 0.8)}>
        <LogoMark size={20} />
        {m.landing.hero.titleLead} <span className="text-gradient">{m.landing.hero.titleAccent}</span>
      </div>
    </div>
  );
}

const SCENES = [InvoicesScene, PaymentsScene, DetectScene, ProposeScene, ApproveScene, SettleScene, ReceiptScene];

function Scene({ t, index, children }: { t: number; index: number; children: ReactNode }) {
  const { m, t: tr } = useI18n();
  const c = CHAPTERS[index];
  const enter = c.start === 0 ? 1 : out3(prog(t, c.start, 0.45));
  const exit = inOut(prog(t, c.end - 0.45, 0.45));
  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{ opacity: enter * (1 - exit), transform: `translate3d(0, ${(1 - enter) * 14 - exit * 10}px, 0) scale(${1 - exit * 0.03})` }}
    >
      <div className="mb-2.5 text-center text-[10.5px] font-medium uppercase tracking-[0.18em] text-fg-3 sm:mb-3" style={rise(t, c.start + 0.05, 4, 0.4)}>
        {c.step ? <span className="text-violet">{tr(m.film.step, { number: `0${c.step}` })} · </span> : null}
        {m.film.chapters[c.key]}
      </div>
      {children}
    </div>
  );
}

function Caption({ t }: { t: number }) {
  const i18n = useI18n();
  let i = 0;
  while (i + 1 < CAPTIONS.length && CAPTIONS[i + 1][0] <= t) i++;
  const [at, text] = CAPTIONS[i];
  const next = CAPTIONS[i + 1]?.[0] ?? DURATION;
  const p = out3(prog(t, at, 0.35));
  const o = p * (1 - prog(t, next - 0.18, 0.18));
  return (
    <div className="flex min-h-[2.75rem] items-end justify-center pt-2 sm:min-h-[2.5rem]">
      <p className="max-w-xl text-balance text-center text-[12.5px] leading-snug text-fg-2 sm:text-sm" style={{ opacity: o, transform: `translateY(${(1 - p) * 5}px)` }}>
        {text(i18n)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------

export function ProcessFilm() {
  const i18n = useI18n();
  const { m, t: tr } = i18n;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);

  // Autoplay while on screen, unless the viewer prefers reduced motion or paused it.
  const wantPlay = choice ? choice === "play" : !reduce;
  const running = wantPlay && inView;
  const time = choice === null && reduce ? POSTER : t;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      // Keep real time on throttled frames, but don't skip ahead when a hidden tab returns.
      if (last !== null) {
        const dt = Math.min(1, (now - last) / 1000);
        setT((v) => (v + dt) % DURATION);
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const toggle = () => setChoice(wantPlay ? "pause" : "play");
  const seek = (i: number) => {
    setT(CHAPTERS[i].start);
    setChoice("play");
  };

  let active = 0;
  while (active + 1 < CHAPTERS.length && CHAPTERS[active + 1].start <= time) active++;

  return (
    <figure ref={ref} className="glass overflow-hidden rounded-3xl p-2 sm:p-2.5">
      <figcaption className="sr-only">
        {tr(m.film.player.description, { captions: CAPTIONS.map(([, text]) => text(i18n)).join(" ") })}
      </figcaption>
      <div
        aria-hidden
        onClick={toggle}
        className="relative aspect-[3/4] cursor-pointer select-none overflow-hidden rounded-[18px] border border-veil/[0.06] bg-ink-950/60 sm:aspect-[4/3] md:aspect-[16/10] lg:aspect-video"
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(var(--backdrop-dots) 1px, transparent 1.2px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 80%)",
          }}
        />
        <div className="absolute -left-1/4 -top-1/3 size-[80%] bg-[radial-gradient(closest-side,var(--backdrop-glow-a),transparent)]" />
        <div className="absolute -bottom-1/3 -right-1/4 size-[80%] bg-[radial-gradient(closest-side,var(--backdrop-glow-b),transparent)]" />

        <div className="relative flex h-full flex-col p-3.5 sm:p-5 lg:p-7">
          <Strip t={time} />
          <div className="relative flex-1">
            {SCENES.map((S, i) =>
              time >= CHAPTERS[i].start && time < CHAPTERS[i].end ? (
                <Scene key={i} t={time} index={i}>
                  <S t={time} />
                </Scene>
              ) : null,
            )}
          </div>
          <Caption t={time} />
        </div>

        {!wantPlay && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/25">
            <span className="grid size-16 place-items-center rounded-full bg-[linear-gradient(135deg,#6366F1,#8B5CF6_55%,#A78BFA)] text-white shadow-[0_10px_40px_-8px_rgba(124,92,246,0.9)]">
              <Play className="size-6 translate-x-0.5" fill="currentColor" />
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-1.5 pb-0.5 pt-2.5 sm:gap-4 sm:px-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={wantPlay ? m.film.player.pause : m.film.player.play}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-veil/[0.06] text-fg transition hover:bg-veil/[0.1]"
        >
          {wantPlay ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4 translate-x-px" fill="currentColor" />}
        </button>
        <div className="flex min-w-0 flex-1 gap-1">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.key}
              type="button"
              title={m.film.chapters[c.key]}
              onClick={() => seek(i)}
              aria-label={tr(m.film.player.playFrom, { chapter: m.film.chapters[c.key] })}
              aria-current={i === active ? "step" : undefined}
              className="group flex h-9 min-w-0 basis-0 items-center"
              style={{ flexGrow: c.end - c.start }}
            >
              <span className="relative h-1 w-full overflow-hidden rounded-full bg-veil/10 transition-[height] duration-150 group-hover:h-1.5">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--indigo),var(--violet))]"
                  style={{ width: `${clamp((time - c.start) / (c.end - c.start)) * 100}%` }}
                />
              </span>
            </button>
          ))}
        </div>
        <span className="shrink-0 text-[11px] text-fg-3">
          <span className="font-medium text-fg-2">{m.film.chapters[CHAPTERS[active].key]}</span>
          <span className="tabular hidden font-mono sm:inline">
            {" "}
            · {clock(time)} / {clock(DURATION)}
          </span>
        </span>
      </div>
    </figure>
  );
}

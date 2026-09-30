import Link from "next/link";
import { ArrowRight, BadgeCheck, FileCheck2, GitCompareArrows, Link2, Radar, RotateCcw, ShieldCheck, Wallet } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { ButtonLink } from "@/components/ui/primitives";
import { Spotlight } from "@/components/ui/interactive";
import { env } from "@/lib/env";

const steps = [
  { icon: Radar, title: "Detect", body: "Every transfer to your wallet is verified on Solana — mint, amount, recipient, confirmation — and matched to its invoice. Overpayments, duplicates, and unreferenced transfers land in one inbox." },
  { icon: Link2, title: "Propose", body: "Your customer gets one secure link. They choose where the extra goes: another invoice, credit, a refund, or a split. Refund wallets are proven by signature." },
  { icon: BadgeCheck, title: "Approve", body: "You approve the exact version. Change an amount, an invoice, or the destination and the approval is void until you approve again." },
  { icon: RotateCcw, title: "Settle", body: "You sign the refund from your own wallet. Allocations post, the refund confirms on chain, and both sides get the same receipt." },
];

const guarantees = [
  { icon: GitCompareArrows, title: "Never double-counted", body: "Each on-chain signature is claimed once. Re-syncing, retries, and restarts can't inflate what you received." },
  { icon: ShieldCheck, title: "Approval bound to a hash", body: "Approvals cover amounts, invoices, and destination. Any edit creates a new version that needs its own approval." },
  { icon: Wallet, title: "One refund in flight", body: "PayFix records a refund's signature before broadcasting and only allows a retry after its blockhash expires unlanded." },
  { icon: FileCheck2, title: "Every dollar explained", body: "A double-entry ledger in exact token units. Received always equals applied + credit + refunded + pending + unresolved." },
];

export default function Home() {
  const { SOLANA_CLUSTER } = env();
  return (
    <div className="relative">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo size={30} />
        <nav className="flex items-center gap-2">
          <Link href="#how" className="hidden rounded-lg px-3 py-2 text-sm text-fg-2 transition hover:text-fg sm:block">
            How it works
          </Link>
          <ButtonLink href="/login" variant="secondary" size="sm">
            Sign in
          </ButtonLink>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div>
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-3 text-xs text-fg-2">
                <span className="rounded-full bg-[linear-gradient(135deg,#6366F1,#A78BFA)] px-2 py-0.5 text-[11px] font-medium text-white">
                  {SOLANA_CLUSTER === "simulated" ? "Simulated chain" : `Solana ${SOLANA_CLUSTER}`}
                </span>
                USDC payment resolution for agencies
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[68px]">
                Wrong payments,
                <br />
                <span className="text-gradient">made right.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-2">
                When a client overpays, pays twice, or sends USDC without a reference, PayFix turns it into an agreed, completed settlement — through one shared link both sides can trust.
              </p>
            </FadeIn>
            <FadeIn delay={0.24} className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/login" size="lg">
                Open the demo workspace <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="#how" variant="secondary" size="lg">
                See how it works
              </ButtonLink>
            </FadeIn>
            <FadeIn delay={0.32}>
              <p className="mt-6 text-xs text-fg-3">
                Demo uses a clearly labeled test token, never real funds. <span className="text-fg-2">$1,100 received = $1,000 + $60 + $40.</span>
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.2} y={20}>
            <HeroDemo />
          </FadeIn>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-10 px-5 pb-24 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet">The resolution loop</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">From “you sent too much” to settled, in four steps.</h2>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <Spotlight className="h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-violet">
                      <s.icon className="size-[18px]" />
                    </span>
                    <span className="font-mono text-xs text-fg-3">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-2">{s.body}</p>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
            <div className="absolute -right-24 -top-24 opacity-[0.07]">
              <LogoMark size={360} />
            </div>
            <div className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-mint">Built for money</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Controls a finance team would sign off on.</h2>
                <p className="mt-4 text-sm leading-relaxed text-fg-2">
                  Solana gives us verifiable incoming payments and merchant-signed refunds. PayFix adds the part in between: agreement, authorization, and a ledger that always balances.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {guarantees.map((g) => (
                  <div key={g.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <g.icon className="size-5 text-mint" />
                    <h3 className="mt-3 text-sm font-semibold text-fg">{g.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-fg-3">{g.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-white/[0.06] px-5 py-8 text-xs text-fg-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo size={20} />
        <p>Hackathon prototype. Test tokens only; not for customer funds. PayFix can’t see refunds sent outside the app.</p>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, BadgeCheck, FileCheck2, GitCompareArrows, Link2, Radar, RotateCcw, ShieldCheck, Wallet } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { ProcessFilm } from "@/components/marketing/process-film";
import { SiteFooter } from "@/components/marketing/site-footer";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { ButtonLink } from "@/components/ui/primitives";
import { Spotlight } from "@/components/ui/interactive";
import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { ThemeToggle } from "@/components/theme/theme";

const steps = [
  { key: "detect", icon: Radar },
  { key: "propose", icon: Link2 },
  { key: "approve", icon: BadgeCheck },
  { key: "settle", icon: RotateCcw },
] as const;

const guarantees = [
  { key: "neverDoubleCounted", icon: GitCompareArrows },
  { key: "hashBound", icon: ShieldCheck },
  { key: "oneRefund", icon: Wallet },
  { key: "everyDollar", icon: FileCheck2 },
] as const;

// The network badge reflects runtime config, so don't bake it in at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { m, t } = await getI18n();
  const l = m.landing;
  const { SOLANA_CLUSTER, DEMO_MODE, DEMO_URL } = env();
  // The production site sends visitors to the separate devnet demo; the demo site signs them in.
  const demoHref = DEMO_MODE ? "/login" : DEMO_URL;
  return (
    <div className="relative overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo size={30} />
        <nav className="flex items-center gap-2">
          <Link href="#how" className="hidden rounded-lg px-3 py-2 text-sm text-fg-2 transition hover:text-fg sm:block">
            {l.nav.howItWorks}
          </Link>
          <LanguageSwitcher compact />
          <ThemeToggle />
          <ButtonLink href="/login" variant="secondary" size="sm">
            {l.nav.signIn}
          </ButtonLink>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div>
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-veil/10 bg-veil/[0.04] py-1 pl-1.5 pr-3 text-xs text-fg-2">
                <span className="rounded-full bg-[linear-gradient(135deg,#6366F1,#A78BFA)] px-2 py-0.5 text-[11px] font-medium text-white">
                  {SOLANA_CLUSTER === "simulated" ? l.hero.simulatedChain : t(l.hero.cluster, { cluster: SOLANA_CLUSTER })}
                </span>
                {l.hero.tagline}
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[68px]">
                {l.hero.titleLead}
                <br />
                <span className="text-gradient">{l.hero.titleAccent}</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-2">
                {l.hero.body}
              </p>
            </FadeIn>
            <FadeIn delay={0.24} className="mt-8 flex flex-wrap items-center gap-3">
              {demoHref ? (
                <ButtonLink href={demoHref} size="lg">
                  {l.hero.tryDemo} <ArrowRight className="size-4" />
                </ButtonLink>
              ) : (
                <ButtonLink href="/login" size="lg">
                  {l.hero.getStarted} <ArrowRight className="size-4" />
                </ButtonLink>
              )}
              <ButtonLink href={DEMO_MODE || !demoHref ? "#how" : "/login"} variant="secondary" size="lg">
                {DEMO_MODE || !demoHref ? l.hero.seeHow : l.hero.signIn}
              </ButtonLink>
            </FadeIn>
            <FadeIn delay={0.32}>
              <p className="mt-6 text-xs text-fg-3">
                {DEMO_MODE || demoHref ? `${l.hero.testNote} ` : ""}
                <span className="text-fg-2">{t(l.hero.equation, { received: "$1,100", invoice: "$1,000", applied: "$60", refunded: "$40" })}</span>
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.2} y={20}>
            <HeroDemo />
          </FadeIn>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-10 px-5 pb-24 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet">{l.how.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{l.how.title}</h2>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <StaggerItem key={s.key}>
                <Spotlight className="h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl border border-veil/10 bg-veil/[0.05] text-violet">
                      <s.icon className="size-[18px]" />
                    </span>
                    <span className="font-mono text-xs text-fg-3">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{l.steps[s.key].title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-2">{l.steps[s.key].body}</p>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mb-5 mt-16 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-mint">{l.film.eyebrow}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{l.film.title}</h3>
            </div>
            <p className="text-sm text-fg-3">{l.film.note}</p>
          </div>
          <ProcessFilm />
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
            <div className="absolute -right-24 -top-24 opacity-[0.07]">
              <LogoMark size={360} />
            </div>
            <div className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-mint">{l.controls.eyebrow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">{l.controls.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-fg-2">{l.controls.body}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {guarantees.map((g) => (
                  <div key={g.key} className="rounded-2xl border border-veil/[0.07] bg-veil/[0.025] p-4">
                    <g.icon className="size-5 text-mint" />
                    <h3 className="mt-3 text-sm font-semibold text-fg">{l.guarantees[g.key].title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-fg-3">{l.guarantees[g.key].body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

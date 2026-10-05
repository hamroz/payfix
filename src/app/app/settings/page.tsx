import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { CopyButton } from "@/components/ui/interactive";
import { Card, CardHeader, Mono, PageHeader } from "@/components/ui/primitives";
import { WalletProviders } from "@/components/wallet/providers";
import { env, publicConfig } from "@/lib/env";
import { ata, explorerUrl } from "@/lib/solana/tx";
import { deps, requireWorkspace } from "@/lib/server/context";
import { listWallets } from "@/lib/server/wallets";
import { listMembers } from "@/lib/server/workspaces";
import { getMuted } from "@/lib/server/notifications";
import { businessWallets } from "@/lib/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { can } from "@/lib/roles";
import { demoKeys } from "@/lib/server/demo";
import { getI18n } from "@/lib/i18n/server";
import { DemoTools, WalletSettings } from "./settings-client";
import { NotificationSettings } from "./notifications";
import { TeamSettings } from "./team";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.settings.title };
}

export default async function SettingsPage() {
  const { biz, role, user } = await requireWorkspace();
  const config = publicConfig();
  const e = env();
  const tokenAccount = ata(biz.mint, biz.walletAddress).toBase58();
  const { db } = await deps();
  const serverHeld = new Set([
    ...(await db.select({ a: businessWallets.address }).from(businessWallets).where(and(eq(businessWallets.businessId, biz.id), isNotNull(businessWallets.secretEnc)))).map((r) => r.a),
    ...(demoKeys()?.merchant ? [demoKeys()!.merchant!.publicKey.toBase58()] : []),
  ]);
  const wallets = (await listWallets(db, biz.id)).map((w) => ({ address: w.address, label: w.label, active: w.active, serverHeld: serverHeld.has(w.address) }));
  const members = (await listMembers(db, biz.id)).map((m) => ({ userId: m.userId, email: m.email, role: m.role }));
  const isOwner = can(role, "owner");
  const muted = await getMuted(db, { businessId: biz.id, userId: user.id });
  const { m, t } = await getI18n();
  const s = m.settings;

  const row = (label: string, value: string, link?: string) => (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-fg-3">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        <Mono className="truncate">{value}</Mono>
        <CopyButton value={value} />
        {link && !config.simulated && (
          <a href={link} target="_blank" rel="noreferrer" className="text-fg-3 hover:text-fg" aria-label={s.explorer}>
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </span>
    </div>
  );

  return (
    <WalletProviders rpcUrl={config.rpcUrl}>
      <div className="mx-auto max-w-3xl">
        <PageHeader eyebrow={s.eyebrow} title={s.heading} subtitle={`${biz.name} · ${biz.ownerEmail}`} />
        <div className="space-y-5">
          <FadeIn>
            <Card>
              <CardHeader title={s.network.title} subtitle={s.network.subtitle} />
              <div className="divide-y divide-veil/[0.06] px-5 pb-2">
                {row(s.network.network, config.simulated ? s.network.simulated : t(s.network.solana, { cluster: config.cluster }))}
                {row(s.network.token, t(s.network.tokenValue, { label: e.PAYFIX_TOKEN_LABEL, decimals: config.decimals }))}
                {row(s.network.mint, biz.mint, explorerUrl("address", biz.mint, config.cluster))}
                {row(s.network.wallet, biz.walletAddress, explorerUrl("address", biz.walletAddress, config.cluster))}
                {row(s.network.tokenAccount, tokenAccount, explorerUrl("address", tokenAccount, config.cluster))}
              </div>
            </Card>
          </FadeIn>
          <FadeIn delay={0.03}>
            <Card>
              <CardHeader title={s.language.title} subtitle={s.language.subtitle} action={<LanguageSwitcher />} className="pb-5" />
            </Card>
          </FadeIn>
          <FadeIn delay={0.05}>
            <TeamSettings members={members} canManage={isOwner} me={user.email} />
          </FadeIn>
          <FadeIn delay={0.07}>
            <NotificationSettings muted={muted} />
          </FadeIn>
          <FadeIn delay={0.08}>
            <WalletSettings wallets={wallets} canManage={isOwner} cluster={config.cluster} simulated={config.simulated} demoMode={config.demoMode} />
          </FadeIn>
          {config.demoMode && (
            <FadeIn delay={0.1}>
              <DemoTools simulated={config.simulated} canReset={isOwner} />
            </FadeIn>
          )}
          <FadeIn delay={0.15}>
            <Card className="p-5 text-sm text-fg-2">
              <h3 className="font-display text-[15px] font-semibold text-fg">{s.scope.title}</h3>
              <p className="mt-2">{s.scope.body}</p>
            </Card>
          </FadeIn>
        </div>
      </div>
    </WalletProviders>
  );
}

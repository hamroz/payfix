import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ThemeToggle } from "@/components/theme/theme";
import { WalletProviders } from "@/components/wallet/providers";
import { env, publicConfig } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { currentWorkspace } from "@/lib/server/context";
import { OnboardingForm } from "./onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.onboarding.title };
}

export default async function OnboardingPage() {
  const ws = await currentWorkspace();
  if (!ws) redirect("/login");
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ThemeToggle className="absolute right-5 top-5" />
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <LogoMark size={52} animate className="mb-8" />
        <WalletProviders rpcUrl={publicConfig().rpcUrl}>
          <OnboardingForm email={ws.user.email} demo={env().DEMO_MODE} existing={ws.workspaces} />
        </WalletProviders>
      </div>
      <SiteFooter minimal />
    </div>
  );
}

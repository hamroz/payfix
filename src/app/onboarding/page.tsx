import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme";
import { env } from "@/lib/env";
import { currentWorkspace } from "@/lib/server/context";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Create your company" };

export default async function OnboardingPage() {
  const ws = await currentWorkspace();
  if (!ws) redirect("/login");
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <ThemeToggle className="absolute right-5 top-5" />
      <LogoMark size={52} animate className="mb-8" />
      <OnboardingForm email={ws.user.email} demo={env().DEMO_MODE} existing={ws.workspaces} />
    </div>
  );
}

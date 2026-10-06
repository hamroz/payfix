import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { DemoInbox } from "@/components/app/demo-inbox";
import { SiteFooter } from "@/components/marketing/site-footer";
import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { currentUser } from "@/lib/server/context";
import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme/theme";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.auth.title };
}

export default async function LoginPage() {
  if (await currentUser()) redirect("/app");
  const demo = env().DEMO_MODE;
  const { m } = await getI18n();
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ThemeToggle className="absolute right-5 top-5" />
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <Link href="/" className="mb-8" aria-label={m.auth.homeLink}>
          <LogoMark size={52} animate />
        </Link>
        <LoginForm defaultEmail="" demo={demo} />
      </div>
      <SiteFooter minimal />
      {demo && <DemoInbox />}
    </div>
  );
}

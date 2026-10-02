import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { DemoInbox } from "@/components/app/demo-inbox";
import { env } from "@/lib/env";
import { currentUser } from "@/lib/server/context";
import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme/theme";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentUser()) redirect("/app");
  const demo = env().DEMO_MODE;
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <ThemeToggle className="absolute right-5 top-5" />
      <Link href="/" className="mb-8" aria-label="PayFix home">
        <LogoMark size={52} animate />
      </Link>
      <LoginForm defaultEmail="" demo={demo} />
      {demo && <DemoInbox />}
    </div>
  );
}

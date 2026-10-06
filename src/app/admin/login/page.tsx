import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme";
import { LoginForm } from "@/app/login/login-form";
import { getI18n } from "@/lib/i18n/server";
import { currentAdmin } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.admin.login.title, robots: { index: false } };
}

/** No demo inbox here: admin codes are only ever really emailed. */
export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <ThemeToggle className="absolute right-5 top-5" />
      <LogoMark size={52} className="mb-8" />
      <LoginForm defaultEmail="" demo={false} admin />
    </div>
  );
}

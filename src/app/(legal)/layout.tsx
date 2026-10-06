import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ThemeToggle } from "@/components/theme/theme";
import { getI18n } from "@/lib/i18n/server";

export default async function LegalLayout({ children }: { children: ReactNode }) {
  const { m } = await getI18n();
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Link href="/" aria-label={m.legal.page.home}>
          <Logo size={26} />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
      </header>
      <main className="w-full flex-1 px-5 pb-16 pt-4 sm:px-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

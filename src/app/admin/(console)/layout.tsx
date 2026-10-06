import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { NetworkPill } from "@/components/app/network-pill";
import { AdminSideNav, AdminTabBar } from "@/components/admin/admin-nav";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme";
import { adminSignOut } from "@/app/actions/admin-auth";
import { getI18n } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/server/context";

export const metadata: Metadata = { robots: { index: false } };

/** The admin console. Anyone who isn't a signed-in admin gets a 404 from requireAdmin. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const email = await requireAdmin();
  const { m } = await getI18n();
  const signOut = (
    <form action={adminSignOut}>
      <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-fg-3 transition hover:bg-veil/[0.05] hover:text-fg" title={m.admin.signOut}>
        <LogOut className="size-3.5" /> <span className="hidden sm:inline">{m.admin.signOut}</span>
      </button>
    </form>
  );
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px]">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-veil/[0.06] px-4 py-6 lg:flex">
        <Link href="/admin" className="px-2">
          <Logo size={28} />
        </Link>
        <div className="mt-8 flex-1">
          <AdminSideNav />
        </div>
        <p className="px-2 text-[11px] leading-relaxed text-fg-3">{m.admin.privacyNote}</p>
        <div className="mt-4 flex items-center justify-between gap-2 px-1">
          <span className="truncate text-xs text-fg-2" title={email}>
            {email}
          </span>
          <LanguageSwitcher compact up className="shrink-0" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-veil/[0.06] bg-ink-900/70 px-4 py-3 backdrop-blur-xl sm:px-8">
          <Link href="/admin" className="lg:hidden" aria-label={m.admin.nav.overview}>
            <LogoMark size={26} />
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-violet/25 bg-violet/10 px-2.5 py-1 text-[11px] font-medium text-violet lg:inline-flex">
            <ShieldCheck className="size-3.5" /> {m.admin.badge}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-violet/25 bg-violet/10 p-1 text-violet lg:hidden" title={m.admin.badge}>
              <ShieldCheck className="size-3.5" aria-label={m.admin.badge} />
            </span>
            <NetworkPill />
            <ThemeToggle />
            {signOut}
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-8 lg:pb-12">{children}</main>
      </div>
      <AdminTabBar />
    </div>
  );
}

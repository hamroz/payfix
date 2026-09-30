import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { LiveSync } from "@/components/app/live-sync";
import { SideNav, TabBar } from "@/components/app/nav";
import { NetworkPill } from "@/components/app/network-pill";
import { ThemeToggle } from "@/components/theme/theme";
import { deps, requireBusiness } from "@/lib/server/context";
import { openCaseCount } from "@/lib/server/queries";
import { shortAddress } from "@/lib/solana/tx";
import { initials } from "@/lib/format";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const biz = await requireBusiness();
  const { db } = await deps();
  const open = await openCaseCount(db, biz.id);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px]">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-veil/[0.06] px-4 py-6 lg:flex">
        <Link href="/app" className="px-2">
          <Logo size={28} />
        </Link>
        <div className="mt-8 flex-1">
          <SideNav openCases={open} />
        </div>
        <div className="rounded-2xl border border-veil/[0.07] bg-veil/[0.03] p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#6366F1,#A78BFA)] font-display text-sm font-semibold text-white">
              {initials(biz.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{biz.name}</p>
              <p className="truncate font-mono text-[11px] text-fg-3">{shortAddress(biz.walletAddress, 5)}</p>
            </div>
            <form action={signOut}>
              <button className="rounded-lg p-1.5 text-fg-3 transition hover:bg-veil/[0.06] hover:text-fg" aria-label="Sign out">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-veil/[0.06] bg-ink-900/70 px-5 py-3 backdrop-blur-xl sm:px-8">
          <Link href="/app" className="lg:hidden">
            <Logo size={24} />
          </Link>
          <div className="hidden text-sm text-fg-3 lg:block">{biz.name}</div>
          <div className="flex items-center gap-3">
            <LiveSync />
            <NetworkPill />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-5 pb-28 pt-6 sm:px-8 sm:pt-8 lg:pb-12">{children}</main>
      </div>
      <TabBar openCases={open} />
    </div>
  );
}

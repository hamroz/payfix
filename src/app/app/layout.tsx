import Link from "next/link";
import { Eye } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LiveSync } from "@/components/app/live-sync";
import { SideNav, TabBar } from "@/components/app/nav";
import { NetworkPill } from "@/components/app/network-pill";
import { NotificationBell } from "@/components/app/notifications";
import { ThemeToggle } from "@/components/theme/theme";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { deps, requireWorkspace } from "@/lib/server/context";
import { listNotifications, unreadCount, type NotificationRow } from "@/lib/server/notifications";
import { openCaseCount } from "@/lib/server/queries";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const { biz, role, user, workspaces } = await requireWorkspace();
  const { db } = await deps();
  const open = await openCaseCount(db, biz.id);
  // Notifications must never take the app shell down with them.
  let notifications: { items: NotificationRow[]; unread: number } = { items: [], unread: 0 };
  try {
    const viewer = { businessId: biz.id, userId: user.id };
    notifications = { items: await listNotifications(db, viewer), unread: await unreadCount(db, viewer) };
  } catch (err) {
    console.error("[payfix] notifications failed:", err instanceof Error ? err.message : err);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px]">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-veil/[0.06] px-4 py-6 lg:flex">
        <Link href="/app" className="px-2">
          <Logo size={28} />
        </Link>
        <div className="mt-8 flex-1">
          <SideNav openCases={open} />
        </div>
        <WorkspaceSwitcher current={{ businessId: biz.id, name: biz.name, role }} workspaces={workspaces} email={user.email} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-veil/[0.06] bg-ink-900/70 px-4 py-3 backdrop-blur-xl sm:gap-3 sm:px-8">
          <Link href="/app" className="lg:hidden">
            <Logo size={24} />
          </Link>
          <div className="hidden text-sm text-fg-3 lg:block">{biz.name}</div>
          <div className="flex items-center gap-2 sm:gap-3">
            {role === "viewer" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-veil/10 bg-veil/[0.04] px-2.5 py-1 text-[11px] font-medium text-fg-2">
                <Eye className="size-3.5" /> View only
              </span>
            )}
            <LiveSync scope={{ b: biz.id }} />
            <NetworkPill />
            <NotificationBell items={notifications.items} unread={notifications.unread} />
            <ThemeToggle />
            <div className="lg:hidden">
              <WorkspaceSwitcher compact current={{ businessId: biz.id, name: biz.name, role }} workspaces={workspaces} email={user.email} />
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 pb-28 pt-6 sm:px-8 sm:pt-8 lg:pb-12">{children}</main>
      </div>
      <TabBar openCases={open} />
    </div>
  );
}

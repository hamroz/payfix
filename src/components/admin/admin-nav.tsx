"use client";

import { motion } from "motion/react";
import { Building2, LayoutGrid, MessageSquareHeart, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

type Key = "overview" | "users" | "companies" | "feedback";
const items: { href: string; key: Key; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", key: "overview", icon: LayoutGrid, exact: true },
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/companies", key: "companies", icon: Building2 },
  { href: "/admin/feedback", key: "feedback", icon: MessageSquareHeart },
];

const isActive = (path: string, href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

export function AdminSideNav() {
  const path = usePathname();
  const { m } = useI18n();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((it) => {
        const active = isActive(path, it.href, it.exact);
        return (
          <Link key={it.href} href={it.href} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "text-fg" : "text-fg-3 hover:text-fg-2")}>
            {active && (
              <motion.span layoutId="admin-nav-active" className="absolute inset-0 rounded-xl border border-veil/10 bg-veil/[0.06]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
            )}
            <it.icon className={cn("relative size-[18px]", active && "text-violet")} />
            <span className="relative">{m.admin.nav[it.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminTabBar() {
  const path = usePathname();
  const { m } = useI18n();
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl bg-ink-850/85 px-0.5 py-1.5 lg:hidden">
      {items.map((it) => {
        const active = isActive(path, it.href, it.exact);
        return (
          <Link key={it.href} href={it.href} className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5">
            {active && <motion.span layoutId="admin-tab-active" className="absolute inset-0 rounded-xl bg-veil/[0.07]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <it.icon className={cn("relative size-5", active ? "text-violet" : "text-fg-3")} />
            <span className={cn("relative max-w-full truncate text-[10px] leading-tight tracking-tight", active ? "text-fg" : "text-fg-3")}>{m.admin.nav[it.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

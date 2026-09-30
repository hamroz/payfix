"use client";

import { motion } from "motion/react";
import { BookOpenText, FileText, LayoutGrid, Settings, TriangleAlert, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/app", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/app/invoices", label: "Invoices", icon: FileText },
  { href: "/app/exceptions", label: "Exceptions", icon: TriangleAlert, badge: true },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/ledger", label: "Ledger", icon: BookOpenText },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const isActive = (path: string, href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

export function SideNav({ openCases }: { openCases: number }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((it) => {
        const active = isActive(path, it.href, it.exact);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "text-fg" : "text-fg-3 hover:text-fg-2")}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl border border-veil/10 bg-veil/[0.06]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <it.icon className={cn("relative size-[18px]", active && "text-violet")} />
            <span className="relative">{it.label}</span>
            {it.badge && openCases > 0 && (
              <span className="relative ml-auto rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-semibold text-amber">{openCases}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar({ openCases }: { openCases: number }) {
  const path = usePathname();
  const mobile = items.filter((i) => i.href !== "/app/customers");
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl bg-ink-850/85 px-1 py-1.5 lg:hidden">
      {mobile.map((it) => {
        const active = isActive(path, it.href, it.exact);
        return (
          <Link key={it.href} href={it.href} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5">
            {active && <motion.span layoutId="tab-active" className="absolute inset-0 rounded-xl bg-veil/[0.07]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="relative">
              <it.icon className={cn("size-5", active ? "text-violet" : "text-fg-3")} />
              {it.badge && openCases > 0 && <span className="absolute -right-1.5 -top-1 size-2 rounded-full bg-amber" />}
            </span>
            <span className={cn("relative text-[10px]", active ? "text-fg" : "text-fg-3")}>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

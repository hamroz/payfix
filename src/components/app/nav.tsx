"use client";

import { motion } from "motion/react";
import { BookOpenText, FileText, LayoutGrid, Settings, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

type Item = { href: string; key: "overview" | "invoices" | "exceptions" | "customers" | "ledger" | "settings"; icon: LucideIcon; exact?: boolean; badge?: boolean };

const items: Item[] = [
  { href: "/app", key: "overview", icon: LayoutGrid, exact: true },
  { href: "/app/invoices", key: "invoices", icon: FileText },
  { href: "/app/exceptions", key: "exceptions", icon: TriangleAlert, badge: true },
  { href: "/app/customers", key: "customers", icon: Users },
  { href: "/app/ledger", key: "ledger", icon: BookOpenText },
  { href: "/app/settings", key: "settings", icon: Settings },
];

const legalDocs = ["privacy", "terms", "cookies", "security"] as const;

const isActive = (path: string, href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

export function SideNav({ openCases }: { openCases: number }) {
  const path = usePathname();
  const { m } = useI18n();
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
            <span className="relative">{m.app.nav[it.key]}</span>
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
  const { m } = useI18n();
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl bg-ink-850/85 px-0.5 py-1.5 lg:hidden">
      {items.map((it) => {
        const active = isActive(path, it.href, it.exact);
        return (
          <Link key={it.href} href={it.href} className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5">
            {active && <motion.span layoutId="tab-active" className="absolute inset-0 rounded-xl bg-veil/[0.07]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="relative">
              <it.icon className={cn("size-5", active ? "text-violet" : "text-fg-3")} />
              {it.badge && openCases > 0 && <span className="absolute -right-1.5 -top-1 size-2 rounded-full bg-amber" />}
            </span>
            <span className={cn("relative max-w-full truncate text-[10px] leading-tight tracking-tight", active ? "text-fg" : "text-fg-3")}>{m.app.tabs[it.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Small links to the legal pages, for the sidebar and the phone company menu. */
export function LegalLinks({ className }: { className?: string }) {
  const { m } = useI18n();
  return (
    <nav aria-label={m.app.nav.legal} className={cn("flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] text-fg-3", className)}>
      {legalDocs.map((d) => (
        <Link key={d} href={`/${d}`} className="transition hover:text-fg-2">
          {m.legal.docs[d]}
        </Link>
      ))}
    </nav>
  );
}

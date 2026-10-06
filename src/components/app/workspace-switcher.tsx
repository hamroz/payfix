"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronsUpDown, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { switchWorkspaceAction } from "@/app/actions/business";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/lib/i18n/client";
import { initials } from "@/lib/format";
import type { Role } from "@/lib/roles";
import { cn } from "@/lib/cn";
import { LegalLinks } from "./nav";

type W = { businessId: string; name: string; role: Role; suspended?: boolean };

/**
 * Company menu: switch company, create one, sign out. `compact` is the phone header's avatar-only
 * version, which also carries the language menu and legal links the sidebar shows on desktop.
 */
export function WorkspaceSwitcher({ current, workspaces, email, compact = false }: { current: W; workspaces: W[]; email: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const { m } = useI18n();

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "glass absolute z-50 rounded-2xl bg-ink-850/95 p-1.5",
              compact ? "right-0 top-full mt-2 w-64 bg-ink-850" : "overflow-hidden bottom-full left-0 right-0 mb-2",
            )}
          >
            <p className="truncate px-2.5 pb-1.5 pt-1 text-[11px] text-fg-3">{email}</p>
            {workspaces.map((w) => (
              <button
                key={w.businessId}
                disabled={pending}
                onClick={() => (w.businessId === current.businessId ? setOpen(false) : start(async () => void (await switchWorkspaceAction(w.businessId))))}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-veil/[0.06]"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet/15 font-display text-[11px] font-semibold text-violet">{initials(w.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{w.name}</span>
                  <span className={cn("block text-[11px]", w.suspended ? "text-rose" : "text-fg-3")}>{w.suspended ? m.app.workspace.suspended : m.roles[w.role].label}</span>
                </span>
                {w.businessId === current.businessId && <Check className="size-4 text-violet" />}
              </button>
            ))}
            <div className="my-1 h-px bg-veil/[0.07]" />
            <Link href="/onboarding" className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-fg-2 transition hover:bg-veil/[0.06] hover:text-fg">
              <Plus className="size-4" /> {m.app.workspace.newCompany}
            </Link>
            <form action={signOut}>
              <button className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-fg-2 transition hover:bg-veil/[0.06] hover:text-fg">
                <LogOut className="size-4" /> {m.app.workspace.signOut}
              </button>
            </form>
            {compact && (
              <>
                <div className="my-1 h-px bg-veil/[0.07]" />
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                  <span className="text-sm text-fg-2">{m.common.language}</span>
                  <LanguageSwitcher compact up />
                </div>
                <LegalLinks className="px-2.5 pb-1.5 pt-1" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {compact ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#6366F1,#A78BFA)] font-display text-xs font-semibold text-white"
          aria-expanded={open}
          aria-label={m.app.workspace.switchCompany}
        >
          {initials(current.name)}
        </button>
      ) : (
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn("flex w-full items-center gap-3 rounded-2xl border border-veil/[0.07] bg-veil/[0.03] p-3 text-left transition hover:bg-veil/[0.06]", open && "bg-veil/[0.06]")}
        aria-expanded={open}
        aria-label={m.app.workspace.switchCompany}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#6366F1,#A78BFA)] font-display text-sm font-semibold text-white">{initials(current.name)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{current.name}</span>
          <span className="block truncate text-[11px] text-fg-3">{m.roles[current.role].label}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fg-3" />
      </button>
      )}
    </div>
  );
}

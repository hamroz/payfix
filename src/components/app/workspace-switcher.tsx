"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronsUpDown, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { switchWorkspaceAction } from "@/app/actions/business";
import { initials } from "@/lib/format";
import { roleLabel, type Role } from "@/lib/roles";
import { cn } from "@/lib/cn";

type W = { businessId: string; name: string; role: Role };

export function WorkspaceSwitcher({ current, workspaces, email }: { current: W; workspaces: W[]; email: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

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
            className="glass absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl bg-ink-850/95 p-1.5"
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
                  <span className="block text-[11px] text-fg-3">{roleLabel(w.role)}</span>
                </span>
                {w.businessId === current.businessId && <Check className="size-4 text-violet" />}
              </button>
            ))}
            <div className="my-1 h-px bg-veil/[0.07]" />
            <Link href="/onboarding" className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-fg-2 transition hover:bg-veil/[0.06] hover:text-fg">
              <Plus className="size-4" /> New company
            </Link>
            <form action={signOut}>
              <button className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-fg-2 transition hover:bg-veil/[0.06] hover:text-fg">
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn("flex w-full items-center gap-3 rounded-2xl border border-veil/[0.07] bg-veil/[0.03] p-3 text-left transition hover:bg-veil/[0.06]", open && "bg-veil/[0.06]")}
        aria-expanded={open}
        aria-label="Switch company"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#6366F1,#A78BFA)] font-display text-sm font-semibold text-white">{initials(current.name)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{current.name}</span>
          <span className="block truncate text-[11px] text-fg-3">{roleLabel(current.role)}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fg-3" />
      </button>
    </div>
  );
}

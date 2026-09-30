"use client";

import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, Inbox, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/interactive";
import { cn } from "@/lib/cn";

type Mail = { id: string; to: string; subject: string; body: string; link: string | null; code: string | null; createdAt: string };

/**
 * Demo mode stand-in for a real mailbox: shows sign-in codes and resolution links
 * PayFix "sent", so a presenter or judge can complete every flow on one screen.
 */
export function DemoInbox({ filterTo, className, defaultOpen = false }: { filterTo?: string; className?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [mail, setMail] = useState<Mail[]>([]);
  const [seen, setSeen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/dev/inbox", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const rows = (await res.json()) as Mail[];
    setMail(filterTo ? rows.filter((m) => m.to === filterTo) : rows);
  }, [filterTo]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const id = setInterval(load, 2500);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  const unread = mail.length > 0 && mail[0].id !== seen;

  return (
    <div className={cn("fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="glass mb-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl bg-ink-850/90"
          >
            <div className="flex items-center justify-between border-b border-veil/[0.07] px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Demo inbox</p>
                <p className="text-xs text-fg-3">Emails PayFix would send{filterTo ? ` to ${filterTo}` : ""}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-fg-3 hover:text-fg" aria-label="Close inbox">
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[50vh] divide-y divide-veil/[0.06] overflow-y-auto">
              {mail.length === 0 && <p className="px-4 py-8 text-center text-sm text-fg-3">Nothing yet.</p>}
              {mail.map((m, i) => (
                <motion.div key={m.id} initial={i === 0 ? { backgroundColor: "rgba(167,139,250,0.12)" } : false} animate={{ backgroundColor: "rgba(167,139,250,0)" }} transition={{ duration: 1.6 }} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-fg-3">
                    <span className="truncate">To {m.to}</span>
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-1 text-[13px] font-medium text-fg">{m.subject}</p>
                  {m.code && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-lg border border-violet/30 bg-violet/10 px-2.5 py-1 font-mono text-base tracking-[0.3em] text-violet">{m.code}</span>
                      <CopyButton value={m.code} label="Copy" />
                    </div>
                  )}
                  {m.link && (
                    <div className="mt-2 flex items-center gap-2">
                      <a href={m.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-veil/[0.06] px-2.5 py-1 text-xs font-medium text-fg hover:bg-veil/[0.1]">
                        Open link <ExternalLink className="size-3" />
                      </a>
                      <CopyButton value={m.link} label="Copy link" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (mail[0]) setSeen(mail[0].id);
        }}
        className="glass relative inline-flex items-center gap-2 rounded-full bg-ink-850/80 px-4 py-2.5 text-sm font-medium text-fg shadow-lg transition hover:bg-ink-800"
      >
        <Inbox className="size-4 text-violet" />
        Demo inbox
        {unread && (
          <span className="absolute -right-0.5 -top-0.5 flex size-3">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-violet" />
            <span className="relative size-3 rounded-full bg-violet" />
          </span>
        )}
      </button>
    </div>
  );
}

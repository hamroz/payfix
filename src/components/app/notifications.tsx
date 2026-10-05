"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCheck, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/actions/business";
import type { NotificationRow } from "@/lib/server/notifications";
import { cn } from "@/lib/cn";
import { TimeAgo } from "./activity";
import { eventIcon } from "./event-icons";

/** Header bell: unread badge and a panel of the member's latest notifications for this company. */
export function NotificationBell({ items, unread }: { items: NotificationRow[]; unread: number }) {
  const [open, setOpen] = useState(false);
  // Optimistic read marks until the server refresh arrives.
  const [readHere, setReadHere] = useState<Set<string>>(new Set());
  const [allRead, setAllRead] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Fresh server data replaces the optimistic marks (React's "adjust state on prop change" pattern).
  const [syncedWith, setSyncedWith] = useState(items);
  if (syncedWith !== items) {
    setSyncedWith(items);
    setReadHere(new Set());
    setAllRead(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isRead = (n: NotificationRow) => allRead || n.read || readHere.has(n.id);
  const count = allRead ? 0 : Math.max(0, unread - items.filter((n) => !n.read && readHere.has(n.id)).length);

  const openItem = (n: NotificationRow) => {
    setOpen(false);
    if (!isRead(n)) {
      setReadHere((s) => new Set(s).add(n.id));
      start(async () => void (await markNotificationReadAction(n.id)));
    }
    router.push(n.href);
  };

  const readAll = () => {
    setAllRead(true);
    start(async () => void (await markAllNotificationsReadAction()));
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative grid size-8 place-items-center rounded-lg border border-veil/10 bg-veil/[0.04] text-fg-2 transition hover:bg-veil/[0.08] hover:text-fg"
      >
        <Bell className="size-4" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="tabular absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[linear-gradient(135deg,#6366F1,#A78BFA)] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-ink-900"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="glass fixed inset-x-4 top-16 z-50 overflow-hidden rounded-2xl bg-ink-850 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-veil/[0.06] px-4 py-3">
              <h2 className="font-display text-[15px] font-semibold text-fg">Notifications</h2>
              <button
                type="button"
                onClick={readAll}
                disabled={count === 0 || pending}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-fg-2 transition hover:bg-veil/[0.06] hover:text-fg disabled:pointer-events-none disabled:opacity-40"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-fg-3">You’re all caught up.</p>
            ) : (
              <ul className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain p-1.5">
                {items.map((n) => {
                  const meta = eventIcon(n.type);
                  const read = isRead(n);
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-veil/[0.05]"
                      >
                        <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", meta.tone, read && "opacity-70")}>
                          <meta.icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-[13.5px] leading-snug", read ? "text-fg-2" : "font-medium text-fg")}>{n.message}</span>
                          <span className="mt-0.5 block text-xs text-fg-3">
                            <TimeAgo date={n.createdAt} />
                          </span>
                        </span>
                        {!read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-violet" aria-label="Unread" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href="/app/settings#notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 border-t border-veil/[0.06] px-4 py-2.5 text-xs text-fg-3 transition hover:bg-veil/[0.04] hover:text-fg-2"
            >
              <Settings2 className="size-3.5" /> Notification settings
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

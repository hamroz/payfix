"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { setNotificationPrefsAction } from "@/app/actions/business";
import { Card, CardHeader } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, type CategoryId } from "@/lib/domain/notifications";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

/** Per-member notification categories for this company. Everything is on until turned off. */
export function NotificationSettings({ muted: initial }: { muted: CategoryId[] }) {
  const [muted, setMuted] = useState<CategoryId[]>(initial);
  const [, start] = useTransition();
  const toast = useToast();
  const { m, t } = useI18n();

  const toggle = (id: CategoryId) => {
    const before = muted;
    const next = muted.includes(id) ? muted.filter((x) => x !== id) : [...muted, id];
    setMuted(next);
    start(async () => {
      const res = await setNotificationPrefsAction(next);
      if (!res.ok) {
        setMuted(before);
        toast.push({ tone: "error", title: m.settings.notifications.failed, body: res.error });
      }
    });
  };

  return (
    <Card id="notifications" className="scroll-mt-24">
      <CardHeader title={m.settings.notifications.title} subtitle={m.settings.notifications.subtitle} />
      <ul className="divide-y divide-veil/[0.06] px-5 pb-2">
        {CATEGORIES.map((c) => {
          const on = !muted.includes(c.id);
          return (
            <li key={c.id} className="flex items-center gap-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{m.categories[c.id].label}</p>
                <p className="mt-0.5 text-xs text-fg-3">{m.categories[c.id].description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={t(m.settings.notifications.toggle, { category: m.categories[c.id].label })}
                onClick={() => toggle(c.id)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition",
                  on ? "justify-end border-transparent bg-[linear-gradient(135deg,#6366F1,#A78BFA)]" : "justify-start border-veil/10 bg-veil/[0.08]",
                )}
              >
                <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 36 }} className={cn("size-[18px] rounded-full shadow-sm", on ? "bg-white" : "bg-fg-3")} />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

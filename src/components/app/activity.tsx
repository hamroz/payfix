"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { eventIcon } from "./event-icons";
import type { EventRow } from "@/lib/server/views";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ActivityFeed({
  events,
  empty = "Nothing has happened yet.",
  viewer = "business",
  businessName = "Business",
}: {
  events: EventRow[];
  empty?: string;
  viewer?: "business" | "customer";
  businessName?: string;
}) {
  const who = (actor: string) =>
    actor === "system" ? "PayFix" : actor === viewer ? "You" : actor === "business" ? businessName : "Customer";
  if (events.length === 0) return <p className="px-5 py-8 text-center text-sm text-fg-3">{empty}</p>;
  return (
    <ol className="relative px-5 py-4">
      <span className="absolute bottom-6 left-[35px] top-6 w-px bg-gradient-to-b from-veil/10 via-veil/[0.06] to-transparent" />
      {events.map((e, i) => {
        const meta = eventIcon(e.type);
        return (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.35 }}
            className="relative flex gap-3 py-2"
          >
            <span className={cn("relative z-10 grid size-8 shrink-0 place-items-center rounded-xl ring-4 ring-ink-900", meta.tone)}>
              <meta.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13.5px] leading-snug text-fg">{e.message}</p>
              <p className="mt-0.5 text-xs text-fg-3">
                {who(e.actor)} · <TimeAgo date={e.createdAt} />
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/** Relative time that may differ between server and browser clocks; re-renders every 30 s. */
export function TimeAgo({ date }: { date: Date | string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{timeAgo(date)}</span>;
}

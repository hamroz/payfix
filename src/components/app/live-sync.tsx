"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

/** What the page already holds that entitles it to sync: a member's company, a pay link's invoice, or a resolution link. */
export type SyncScope = { b: string } | { invoice: string } | { link: string };

/**
 * Polls /api/sync while the page is visible and refreshes server components when
 * anything changed. Renders a small live indicator.
 */
export function LiveSync({ scope, interval = 4000, label = true, className }: { scope: SyncScope; interval?: number; label?: boolean; className?: string }) {
  const query = new URLSearchParams(scope).toString();
  const router = useRouter();
  const { m } = useI18n();
  const version = useRef<number | null>(null);
  const [state, setState] = useState<"live" | "syncing" | "offline">("live");

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (document.visibilityState === "visible") {
        setState("syncing");
        try {
          const res = await fetch(`/api/sync?${query}`, { method: "POST" });
          const data = (await res.json()) as { version?: number };
          if (!res.ok || data.version === undefined) throw new Error();
          if (version.current !== null && data.version !== version.current) router.refresh();
          version.current = data.version;
          setState("live");
        } catch {
          setState("offline");
        }
      }
      if (!stopped) timer = setTimeout(tick, interval);
    };
    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [interval, router, query]);

  return (
    <span className={cn("inline-flex items-center gap-2 text-xs text-fg-3", className)} title={m.app.liveSync.title}>
      <span className="relative flex size-2">
        {state !== "offline" && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint" />}
        <span className={cn("relative size-2 rounded-full", state === "offline" ? "bg-rose" : "bg-mint")} />
      </span>
      {label && <span className="hidden sm:inline">{state === "offline" ? m.app.liveSync.reconnecting : m.app.liveSync.live}</span>}
    </span>
  );
}

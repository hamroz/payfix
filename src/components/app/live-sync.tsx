"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Polls /api/sync while the page is visible and refreshes server components when
 * anything changed. Renders a small live indicator.
 */
export function LiveSync({ businessId, interval = 4000, label = true, className }: { businessId: string; interval?: number; label?: boolean; className?: string }) {
  const router = useRouter();
  const version = useRef<number | null>(null);
  const [state, setState] = useState<"live" | "syncing" | "offline">("live");

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (document.visibilityState === "visible") {
        setState("syncing");
        try {
          const res = await fetch(`/api/sync?b=${encodeURIComponent(businessId)}`, { method: "POST" });
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
  }, [interval, router, businessId]);

  return (
    <span className={cn("inline-flex items-center gap-2 text-xs text-fg-3", className)} title="PayFix checks the chain every few seconds">
      <span className="relative flex size-2">
        {state !== "offline" && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint" />}
        <span className={cn("relative size-2 rounded-full", state === "offline" ? "bg-rose" : "bg-mint")} />
      </span>
      {label && (state === "offline" ? "Reconnecting…" : "Live")}
    </span>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

export type ThemePref = "light" | "dark" | "system";
const KEY = "pf-theme";

/**
 * Runs before first paint (inlined in <head>) so the page never flashes the wrong theme.
 * Keep in sync with `apply` below.
 */
export const themeScript = `(()=>{try{var p=localStorage.getItem("${KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

const order: ThemePref[] = ["system", "light", "dark"];
const icons = { system: Monitor, light: Sun, dark: Moon };

/** Cycles System → Light → Dark. Follows the OS setting live while on System. */
export function ThemeToggle({ className }: { className?: string }) {
  const { m, t } = useI18n();
  const [pref, setPref] = useState<ThemePref | null>(null);

  useEffect(() => {
    const initial = readPref();
    // Sync from localStorage after mount; the server can't know the stored preference.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPref(initial);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => readPref() === "system" && apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next = () => {
    const p = order[(order.indexOf(pref ?? "system") + 1) % order.length];
    try {
      localStorage.setItem(KEY, p);
    } catch {
      // private mode: the choice lasts for this page only
    }
    apply(p);
    setPref(p);
  };

  const Icon = icons[pref ?? "system"];
  const label = m.ui.theme[pref ?? "system"];
  return (
    <button
      type="button"
      onClick={next}
      aria-label={t(m.ui.theme.switch, { current: label })}
      title={label}
      className={cn(
        "relative grid size-8 place-items-center overflow-hidden rounded-lg border border-veil/10 bg-veil/[0.04] text-fg-2 transition hover:bg-veil/[0.08] hover:text-fg",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={pref ?? "pending"}
          initial={{ y: 10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
        >
          {Icon === Monitor ? (
            // "System" means the device's own setting: a phone on touch screens, a monitor elsewhere.
            <>
              <Monitor className="size-4 pointer-coarse:hidden" />
              <Smartphone className="hidden size-4 pointer-coarse:block" />
            </>
          ) : (
            <Icon className="size-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

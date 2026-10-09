"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, LOCALE_META } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

// Menu size for placement: w-48, and a py-2 row per language (some wrap) plus p-1.5 padding.
const MENU_W = 192;
const MENU_H = LOCALES.length * 40 + 12;
const EDGE = 8;

/**
 * Language menu. `compact` shows only the globe and language code (headers); otherwise the
 * language's own name (footers, sidebar). `up` prefers opening above the button. On open, the
 * menu flips vertically and picks the side to align to so it stays on screen.
 */
export function LanguageSwitcher({ compact = false, up = false, className }: { compact?: boolean; up?: boolean; className?: string }) {
  const { locale, m } = useI18n();
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState({ up, left: false });
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          if (!open && ref.current) {
            const r = ref.current.getBoundingClientRect();
            const above = r.top - EDGE;
            const below = window.innerHeight - r.bottom - EDGE;
            const fits = (space: number) => space >= MENU_H + 8;
            setPlace({
              up: up ? fits(above) || (!fits(below) && above > below) : !fits(below) && above > below,
              // Right-aligned by default; align left when that would run off the left edge.
              left: r.right - MENU_W < EDGE && r.left + MENU_W <= window.innerWidth - EDGE,
            });
          }
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${m.common.chooseLanguage}: ${LOCALE_META[locale].name}`}
        title={m.common.chooseLanguage}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border border-veil/10 bg-veil/[0.04] px-2 text-fg-2 transition hover:bg-veil/[0.08] hover:text-fg",
          pending && "opacity-60",
        )}
      >
        <Globe className="size-4" />
        <span className={cn("text-xs", compact && "font-medium uppercase")}>{compact ? locale : LOCALE_META[locale].name}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={m.common.language}
            initial={{ opacity: 0, y: place.up ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: place.up ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "glass absolute z-50 w-48 overflow-hidden rounded-2xl bg-ink-850/95 p-1.5",
              place.up ? "bottom-full mb-2" : "top-full mt-2",
              place.left ? "left-0" : "right-0",
            )}
          >
            {LOCALES.map((l) => (
              <li key={l} role="option" aria-selected={l === locale}>
                <button
                  type="button"
                  lang={l}
                  disabled={pending}
                  onClick={() => {
                    setOpen(false);
                    if (l !== locale) start(() => setLocaleAction(l));
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-veil/[0.06]"
                >
                  <span>
                    {LOCALE_META[l].name}
                    {l !== "en" && <span className="ml-1.5 text-[11px] text-fg-3">{LOCALE_META[l].english}</span>}
                  </span>
                  {l === locale && <Check className="size-4 shrink-0 text-violet" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

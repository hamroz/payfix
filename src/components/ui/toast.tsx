"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

type Toast = { id: number; tone: "success" | "error" | "info"; title: string; body?: string };
type Ctx = { push: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<Ctx>({ push: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const { m } = useI18n();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-3), { ...t, id }]);
      setTimeout(() => dismiss(id), t.tone === "error" ? 7000 : 4500);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? CircleAlert : Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-ink-850/80 p-4"
                role="status"
              >
                <Icon
                  className={cn("mt-0.5 size-5 shrink-0", t.tone === "success" ? "text-mint" : t.tone === "error" ? "text-rose" : "text-violet")}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">{t.title}</p>
                  {t.body && <p className="mt-0.5 text-[13px] text-fg-2">{t.body}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="text-fg-3 transition hover:text-fg" aria-label={m.ui.toast.dismiss}>
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

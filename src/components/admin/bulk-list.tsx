"use client";

import { AnimatePresence, motion } from "motion/react";
import { Trash2, X } from "lucide-react";
import { type ReactNode, useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { bulkDeleteAction, type BulkKind, type BulkResult } from "@/app/actions/admin";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Input, Label, Textarea } from "@/components/ui/primitives";
import { BULK_DELETE_WORD } from "@/lib/domain/confirm";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

type Item = { id: string; label: string; node: ReactNode };

/**
 * A list (rows) or stack (cards) with a checkbox per item and a bar for deleting the selection.
 * Server-rendered rows come in as `node`; this only adds selection and the bulk delete.
 */
export function BulkList({
  kind,
  items,
  layout = "rows",
  className,
  empty,
}: {
  kind: BulkKind;
  items: Item[];
  layout?: "rows" | "cards";
  className?: string;
  /** Shown when there are no items, below any result of the last bulk delete. */
  empty?: ReactNode;
}) {
  const { m, p, t } = useI18n();
  const b = m.admin.delete.bulk;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [pending, start] = useTransition();
  // True only in the browser (document.body exists), without a mount effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const needsReason = kind !== "feedback";
  const ids = items.map((i) => i.id);
  const allOn = ids.length > 0 && ids.every((id) => selected.has(id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirm = () =>
    start(async () => {
      setError(null);
      const res = await bulkDeleteAction(kind, [...selected], needsReason ? reason : "bulk", typed);
      if (!res.ok) return setError(res.error);
      setResult({ deleted: res.deleted, skipped: res.skipped });
      setSelected(new Set(res.skipped.map((s) => s.id).filter((id) => ids.includes(id))));
      setOpen(false);
      setTyped("");
    });

  const checkbox = (item: Item) => (
    <input
      type="checkbox"
      checked={selected.has(item.id)}
      onChange={() => toggle(item.id)}
      aria-label={t(b.select, { label: item.label })}
      className="size-4 shrink-0 accent-rose"
    />
  );

  return (
    <div className={className}>
      {items.length > 0 && (
        <label className={cn("inline-flex items-center gap-2 text-xs text-fg-3", layout === "rows" ? "px-4 pb-1 pt-3 sm:px-5" : "mb-2")}>
          <input type="checkbox" checked={allOn} onChange={() => setSelected(allOn ? new Set() : new Set(ids))} className="size-4 accent-rose" />
          {b.selectAll}
        </label>
      )}

      {result && (
        <div className="m-3 rounded-xl border border-veil/10 bg-veil/[0.03] px-4 py-3 text-sm">
          <p className="text-fg">{p(b.done, result.deleted)}</p>
          {result.skipped.length > 0 && (
            <>
              <p className="mt-2 text-fg-2">{b.skipped}</p>
              <ul className="mt-1 space-y-1 text-[13px] text-fg-2">
                {result.skipped.map((s) => (
                  <li key={s.id}>
                    <span className="text-fg">{s.label}</span>: {s.error}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {items.length === 0 ? (
        empty
      ) : layout === "rows" ? (
        <ul className="divide-y divide-veil/[0.06]">
          {items.map((item) => (
            <li key={item.id} className={cn("flex items-center gap-1 pl-4 sm:pl-5", selected.has(item.id) && "bg-rose/[0.04]")}>
              {checkbox(item)}
              <div className="min-w-0 flex-1">{item.node}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={cn("relative rounded-2xl", selected.has(item.id) && "ring-2 ring-rose/40")}>
              <div className="absolute right-4 top-4 z-10">{checkbox(item)}</div>
              {item.node}
            </div>
          ))}
        </div>
      )}

      {/* Portaled: a glass card's backdrop-filter would otherwise trap and clip this fixed bar. */}
      {mounted &&
        createPortal(
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="glass fixed inset-x-3 bottom-24 z-40 mx-auto max-w-xl rounded-2xl bg-ink-850/95 p-4 lg:bottom-6"
          >
            {!open ? (
              <div className="flex items-center justify-between gap-3">
                <span className="tabular text-sm text-fg">{p(b.selected, selected.size)}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                    <X className="size-4" /> {b.clear}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
                    <Trash2 className="size-4" /> {b.button}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-fg">{p(b.title, selected.size)}</p>
                <p className="text-[13px] text-fg-2">{b.body}</p>
                {needsReason && (
                  <div>
                    <Label htmlFor={`bulk-reason-${kind}`}>{m.admin.actions.reasonLabel}</Label>
                    <Textarea id={`bulk-reason-${kind}`} rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={m.admin.actions.reasonPlaceholder} />
                  </div>
                )}
                <div>
                  <Label htmlFor={`bulk-typed-${kind}`}>{t(b.typeWord, { word: BULK_DELETE_WORD })}</Label>
                  <Input id={`bulk-typed-${kind}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
                </div>
                {error && <p className="text-sm text-rose">{error}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button variant="danger" size="sm" onClick={confirm} disabled={pending || typed.trim() !== BULK_DELETE_WORD || (needsReason && !reason.trim())}>
                    {pending ? <LogoSpinner size={16} /> : <Trash2 className="size-4" />} {b.confirm}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
                    {m.common.cancel}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

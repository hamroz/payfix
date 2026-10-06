"use client";

import { AnimatePresence, motion } from "motion/react";
import { Ban, LogOut, RotateCcw, ShieldOff, type LucideIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { liftBlockAction, restoreCompanyAction, restoreUserAction, signOutUserAction, suspendCompanyAction, suspendUserAction } from "@/app/actions/admin";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Label, Textarea } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/client";

export type ModerationKind = "suspendUser" | "restoreUser" | "signOutUser" | "suspendCompany" | "restoreCompany" | "liftBlock";

const ACTIONS = {
  suspendUser: suspendUserAction,
  restoreUser: restoreUserAction,
  signOutUser: signOutUserAction,
  suspendCompany: suspendCompanyAction,
  restoreCompany: restoreCompanyAction,
  liftBlock: liftBlockAction,
} satisfies Record<ModerationKind, (id: string, reason: string) => Promise<{ ok: boolean }>>;

const ICONS: Record<ModerationKind, LucideIcon> = {
  suspendUser: Ban,
  restoreUser: RotateCcw,
  signOutUser: LogOut,
  suspendCompany: Ban,
  restoreCompany: RotateCcw,
  liftBlock: ShieldOff,
};

const DANGER: ModerationKind[] = ["suspendUser", "suspendCompany"];

/** One moderation action: a button that opens an inline confirmation asking for the reason. */
export function ModerateButton({ kind, targetId, warning, size = "md" }: { kind: ModerationKind; targetId: string; warning?: string; size?: "sm" | "md" }) {
  const { m } = useI18n();
  const a = m.admin.actions;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const Icon = ICONS[kind];
  const danger = DANGER.includes(kind);

  const confirm = () =>
    start(async () => {
      setError(null);
      const res = await ACTIONS[kind](targetId, reason);
      if (!res.ok) return setError((res as { error: string }).error);
      setOpen(false);
      setReason("");
    });

  return (
    <div className="w-full">
      {!open && (
        <Button variant={danger ? "danger" : "secondary"} size={size} onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <Icon className="size-4" /> {a[kind].button}
        </Button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="space-y-3 rounded-2xl border border-veil/10 bg-veil/[0.03] p-4">
              <p className="text-sm font-medium text-fg">{a[kind].title}</p>
              <p className="text-[13px] text-fg-2">{a[kind].body}</p>
              {warning && <p className="rounded-xl border border-amber/25 bg-amber/10 px-3 py-2 text-[13px] text-amber">{warning}</p>}
              <div>
                <Label htmlFor={`reason-${kind}-${targetId}`}>{a.reasonLabel}</Label>
                <Textarea id={`reason-${kind}-${targetId}`} rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={a.reasonPlaceholder} autoFocus />
              </div>
              {error && <p className="text-sm text-rose">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button variant={danger ? "danger" : "primary"} size="sm" onClick={confirm} disabled={pending || !reason.trim()}>
                  {pending ? <LogoSpinner size={16} /> : <Icon className="size-4" />} {a[kind].confirm}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
                  {m.common.cancel}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

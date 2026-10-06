"use client";

import { AnimatePresence, motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCompanyAction, deleteUserAction } from "@/app/actions/admin";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Input, Label, Textarea } from "@/components/ui/primitives";
import { confirmMatches } from "@/lib/domain/confirm";
import { useI18n } from "@/lib/i18n/client";

/**
 * Permanent delete of one company or account: a reason for the audit log, and the exact name or
 * email typed back. `alsoDeletes` lists companies that go with an account; `blocked` explains
 * why it can't be deleted yet.
 */
export function DeletePanel({
  kind,
  targetId,
  expected,
  alsoDeletes = [],
  blocked,
}: {
  kind: "company" | "user";
  targetId: string;
  expected: string;
  alsoDeletes?: string[];
  blocked?: string;
}) {
  const { m, t } = useI18n();
  const d = m.admin.delete;
  const copy = d[kind];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ready = !!reason.trim() && confirmMatches(expected, typed);

  const confirm = () =>
    start(async () => {
      setError(null);
      const res = kind === "company" ? await deleteCompanyAction(targetId, reason, typed) : await deleteUserAction(targetId, reason, typed);
      if (!res.ok) return setError(res.error);
      router.push(kind === "company" ? "/admin/companies" : "/admin/users");
    });

  if (blocked) return <p className="rounded-xl border border-amber/25 bg-amber/10 px-3 py-2 text-[13px] text-amber">{blocked}</p>;
  return (
    <div className="w-full">
      {!open && (
        <Button variant="danger" onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <Trash2 className="size-4" /> {copy.button}
        </Button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="space-y-3 rounded-2xl border border-rose/25 bg-rose/[0.05] p-4">
              <p className="text-sm font-medium text-fg">{copy.title}</p>
              <p className="text-[13px] text-fg-2">{copy.body}</p>
              {kind === "user" && alsoDeletes.length > 0 && (
                <div className="text-[13px] text-fg-2">
                  <p>{d.user.alsoDeletes}</p>
                  <ul className="mt-1 list-disc pl-5 text-fg">
                    {alsoDeletes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <Label htmlFor={`del-reason-${targetId}`}>{m.admin.actions.reasonLabel}</Label>
                <Textarea id={`del-reason-${targetId}`} rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={m.admin.actions.reasonPlaceholder} />
              </div>
              <div>
                <Label htmlFor={`del-typed-${targetId}`}>{t(d.typeToConfirm, { expected })}</Label>
                <Input id={`del-typed-${targetId}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
              </div>
              {error && <p className="text-sm text-rose">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button variant="danger" size="sm" onClick={confirm} disabled={pending || !ready}>
                  {pending ? <LogoSpinner size={16} /> : <Trash2 className="size-4" />} {copy.confirm}
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

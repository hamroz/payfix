"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteFeedbackAction } from "@/app/actions/admin";
import { LogoSpinner } from "@/components/brand/logo";
import { Button } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/client";

/** Delete one survey response, with an inline "are you sure?". */
export function DeleteFeedbackButton({ id }: { id: string }) {
  const { m } = useI18n();
  const f = m.admin.delete.feedback;
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!asking)
    return (
      <button onClick={() => setAsking(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-fg-3 transition hover:bg-rose/10 hover:text-rose">
        <Trash2 className="size-3.5" /> {f.button}
      </button>
    );
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-xs">
      <span className="text-fg-2">{f.confirm}</span>
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await deleteFeedbackAction(id);
            if (!res.ok) setError(res.error);
          })
        }
      >
        {pending ? <LogoSpinner size={14} /> : <Trash2 className="size-3.5" />} {f.yes}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setAsking(false)} disabled={pending}>
        {m.common.cancel}
      </Button>
      {error && <span className="text-rose">{error}</span>}
    </span>
  );
}

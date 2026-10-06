"use client";

import { ShieldBan } from "lucide-react";
import { useState, useTransition } from "react";
import { addBlockAction } from "@/app/actions/admin";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import type { BlockKind } from "@/lib/db/schema";
import { useI18n } from "@/lib/i18n/client";

/** Blocks sign-in codes to one email or the faucet for one wallet. */
export function AddBlockForm() {
  const { m } = useI18n();
  const mo = m.admin.moderation;
  const [kind, setKind] = useState<BlockKind>("sign_in");
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addBlockAction({ kind, target, reason });
          if (!res.ok) return setMsg({ ok: false, text: res.error });
          setMsg({ ok: true, text: mo.added });
          setTarget("");
          setReason("");
        });
      }}
    >
      <div>
        <Label htmlFor="block-kind">{mo.kind}</Label>
        <Select id="block-kind" value={kind} onChange={(e) => setKind(e.target.value as BlockKind)}>
          <option value="sign_in">{mo.kinds.sign_in}</option>
          <option value="faucet">{mo.kinds.faucet}</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="block-target">{mo.target}</Label>
        <Input id="block-target" required value={target} onChange={(e) => setTarget(e.target.value)} placeholder={mo.targetPlaceholder[kind]} autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="block-reason">{m.admin.actions.reasonLabel}</Label>
        <Textarea id="block-reason" required rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={m.admin.actions.reasonPlaceholder} />
      </div>
      {msg && <p className={msg.ok ? "text-sm text-mint" : "text-sm text-rose"}>{msg.text}</p>}
      <Button type="submit" variant="danger" size="sm" disabled={pending || !target.trim() || !reason.trim()}>
        {pending ? <LogoSpinner size={16} /> : <ShieldBan className="size-4" />} {mo.add}
      </Button>
    </form>
  );
}

"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { addMemberAction, removeMemberAction, setMemberRoleAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Badge, Button, Card, CardHeader, Input, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { initials } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { ROLES, type Role } from "@/lib/roles";

type Member = { userId: string; email: string; role: Role };

export function TeamSettings({ members, canManage, me }: { members: Member[]; canManage: boolean; me: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [pending, start] = useTransition();
  const toast = useToast();
  const { m, t } = useI18n();
  const tm = m.settings.team;
  const roleLabel = (r: Role) => m.roles[r].label;

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      toast.push(res.ok ? { tone: "success", title: success } : { tone: "error", title: tm.failed, body: res.error });
      if (res.ok) after?.();
    });

  return (
    <Card id="team">
      <CardHeader title={tm.title} subtitle={canManage ? tm.subtitleManage : tm.subtitleView} />
      <div className="space-y-4 p-5">
        <ul className="divide-y divide-veil/[0.06] overflow-hidden rounded-2xl border border-veil/[0.07]">
          {members.map((mb) => (
            <li key={mb.userId} className="flex flex-wrap items-center gap-3 px-3.5 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet/15 font-display text-[11px] font-semibold text-violet">{initials(mb.email.split("@")[0].replace(/[._-]/g, " "))}</span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {mb.email}
                {mb.email === me && <span className="ml-2 text-xs text-fg-3">{tm.you}</span>}
              </span>
              {canManage ? (
                <div className="flex items-center gap-1.5">
                  <Select
                    value={mb.role}
                    disabled={pending}
                    onChange={(e) => act(() => setMemberRoleAction(mb.userId, e.target.value as Role), t(tm.roleChanged, { email: mb.email, role: roleLabel(e.target.value as Role) }))}
                    className="h-9 w-[110px] text-sm"
                    aria-label={t(tm.roleFor, { email: mb.email })}
                  >
                    {ROLES.map((r) => (
                      <option key={r.role} value={r.role}>
                        {roleLabel(r.role)}
                      </option>
                    ))}
                  </Select>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(() => removeMemberAction(mb.userId), t(tm.removed, { email: mb.email }))} aria-label={t(tm.remove, { email: mb.email })}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <Badge tone={mb.role === "owner" ? "violet" : mb.role === "editor" ? "indigo" : "neutral"}>{roleLabel(mb.role)}</Badge>
              )}
            </li>
          ))}
        </ul>

        {canManage && (
          <form
            className="grid gap-2 sm:grid-cols-[1fr_130px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              act(() => addMemberAction({ email, role }), t(tm.added, { email, role: roleLabel(role) }), () => setEmail(""));
            }}
          >
            <Input type="email" placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label={tm.role}>
              {ROLES.map((r) => (
                <option key={r.role} value={r.role}>
                  {roleLabel(r.role)}
                </option>
              ))}
            </Select>
            <Button type="submit" disabled={pending || !email}>
              {pending ? <LogoSpinner size={16} /> : <UserPlus className="size-4" />} {tm.invite}
            </Button>
          </form>
        )}
        <dl className="grid gap-2 text-xs text-fg-3 sm:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r.role} className="rounded-xl bg-veil/[0.03] px-3 py-2">
              <dt className="font-medium text-fg-2">{m.roles[r.role].label}</dt>
              <dd className="mt-0.5">{m.roles[r.role].description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

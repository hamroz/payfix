"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { addMemberAction, removeMemberAction, setMemberRoleAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Badge, Button, Card, CardHeader, Input, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { initials } from "@/lib/format";
import { ROLES, roleLabel, type Role } from "@/lib/roles";

type Member = { userId: string; email: string; role: Role };

export function TeamSettings({ members, canManage, me }: { members: Member[]; canManage: boolean; me: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [pending, start] = useTransition();
  const toast = useToast();

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      toast.push(res.ok ? { tone: "success", title: success } : { tone: "error", title: "Couldn’t update the team", body: res.error });
      if (res.ok) after?.();
    });

  return (
    <Card id="team">
      <CardHeader title="Team" subtitle={canManage ? "Invite people and choose what they can do." : "People with access to this company. Only owners can change it."} />
      <div className="space-y-4 p-5">
        <ul className="divide-y divide-veil/[0.06] overflow-hidden rounded-2xl border border-veil/[0.07]">
          {members.map((m) => (
            <li key={m.userId} className="flex flex-wrap items-center gap-3 px-3.5 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet/15 font-display text-[11px] font-semibold text-violet">{initials(m.email.split("@")[0].replace(/[._-]/g, " "))}</span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {m.email}
                {m.email === me && <span className="ml-2 text-xs text-fg-3">(you)</span>}
              </span>
              {canManage ? (
                <div className="flex items-center gap-1.5">
                  <Select
                    value={m.role}
                    disabled={pending}
                    onChange={(e) => act(() => setMemberRoleAction(m.userId, e.target.value as Role), `${m.email} is now ${roleLabel(e.target.value as Role)}`)}
                    className="h-9 w-[110px] text-sm"
                    aria-label={`Role for ${m.email}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(() => removeMemberAction(m.userId), `${m.email} removed`)} aria-label={`Remove ${m.email}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <Badge tone={m.role === "owner" ? "violet" : m.role === "editor" ? "indigo" : "neutral"}>{roleLabel(m.role)}</Badge>
              )}
            </li>
          ))}
        </ul>

        {canManage && (
          <form
            className="grid gap-2 sm:grid-cols-[1fr_130px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              act(() => addMemberAction({ email, role }), `${email} added as ${roleLabel(role)}`, () => setEmail(""));
            }}
          >
            <Input type="email" placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Role">
              {ROLES.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.label}
                </option>
              ))}
            </Select>
            <Button type="submit" disabled={pending || !email}>
              {pending ? <LogoSpinner size={16} /> : <UserPlus className="size-4" />} Invite
            </Button>
          </form>
        )}
        <dl className="grid gap-2 text-xs text-fg-3 sm:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r.role} className="rounded-xl bg-veil/[0.03] px-3 py-2">
              <dt className="font-medium text-fg-2">{r.label}</dt>
              <dd className="mt-0.5">{r.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

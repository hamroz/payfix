import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { AuditHistory, Rows, StatusBadge } from "@/components/admin/bits";
import { ModerateButton } from "@/components/admin/moderate-button";
import { getI18n } from "@/lib/i18n/server";
import { audit, listAudit } from "@/lib/server/admin/audit";
import { userDetail } from "@/lib/server/admin/directory";
import { deps, requireAdmin } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.users.title} · ${m.admin.badge}` };
}

export default async function AdminUser({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const admin = await requireAdmin();
  const { db } = await deps();
  const d = await userDetail(db, id);
  if (!d) notFound();
  await audit(db, { adminEmail: admin, action: "user.view", targetType: "user", targetId: id });
  const history = (await listAudit(db, { targetType: "user", targetId: id, limit: 50 })).filter((r) => r.action !== "user.view");
  const { m, t, date, number } = await getI18n();
  const u = m.admin.users.detail;

  return (
    <>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-fg">
        <ArrowLeft className="size-4" /> {u.back}
      </Link>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2 break-all">
            {d.user.email}
            {d.user.admin && <ShieldCheck className="size-5 text-violet" aria-label={m.admin.badge} />}
          </span>
        }
        subtitle={t(u.joined, { date: date(d.user.createdAt) })}
        actions={<StatusBadge suspended={!!d.user.suspendedAt} />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={u.companies} />
          {d.companies.length === 0 ? (
            <p className="px-5 pb-5 pt-2 text-sm text-fg-3">{u.noCompanies}</p>
          ) : (
            <ul className="divide-y divide-veil/[0.06] px-5 pb-3">
              {d.companies.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/companies/${c.id}`} className="min-w-0 truncate font-medium text-fg hover:text-violet">
                    {c.name}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-fg-3">{m.roles[c.role].label}</span>
                    {c.suspended && <StatusBadge suspended />}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title={u.signals} />
          <div className="px-5 pb-3">
            <Rows
              rows={[
                { label: u.activeSessions, value: number(d.activeSessions) },
                { label: u.codes24h, value: number(d.codes24h) },
                { label: u.codes7d, value: number(d.codes7d) },
                { label: u.companiesCreated, value: number(d.companiesCreated) },
                { label: u.feedback, value: number(d.feedback) },
              ]}
            />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title={m.admin.actions.title} />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
            {d.user.admin ? (
              <p className="text-sm text-fg-3">{m.admin.actions.adminNote}</p>
            ) : (
              <>
                {d.user.suspendedAt ? <ModerateButton kind="restoreUser" targetId={id} /> : <ModerateButton kind="suspendUser" targetId={id} />}
                {!d.user.suspendedAt && d.activeSessions > 0 && <ModerateButton kind="signOutUser" targetId={id} />}
              </>
            )}
          </div>
          {d.user.suspendedReason && <p className="border-t border-veil/[0.06] px-5 py-3 text-[13px] text-fg-2">{d.user.suspendedReason}</p>}
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title={u.history} />
          <AuditHistory rows={history} />
        </Card>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { AuditHistory, Rows, StatusBadge } from "@/components/admin/bits";
import { getI18n } from "@/lib/i18n/server";
import { audit, listAudit } from "@/lib/server/admin/audit";
import { companyDetail } from "@/lib/server/admin/directory";
import { deps, requireAdmin } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.companies.title} · ${m.admin.badge}` };
}

export default async function AdminCompany({ params }: PageProps<"/admin/companies/[id]">) {
  const { id } = await params;
  const admin = await requireAdmin();
  const { db } = await deps();
  const d = await companyDetail(db, id);
  if (!d) notFound();
  await audit(db, { adminEmail: admin, action: "business.view", targetType: "business", targetId: id });
  const history = (await listAudit(db, { targetType: "business", targetId: id, limit: 50 })).filter((r) => r.action !== "business.view");
  const { m, t, date, number } = await getI18n();
  const c = m.admin.companies.detail;
  const col = m.admin.export.columns;

  return (
    <>
      <Link href="/admin/companies" className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-fg">
        <ArrowLeft className="size-4" /> {c.back}
      </Link>
      <PageHeader title={<span className="break-words">{d.company.name}</span>} subtitle={t(c.created, { date: date(d.company.createdAt) })} actions={<StatusBadge suspended={!!d.company.suspendedAt} />} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={c.members} />
          <ul className="divide-y divide-veil/[0.06] px-5 pb-3">
            {d.members.map((mem) => (
              <li key={mem.userId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link href={`/admin/users/${mem.userId}`} className="min-w-0 truncate font-medium text-fg hover:text-violet">
                  {mem.email}
                </Link>
                <span className="shrink-0 text-xs text-fg-3">{m.roles[mem.role].label}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title={c.counts} />
          <div className="px-5 pb-3">
            <Rows
              rows={[
                { label: col.invoices, value: number(d.counts.invoices) },
                { label: col.payments, value: number(d.counts.payments) },
                { label: col.openCases, value: number(d.counts.openCases) },
                { label: c.customers, value: number(d.counts.customers) },
                { label: c.inFlight, value: number(d.inFlightRefunds) },
              ]}
            />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title={m.admin.users.detail.history} />
          <AuditHistory rows={history} />
        </Card>
      </div>
    </>
  );
}

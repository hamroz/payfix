import type { Metadata } from "next";
import Link from "next/link";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { ExportLink } from "@/components/admin/bits";
import { getI18n } from "@/lib/i18n/server";
import { listAudit } from "@/lib/server/admin/audit";
import { deps, requireAdmin } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.audit.title} · ${m.admin.badge}` };
}

const targetHref = (type: string | null, id: string | null) => (type === "user" && id ? `/admin/users/${id}` : type === "business" && id ? `/admin/companies/${id}` : null);

export default async function AdminAudit() {
  await requireAdmin();
  const { db } = await deps();
  const rows = await listAudit(db, { limit: 300 });
  const { m, dateTime } = await getI18n();
  const au = m.admin.audit;

  return (
    <>
      <PageHeader title={au.title} subtitle={au.subtitle} actions={<ExportLink kind="audit" range="all" />} />
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title={au.empty} />
        ) : (
          <ul className="divide-y divide-veil/[0.06]">
            {rows.map((r) => {
              const href = targetHref(r.targetType, r.targetId);
              return (
                <li key={r.id} className="px-4 py-3 text-sm sm:px-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-mono text-[12.5px] text-fg">{r.action}</span>
                    <span className="text-xs text-fg-3">{dateTime(r.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 break-all text-xs text-fg-3">
                    {r.adminEmail}
                    {r.targetId && (
                      <>
                        {" → "}
                        {href ? (
                          <Link href={href} className="text-fg-2 hover:text-violet">
                            {r.targetId}
                          </Link>
                        ) : (
                          r.targetId
                        )}
                      </>
                    )}
                  </p>
                  {r.reason && <p className="mt-1 text-[13px] text-fg-2">{r.reason}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}

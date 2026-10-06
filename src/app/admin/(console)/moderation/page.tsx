import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { AddBlockForm } from "@/components/admin/add-block-form";
import { ModerateButton } from "@/components/admin/moderate-button";
import { getI18n } from "@/lib/i18n/server";
import { listBlocks, topCodeRequesters } from "@/lib/server/admin/moderation";
import { deps } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.moderation.title} · ${m.admin.badge}` };
}

export default async function AdminModeration() {
  const { db } = await deps();
  const top = await topCodeRequesters(db, 24);
  const active = await listBlocks(db, { active: true });
  const { m, t, p, dateTime } = await getI18n();
  const mo = m.admin.moderation;

  return (
    <>
      <PageHeader title={mo.title} subtitle={mo.subtitle} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={mo.topTitle} />
          {top.length === 0 ? (
            <p className="px-5 pb-5 pt-2 text-sm text-fg-3">{mo.topEmpty}</p>
          ) : (
            <ul className="divide-y divide-veil/[0.06] px-5 pb-3">
              {top.map((r) => (
                <li key={r.email} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  {r.userId ? (
                    <Link href={`/admin/users/${r.userId}`} className="min-w-0 truncate font-medium text-fg hover:text-violet">
                      {r.email}
                    </Link>
                  ) : (
                    <span className="min-w-0 truncate text-fg-2" title={mo.noAccount}>
                      {r.email}
                    </span>
                  )}
                  <span className="tabular shrink-0 text-xs text-fg-3">{p(mo.codes, r.count)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title={mo.addTitle} />
          <div className="p-5">
            <AddBlockForm />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title={mo.blocksTitle} />
          {active.length === 0 ? (
            <p className="px-5 pb-5 pt-2 text-sm text-fg-3">{mo.blocksEmpty}</p>
          ) : (
            <ul className="divide-y divide-veil/[0.06] px-5 pb-3">
              {active.map((b) => (
                <li key={b.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-[13px] text-fg">{b.target}</p>
                    <p className="mt-0.5 text-xs text-fg-3">
                      {mo.kinds[b.kind]} · {t(mo.by, { admin: b.createdBy, date: dateTime(b.createdAt) })}
                    </p>
                    <p className="mt-1 text-[13px] text-fg-2">{b.reason}</p>
                  </div>
                  <div className="shrink-0 sm:w-64">
                    <ModerateButton kind="liftBlock" targetId={b.id} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { DirectoryFilters, ExportLink, Pager, StatusBadge } from "@/components/admin/bits";
import { getI18n } from "@/lib/i18n/server";
import { listUsers, PAGE_SIZE, type StatusFilter } from "@/lib/server/admin/directory";
import { deps, requireAdmin } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.users.title} · ${m.admin.badge}` };
}

const asStatus = (v: unknown): StatusFilter => (v === "active" || v === "suspended" ? v : "all");
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminUsers({ searchParams }: PageProps<"/admin/users">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = { search: one(sp.q), status: asStatus(sp.status), page: Math.max(1, Number(one(sp.page)) || 1) };
  const { db } = await deps();
  const { rows, total } = await listUsers(db, q);
  const { m, p, date, number } = await getI18n();
  const u = m.admin.users;
  const pageHref = (page: number) => `/admin/users?${new URLSearchParams({ ...(q.search ? { q: q.search } : {}), ...(q.status !== "all" ? { status: q.status } : {}), page: String(page) })}`;

  return (
    <>
      <PageHeader title={u.title} subtitle={u.subtitle} actions={<ExportLink kind="users" range="all" />} />
      <DirectoryFilters base="/admin/users" search={q.search} status={q.status} placeholder={u.search} />
      <p className="mb-2 text-xs text-fg-3">{p(u.count, total)}</p>
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title={u.empty} />
        ) : (
          <ul className="divide-y divide-veil/[0.06]">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/users/${r.id}`} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-veil/[0.03] sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-fg">
                      <span className="truncate">{r.email}</span>
                      {r.admin && <ShieldCheck className="size-3.5 shrink-0 text-violet" aria-label={m.admin.badge} />}
                    </p>
                    <p className="tabular mt-0.5 text-xs text-fg-3">
                      {date(r.createdAt)} · {m.admin.export.columns.companies} {number(r.companies)} · {m.admin.export.columns.codes24h} {number(r.codes24h)}
                    </p>
                  </div>
                  <StatusBadge suspended={r.suspended} />
                  <ChevronRight className="size-4 text-fg-3 transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Pager page={q.page} total={total} pageSize={PAGE_SIZE} href={pageHref} />
    </>
  );
}

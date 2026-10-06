import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { DirectoryFilters, ExportLink, Pager, StatusBadge } from "@/components/admin/bits";
import { getI18n } from "@/lib/i18n/server";
import { listCompanies, PAGE_SIZE, type StatusFilter } from "@/lib/server/admin/directory";
import { deps } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.companies.title} · ${m.admin.badge}` };
}

const asStatus = (v: unknown): StatusFilter => (v === "active" || v === "suspended" ? v : "all");
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminCompanies({ searchParams }: PageProps<"/admin/companies">) {
  const sp = await searchParams;
  const q = { search: one(sp.q), status: asStatus(sp.status), page: Math.max(1, Number(one(sp.page)) || 1) };
  const { db } = await deps();
  const { rows, total } = await listCompanies(db, q);
  const { m, p, date, number } = await getI18n();
  const c = m.admin.companies;
  const col = m.admin.export.columns;
  const pageHref = (page: number) => `/admin/companies?${new URLSearchParams({ ...(q.search ? { q: q.search } : {}), ...(q.status !== "all" ? { status: q.status } : {}), page: String(page) })}`;

  return (
    <>
      <PageHeader title={c.title} subtitle={c.subtitle} actions={<ExportLink kind="companies" range="all" />} />
      <DirectoryFilters base="/admin/companies" search={q.search} status={q.status} placeholder={c.search} />
      <p className="mb-2 text-xs text-fg-3">{p(c.count, total)}</p>
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title={c.empty} />
        ) : (
          <ul className="divide-y divide-veil/[0.06]">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/companies/${r.id}`} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-veil/[0.03] sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-fg">
                      <span className="truncate">{r.name}</span>
                      {r.sample && <Badge className="shrink-0">{c.sampleBadge}</Badge>}
                    </p>
                    <p className="tabular mt-0.5 text-xs text-fg-3">
                      {date(r.createdAt)} · {col.members} {number(r.members)} · {col.invoices} {number(r.invoices)} · {col.payments} {number(r.payments)} · {col.openCases}{" "}
                      {number(r.openCases)}
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

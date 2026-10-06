import Link from "next/link";
import { Download, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, buttonClass, Card, inputClass } from "@/components/ui/primitives";
import { getI18n } from "@/lib/i18n/server";
import { RANGES, type Range } from "@/lib/server/admin/stats";
import { cn } from "@/lib/cn";

/** Period switch as links, so the range lives in the URL and survives reloads and sharing. */
export async function RangeTabs({ range, href }: { range: Range; href: (r: Range) => string }) {
  const { m } = await getI18n();
  return (
    <div role="tablist" aria-label={m.admin.range.label} className="inline-flex rounded-xl border border-veil/10 bg-veil/[0.03] p-0.5">
      {RANGES.map((r) => (
        <Link
          key={r}
          role="tab"
          aria-selected={r === range}
          href={href(r)}
          className={cn("rounded-[10px] px-3 py-1.5 text-[13px] transition", r === range ? "bg-veil/[0.08] font-medium text-fg" : "text-fg-3 hover:text-fg")}
        >
          {m.admin.range[r]}
        </Link>
      ))}
    </div>
  );
}

export async function ExportLink({ kind, range, cohort }: { kind: string; range?: Range; cohort?: string | null }) {
  const { m } = await getI18n();
  const query = new URLSearchParams({ ...(range ? { range } : {}), ...(cohort ? { c: cohort } : {}) }).toString();
  return (
    <a href={`/api/admin/export/${kind}${query ? `?${query}` : ""}`} className={buttonClass("secondary", "sm")} download>
      <Download className="size-4" /> {m.admin.export.button}
    </a>
  );
}

/** A headline number. `sub` carries the period change or a qualifier. */
export function StatTile({ label, value, sub, className }: { label: ReactNode; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <p className="text-[12.5px] text-fg-3">{label}</p>
      <p className="tabular mt-1.5 font-display text-2xl font-semibold tracking-tight text-fg">{value}</p>
      {sub && <p className="mt-1 text-xs text-fg-3">{sub}</p>}
    </Card>
  );
}

/** Label/value rows inside a card. */
export function Rows({ rows }: { rows: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-veil/[0.06]">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2.5 text-sm">
          <dt className="text-fg-2">{r.label}</dt>
          <dd className="tabular font-medium text-fg">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** GET search form plus status filter links; state lives in the URL. */
export async function DirectoryFilters({ base, search, status, placeholder }: { base: string; search: string; status: "all" | "active" | "suspended"; placeholder: string }) {
  const { m } = await getI18n();
  const href = (s: string) => `${base}?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(s !== "all" ? { status: s } : {}) })}`;
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form action={base} className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-3" />
        <input name="q" defaultValue={search} placeholder={placeholder} aria-label={placeholder} className={cn(inputClass, "pl-10")} />
        {status !== "all" && <input type="hidden" name="status" value={status} />}
      </form>
      <div className="inline-flex rounded-xl border border-veil/10 bg-veil/[0.03] p-0.5">
        {(["all", "active", "suspended"] as const).map((s) => (
          <Link key={s} href={href(s)} className={cn("rounded-[10px] px-3 py-1.5 text-[13px] transition", s === status ? "bg-veil/[0.08] font-medium text-fg" : "text-fg-3 hover:text-fg")}>
            {m.admin.status[s]}
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function Pager({ page, total, pageSize, href }: { page: number; total: number; pageSize: number; href: (page: number) => string }) {
  const { m, t } = await getI18n();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonClass("secondary", "sm")}>
          {m.admin.pager.previous}
        </Link>
      ) : (
        <span />
      )}
      <span className="tabular text-fg-3">{t(m.admin.pager.page, { page, pages })}</span>
      {page < pages ? (
        <Link href={href(page + 1)} className={buttonClass("secondary", "sm")}>
          {m.admin.pager.next}
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

export async function StatusBadge({ suspended }: { suspended: boolean }) {
  const { m } = await getI18n();
  return <Badge tone={suspended ? "rose" : "mint"}>{suspended ? m.admin.status.suspended : m.admin.status.active}</Badge>;
}

/** The admin history of one user, company, or block, newest first. */
export async function AuditHistory({ rows }: { rows: { id: string; createdAt: string; adminEmail: string; action: string; reason: string | null }[] }) {
  const { m, dateTime } = await getI18n();
  if (!rows.length) return <p className="px-5 pb-5 pt-2 text-sm text-fg-3">{m.admin.users.detail.noHistory}</p>;
  return (
    <ul className="divide-y divide-veil/[0.06] px-5 pb-3">
      {rows.map((r) => (
        <li key={r.id} className="py-2.5 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-mono text-[12.5px] text-fg">{r.action}</span>
            <span className="text-xs text-fg-3">{dateTime(r.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-xs text-fg-3">{r.adminEmail}</p>
          {r.reason && <p className="mt-1 text-[13px] text-fg-2">{r.reason}</p>}
        </li>
      ))}
    </ul>
  );
}

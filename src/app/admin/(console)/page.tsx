import type { Metadata } from "next";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { DailyLines, FunnelBars } from "@/components/admin/charts";
import { ExportLink, RangeTabs, Rows, StatTile } from "@/components/admin/bits";
import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { formatUsd } from "@/lib/money";
import { FUNNEL_STEPS, overviewStats, parseRange } from "@/lib/server/admin/stats";
import { deps, requireAdmin } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.overview.title} · ${m.admin.badge}` };
}

export default async function AdminOverview({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const range = parseRange((await searchParams).range);
  const { db } = await deps();
  const o = await overviewStats(db, range);
  const { m, t, number, tag } = await getI18n();
  const a = m.admin;
  const ov = a.overview;
  const inRange = (n: number) => t(ov.tiles.inRange, { count: number(n) });
  const usd = (units: string) => formatUsd(BigInt(units));
  const token = env().PAYFIX_TOKEN_LABEL;
  const day = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(tag, { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <>
      <PageHeader
        title={ov.title}
        subtitle={ov.subtitle}
        actions={
          <>
            <RangeTabs range={range} href={(r) => `/admin?range=${r}`} />
            <ExportLink kind="daily" range={range} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label={ov.tiles.users} value={number(o.tiles.users.total)} sub={inRange(o.tiles.users.inRange)} />
        <StatTile label={ov.tiles.companies} value={number(o.tiles.companies.total)} sub={inRange(o.tiles.companies.inRange)} />
        <StatTile label={ov.tiles.activeCompanies} value={number(o.tiles.activeCompanies)} sub={ov.tiles.activeHint} />
        <StatTile label={ov.tiles.invoices} value={number(o.tiles.invoices.total)} sub={`${inRange(o.tiles.invoices.inRange)} · ${t(ov.tiles.invoicesHint, { sample: number(o.tiles.sampleInvoices) })}`} />
        <StatTile label={ov.tiles.payments} value={number(o.tiles.payments.total)} sub={inRange(o.tiles.payments.inRange)} />
        <StatTile label={ov.tiles.openCases} value={number(o.tiles.openCases)} />
        <StatTile
          label={ov.tiles.feedback}
          value={number(o.tiles.feedback.total)}
          sub={o.tiles.nps === null ? ov.tiles.noNps : t(ov.tiles.nps, { score: o.tiles.nps })}
        />
        <StatTile label={ov.system.chain} value={<span className="text-lg">{o.system.cluster}</span>} sub={token} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title={ov.growth.title} subtitle={ov.growth.subtitle} />
          <div className="p-5">
            <DailyLines
              data={o.growth}
              formatDay={day}
              series={[
                { key: "users", label: ov.growth.users, color: "chart-1" },
                { key: "companies", label: ov.growth.companies, color: "chart-2" },
              ]}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title={ov.funnel.title} subtitle={ov.funnel.subtitle} />
          <div className="p-5">
            <FunnelBars steps={FUNNEL_STEPS.map((k) => ({ label: a.funnelSteps[k], value: o.funnel[k] }))} pctLabel={(pct) => t(ov.funnel.of, { pct })} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title={ov.resolution.title} />
          <div className="px-5 pb-4 pt-2">
            <p className="mt-2 text-[12.5px] text-fg-3">{ov.resolution.byKind}</p>
            <Rows rows={(Object.keys(o.cases.byKind) as (keyof typeof o.cases.byKind)[]).map((k) => ({ label: a.caseKinds[k], value: number(o.cases.byKind[k]) }))} />
            <p className="mt-4 text-[12.5px] text-fg-3">{ov.resolution.byStatus}</p>
            <Rows rows={(Object.keys(o.cases.byStatus) as (keyof typeof o.cases.byStatus)[]).map((k) => ({ label: a.caseStatuses[k], value: number(o.cases.byStatus[k]) }))} />
            <div className="mt-4">
              <Rows
                rows={[
                  {
                    label: ov.resolution.median,
                    value: o.cases.medianMinutesToResolve === null ? ov.resolution.none : t(ov.resolution.medianValue, { minutes: number(o.cases.medianMinutesToResolve) }),
                  },
                  { label: ov.resolution.approvals, value: t(ov.resolution.approvalsValue, { invalidated: o.approvals.invalidated, total: o.approvals.total }) },
                ]}
              />
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title={ov.money.title} subtitle={`${ov.money.subtitle} ${token}.`} />
          <div className="px-5 pb-4 pt-2">
            <Rows
              rows={[
                { label: ov.money.received, value: usd(o.money.received) },
                { label: ov.money.invoice, value: usd(o.money.invoice) },
                { label: ov.money.credit, value: usd(o.money.credit) },
                { label: ov.money.refundPending, value: usd(o.money.refundPending) },
                { label: ov.money.refunded, value: usd(o.money.refunded) },
                { label: ov.money.unresolved, value: usd(o.money.unresolved) },
              ]}
            />
            <p className="mt-4 text-[12.5px] text-fg-3">{ov.resolution.refunds}</p>
            <Rows rows={(Object.keys(o.refunds) as (keyof typeof o.refunds)[]).map((k) => ({ label: a.refundStatuses[k], value: number(o.refunds[k]) }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title={ov.system.title} />
          <div className="px-5 pb-4 pt-2">
            <Rows
              rows={[
                { label: ov.system.emailPending, value: number(o.system.emailPending) },
                { label: ov.system.emailFailed, value: number(o.system.emailFailed) },
                { label: ov.system.codes24h, value: number(o.system.codes24h) },
                { label: ov.system.faucet24h, value: number(o.system.faucet24h) },
              ]}
            />
          </div>
        </Card>
      </div>
    </>
  );
}

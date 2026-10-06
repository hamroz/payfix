import type { Metadata } from "next";
import Link from "next/link";
import { Quote, UserRound } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/interactive";
import { DistributionBars } from "@/components/admin/charts";
import { ExportLink, RangeTabs, StatTile } from "@/components/admin/bits";
import { BulkList } from "@/components/admin/bulk-list";
import { DeleteFeedbackButton } from "@/components/admin/delete-feedback-button";
import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { parseRange, type Range } from "@/lib/server/admin/stats";
import { deps, requireAdmin } from "@/lib/server/context";
import { ANSWER_KEYS, feedbackSummary, listFeedback } from "@/lib/server/feedback";
import { cn } from "@/lib/cn";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: `${m.admin.feedback.title} · ${m.admin.badge}` };
}

export default async function AdminFeedback({ searchParams }: PageProps<"/admin/feedback">) {
  await requireAdmin();
  const sp = await searchParams;
  const range = parseRange(sp.range ?? "all");
  const cohort = typeof sp.c === "string" && sp.c ? sp.c : null;
  const { db } = await deps();
  const s = await feedbackSummary(db, { range, cohort });
  const responses = await listFeedback(db, { range, cohort, limit: 200 });
  const { m, t, dateTime, number } = await getI18n();
  const f = m.admin.feedback;
  const link = `${env().APP_URL}/feedback${cohort ? `?c=${cohort}` : ""}`;
  const href = (r: Range, c = cohort) => `/admin/feedback?${new URLSearchParams({ range: r, ...(c ? { c } : {}) })}`;
  const ofN = (count: number) => t(f.ofN, { count: number(count), n: number(s.n) });

  return (
    <>
      <PageHeader
        title={f.title}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {t(f.subtitle, { link: "" })}
            <code className="rounded-md bg-veil/[0.05] px-1.5 py-0.5 font-mono text-[12px] text-fg">{link}</code>
            <CopyButton value={link} />
          </span>
        }
        actions={
          <>
            <RangeTabs range={range} href={(r) => href(r)} />
            <ExportLink kind="feedback" range={range} cohort={cohort} />
          </>
        }
      />

      {s.cohorts.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px]">
          <span className="mr-1 text-fg-3">{f.cohort}</span>
          {[null, ...s.cohorts].map((c) => (
            <Link
              key={c ?? "all"}
              href={href(range, c)}
              className={cn("rounded-full border px-2.5 py-1 transition", c === cohort ? "border-violet/40 bg-violet/10 text-fg" : "border-veil/10 text-fg-3 hover:text-fg")}
            >
              {c ?? f.allCohorts}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label={f.responses} value={number(s.n)} />
        <StatTile label={f.completedUnaided} value={ofN(s.completed.unaided)} sub={`${f.completedAided}: ${number(s.completed.aided)} · ${f.completedNo}: ${number(s.completed.no)}`} />
        <StatTile
          label={f.medianMinutes}
          value={s.medianMinutes === null ? "—" : t(f.minutesValue, { minutes: number(s.medianMinutes) })}
          sub={s.avgEase === null ? undefined : `${f.avgEase}: ${t(f.easeValue, { ease: number(s.avgEase) })}`}
        />
        <StatTile
          label={f.nps}
          value={s.nps.score === null ? "—" : number(s.nps.score)}
          sub={t(f.npsBreakdown, { promoters: number(s.nps.promoters), passives: number(s.nps.passives), detractors: number(s.nps.detractors) })}
        />
      </div>

      {s.n > 0 && (
        <Card className="mt-4">
          <div className="grid gap-6 p-5 md:grid-cols-[1fr_2fr]">
            <DistributionBars label={f.easeDist} values={s.easeDist} labels={["1", "2", "3", "4", "5"]} />
            <DistributionBars label={f.npsDist} values={s.npsDist} labels={s.npsDist.map((_, i) => String(i))} />
          </div>
        </Card>
      )}

      <div className="mt-4 space-y-3">
          <BulkList
            kind="feedback"
            layout="cards"
            items={responses.map((r) => ({
              id: r.id,
              label: dateTime(r.createdAt),
              node: (
            <Card>
              <CardHeader
                className="pr-12"
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {f.completed[r.completed]}
                    <Badge tone="indigo">
                      {f.easeDist} {r.ease}/5
                    </Badge>
                    <Badge tone={r.nps >= 9 ? "mint" : r.nps >= 7 ? "neutral" : "amber"}>NPS {r.nps}</Badge>
                    {r.quoteOk && (
                      <Badge tone="violet">
                        <Quote className="size-3" /> {f.quotable}
                      </Badge>
                    )}
                  </span>
                }
                subtitle={[dateTime(r.createdAt), r.cohort, r.locale.toUpperCase(), r.device && m.feedback.device[r.device], r.minutes !== null && t(f.minutes, { minutes: r.minutes }), r.about]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <dl className="space-y-3 px-5 pb-5 pt-3">
                {ANSWER_KEYS.filter((k) => r.answers[k]).map((k) => (
                  <div key={k}>
                    <dt className="text-[12.5px] text-fg-3">{m.feedback.questions[k]}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-fg">{r.answers[k]}</dd>
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-fg-3">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5" />
                    {r.account ? (
                      <span>
                        {r.account.email} · {t(f.reached, { step: m.admin.funnelSteps[r.account.furthest] })}
                      </span>
                    ) : (
                      f.anonymous
                    )}
                  </span>
                  <DeleteFeedbackButton id={r.id} />
                </div>
              </dl>
            </Card>
              ),
            }))}
            empty={
              <Card>
                <EmptyState title={f.empty} />
              </Card>
            }
          />
      </div>
    </>
  );
}

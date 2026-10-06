// Small admin charts as plain SVG/HTML (no chart library). Series colors are the validated
// --chart-1 / --chart-2 tokens; text always uses text tokens. Each mark has a hover tooltip
// (<title>), and every chart's numbers also appear as text, so nothing depends on color alone.

type Series = { key: string; label: string; color: "chart-1" | "chart-2" };

/** Two daily counts as lines, one shared axis starting at zero. */
export function DailyLines({
  data,
  series,
  formatDay,
}: {
  data: Record<string, number | string>[];
  series: Series[];
  formatDay: (day: string) => string;
}) {
  const W = 600;
  const H = 160;
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key]))));
  const x = (i: number) => (data.length === 1 ? W / 2 : (i / (data.length - 1)) * W);
  const y = (v: number) => H - (v / max) * (H - 8) - 1;
  const totals = series.map((s) => data.reduce((sum, d) => sum + Number(d[s.key]), 0));
  const step = W / Math.max(1, data.length);

  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-2">
        {series.map((s, i) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className={s.color === "chart-1" ? "h-0.5 w-3.5 rounded-full bg-chart-1" : "h-0.5 w-3.5 rounded-full bg-chart-2"} />
            {s.label} <span className="tabular font-medium text-fg">{totals[i]}</span>
          </span>
        ))}
      </figcaption>
      <div className="flex gap-2">
        <div className="tabular flex h-40 flex-col justify-between text-right text-[11px] text-fg-3">
          <span>{max}</span>
          <span>0</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-40 w-full overflow-visible" role="img" aria-label={series.map((s, i) => `${s.label}: ${totals[i]}`).join(", ")}>
          {[0, 0.5, 1].map((f) => (
            <line key={f} x1={0} x2={W} y1={y(max * f)} y2={y(max * f)} className="stroke-veil/[0.07]" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s) => (
            <polyline
              key={s.key}
              points={data.map((d, i) => `${x(i)},${y(Number(d[s.key]))}`).join(" ")}
              fill="none"
              className={s.color === "chart-1" ? "stroke-chart-1" : "stroke-chart-2"}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {data.map((d, i) => (
            <rect key={String(d.day)} x={x(i) - step / 2} y={0} width={step} height={H} className="fill-transparent hover:fill-veil/[0.05]">
              <title>{`${formatDay(String(d.day))} · ${series.map((s) => `${s.label} ${d[s.key]}`).join(" · ")}`}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="mt-1.5 flex justify-between pl-6 text-[11px] text-fg-3">
        <span>{formatDay(String(data[0]?.day ?? ""))}</span>
        <span>{formatDay(String(data.at(-1)?.day ?? ""))}</span>
      </div>
    </figure>
  );
}

/** Horizontal bars for a funnel: each step against the first. */
export function FunnelBars({ steps, pctLabel }: { steps: { label: string; value: number }[]; pctLabel: (pct: number) => string }) {
  const base = Math.max(1, steps[0]?.value ?? 0);
  return (
    <ol className="space-y-3">
      {steps.map((s) => {
        const pct = Math.round((s.value / base) * 100);
        return (
          <li key={s.label} title={`${s.label}: ${s.value} (${pctLabel(pct)})`}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-fg-2">{s.label}</span>
              <span className="tabular text-fg">
                <span className="font-medium">{s.value}</span> <span className="text-xs text-fg-3">{pctLabel(pct)}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-veil/[0.05]">
              <div className="h-2 rounded-full bg-chart-1" style={{ width: `${s.value ? Math.max(pct, 1.5) : 0}%` }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Vertical bars for a small distribution (e.g. scores 1–5 or 0–10), count above each bar. */
export function DistributionBars({ label, values, labels }: { label: string; values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <figure>
      <figcaption className="mb-2 text-[12.5px] text-fg-3">{label}</figcaption>
      <div className="flex h-32 items-end gap-[2px]" role="img" aria-label={`${label}: ${values.map((v, i) => `${labels[i]} ${v}`).join(", ")}`}>
        {values.map((v, i) => (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" title={`${labels[i]}: ${v}`}>
            <span className="tabular mb-1 h-4 text-[11px] text-fg-2">{v || ""}</span>
            <div className="flex w-full flex-1 items-end justify-center">
              <div className="w-full max-w-9 rounded-t-[4px] bg-chart-1" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 2 : 0 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px] border-t border-veil/10 pt-1">
        {labels.map((l) => (
          <span key={l} className="tabular min-w-0 flex-1 text-center text-[11px] text-fg-3">
            {l}
          </span>
        ))}
      </div>
    </figure>
  );
}

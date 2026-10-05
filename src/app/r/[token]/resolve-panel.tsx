"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Check, FileText, Hourglass, PencilLine, PiggyBank, ReceiptText, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { demoProofAction, destinationChallengeAction, submitProposalAction } from "@/app/actions/public";
import { ActivityFeed } from "@/components/app/activity";
import { ApprovalChip, PlanLines } from "@/components/app/plan";
import { CaseStatusBadge } from "@/components/app/status";
import { LogoMark, LogoSpinner } from "@/components/brand/logo";
import { AnimatedAmount, FadeIn } from "@/components/ui/motion";
import { Alert, Button, Card, CardHeader, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WalletButton } from "@/components/wallet/wallet-button";
import type { DestinationProof, ProposalLine } from "@/lib/db/schema";
import type { PublicConfig } from "@/lib/env";
import { formatUsd, fromUnits, tryToUnits } from "@/lib/money";
import { shortAddress } from "@/lib/solana/tx";
import type { CaseDetail } from "@/lib/server/views";
import { cn } from "@/lib/cn";
import { amountFit } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";

type Props = { token: string; businessName: string; customerName: string; config: PublicConfig; detail: CaseDetail };

export function ResolvePanel({ token, businessName, customerName, config, detail: d }: Props) {
  const current = d.proposals[0] ?? null;
  const editable = d.case.status === "open" || d.case.status === "proposed" || d.case.status === "approved";
  const declined = current?.status === "declined";
  const [editing, setEditing] = useState((!current || declined) && editable);
  const available = BigInt(current && !editable ? current.available : d.available);
  const { m, t } = useI18n();
  const P = m.resolve.panel;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-5">
        <FadeIn>
          <div className="flex flex-wrap items-center gap-2">
            <CaseStatusBadge status={d.case.status} customerView />
          </div>
          <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight tracking-tight sm:text-3xl">
            {d.case.status === "resolved" ? P.headingResolved : t(P.heading, { business: businessName })}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-fg-2">
            {d.case.status === "resolved"
              ? P.bodyResolved
              : d.invoice
                ? t(P.bodyInvoice, { customer: customerName, paid: formatUsd(BigInt(d.invoicePaid)), invoice: d.invoice.number, total: formatUsd(BigInt(d.invoice.amount)), business: businessName })
                : t(P.bodyUnmatched, { customer: customerName, amount: formatUsd(BigInt(d.received)), business: businessName })}
          </p>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="@container min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.14em] text-fg-3">{d.case.status === "resolved" ? P.extraResolved : P.extraToAllocate}</p>
                <AnimatedAmount units={(d.case.status === "resolved" || !editable ? (current?.available ?? d.available) : d.available).toString()} className="tabular mt-1 block whitespace-nowrap font-display font-semibold tracking-tight text-gradient" style={amountFit(d.available, 2.25)} />
              </div>
              <div className="flex flex-col gap-1.5">
                {d.transfers
                  .filter((tr) => tr.direction === "in")
                  .map((tr) => (
                    <span key={tr.id} className="inline-flex items-center gap-2 text-xs text-fg-3">
                      <ArrowDownLeft className="size-3.5 text-mint" /> {t(P.received, { amount: formatUsd(BigInt(tr.amount)) })}
                    </span>
                  ))}
              </div>
            </div>
          </Card>
        </FadeIn>

        {declined && editable && (
          <FadeIn delay={0.05}>
            <div className="rounded-2xl border border-amber/25 bg-amber/[0.07] p-4">
              <p className="text-sm font-medium text-amber">{t(P.changeRequested, { business: businessName, version: String(current!.version) })}</p>
              <p className="mt-1 text-sm text-fg-2">{t(m.resolve.quoted, { text: current!.businessNote ?? "" })}</p>
            </div>
          </FadeIn>
        )}

        <AnimatePresence mode="wait">
          {editing && editable ? (
            <motion.div key="builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <PlanBuilder token={token} available={BigInt(d.available)} openInvoices={d.openInvoices.filter((i) => BigInt(i.remaining) > 0n)} current={current} config={config} businessName={businessName} onDone={() => setEditing(false)} onCancel={current && !declined ? () => setEditing(false) : undefined} />
            </motion.div>
          ) : current ? (
            <motion.div key="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card>
                <CardHeader
                  title={t(P.yourPlan, { version: String(current.version) })}
                  subtitle={
                    current.status === "submitted"
                      ? t(P.planSubmitted, { business: businessName })
                      : current.status === "approved"
                        ? t(P.planApproved, { business: businessName })
                        : current.status === "executed"
                          ? d.case.status === "resolved"
                            ? P.planExecutedResolved
                            : t(P.planExecuted, { business: businessName })
                          : m.cases.proposalStatus[current.status]
                  }
                  action={
                    current.status === "submitted" ? (
                      <Hourglass className="size-5 text-violet" />
                    ) : (
                      <span className="grid size-7 place-items-center rounded-full bg-mint/15 text-mint">
                        <Check className="size-4" />
                      </span>
                    )
                  }
                />
                <div className="space-y-3 p-5">
                  <PlanLines lines={current.lines} destination={current.refundDestination} proofMethod={current.proofMethod} invoiceNumbers={d.invoiceNumbers} />
                  {current.approvals.filter((a) => !a.invalidatedAt).map((a) => (
                    <ApprovalChip key={a.id} approval={{ ...a, approvedBy: businessName }} />
                  ))}
                  {d.case.status === "executing" && d.refund && (
                    <div className="flex items-center gap-3 rounded-xl border border-cyan/20 bg-cyan/[0.05] px-3.5 py-3 text-sm">
                      <LogoSpinner size={22} />
                      <span className="text-fg-2">
                        {t(d.refund.status === "submitted" ? P.refundConfirming : P.refundReserved, { amount: formatUsd(BigInt(d.refund.amount)), business: businessName })}
                      </span>
                    </div>
                  )}
                  {editable && (
                    <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
                      <PencilLine className="size-4" /> {P.changePlan}
                    </Button>
                  )}
                  {editable && current.status === "approved" && <p className="text-center text-xs text-fg-3">{t(P.changeApprovedNote, { business: businessName })}</p>}
                </div>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {d.case.status === "resolved" && (
          <FadeIn delay={0.1}>
            <Card className="flex flex-col items-center p-8 text-center">
              <LogoMark size={72} animate />
              <p className="mt-5 font-display text-xl font-semibold">{P.loopClosed}</p>
              <p className="mt-1 max-w-sm text-sm text-fg-2">
                {available > 0n ? t(P.placedAndShared, { amount: formatUsd(available), business: businessName }) : t(P.shared, { business: businessName })}
              </p>
              <Link href={`/receipt/${d.case.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-veil/[0.06] px-4 py-2.5 text-sm font-medium hover:bg-veil/[0.1]">
                <ReceiptText className="size-4" /> {P.viewReceipt}
              </Link>
            </Card>
          </FadeIn>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <FadeIn delay={0.1}>
          <Card className="p-5">
            <h3 className="font-display text-[15px] font-semibold">{P.howTitle}</h3>
            <ol className="mt-3 space-y-3 text-[13px] text-fg-2">
              {[P.how.choose, P.how.sign, t(P.how.approve, { business: businessName }), t(P.how.refund, { business: businessName })].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-veil/[0.06] text-[11px] font-semibold text-fg">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader title={P.timeline} />
            <ActivityFeed events={d.activity} viewer="customer" businessName={businessName} />
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

type Row = { key: string; type: ProposalLine["type"]; invoice?: CaseDetail["openInvoices"][number]; invoiceId?: string; max?: bigint; value: string };

function PlanBuilder({ token, available, openInvoices, current, config, businessName, onDone, onCancel }: { token: string; available: bigint; openInvoices: CaseDetail["openInvoices"]; current: CaseDetail["proposals"][number] | null; config: PublicConfig; businessName: string; onDone: () => void; onCancel?: () => void }) {
  const initial = (type: string, invoiceId?: string) => {
    const l = current?.lines.find((x) => x.type === type && (type !== "invoice" || (x.type === "invoice" && x.invoiceId === invoiceId)));
    return l ? fromUnits(BigInt(l.amount)) : "";
  };
  const [rows, setRows] = useState<Row[]>([
    ...openInvoices.map((i) => ({ key: i.id, type: "invoice" as const, invoice: i, invoiceId: i.id, max: BigInt(i.remaining), value: initial("invoice", i.id) })),
    { key: "credit", type: "credit" as const, value: initial("credit") },
    { key: "refund", type: "refund" as const, value: initial("refund") },
  ]);
  const [destination, setDestination] = useState<{ address: string; proof: DestinationProof } | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const { m, t } = useI18n();
  const B = m.resolve.builder;

  const describe = (r: Row) =>
    r.type === "invoice"
      ? { label: t(B.applyTo, { invoice: r.invoice!.number }), hint: t(B.invoiceHint, { title: r.invoice!.title, amount: formatUsd(BigInt(r.invoice!.remaining)) }) }
      : r.type === "credit"
        ? { label: B.keepAsCredit, hint: t(B.creditHint, { business: businessName }) }
        : { label: B.refundToMe, hint: B.refundHint };
  const parsed = rows.map((r) => ({ ...r, ...describe(r), units: r.value ? tryToUnits(r.value) : 0n }));
  const invalid = parsed.some((r) => r.units === null);
  const total = parsed.reduce((a, r) => a + (r.units ?? 0n), 0n);
  const left = available - total;
  const refund = parsed.find((r) => r.type === "refund")?.units ?? 0n;
  const overInvoice = parsed.find((r) => r.max !== undefined && (r.units ?? 0n) > r.max);
  const needsDestination = refund > 0n && !destination;
  const ready = !invalid && left === 0n && !overInvoice && !needsDestination && total > 0n;

  const set = (key: string, value: string) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, value: value.replace(/[^\d.]/g, "") } : r)));
  const preset = (values: Record<string, bigint>) => setRows((rs) => rs.map((r) => ({ ...r, value: values[r.key] ? fromUnits(values[r.key]) : "" })));
  const firstInv = openInvoices[0];
  // Fill invoices in due-date order, oldest first; anything left over is refunded.
  const oldestFirst = (() => {
    const values: Record<string, bigint> = {};
    let left = available;
    for (const inv of [...openInvoices].sort((a, b) => a.dueAt.localeCompare(b.dueAt))) {
      if (left === 0n) break;
      const take = BigInt(inv.remaining) < left ? BigInt(inv.remaining) : left;
      values[inv.id] = take;
      left -= take;
    }
    if (left > 0n) values.refund = left;
    return values;
  })();
  const presets: { label: string; values: Record<string, bigint> }[] = [
    ...(openInvoices.length > 1 ? [{ label: B.presets.oldestFirst, values: oldestFirst }] : []),
    ...(firstInv ? [{ label: t(B.presets.allTo, { invoice: firstInv.number }), values: { [firstInv.id]: available < BigInt(firstInv.remaining) ? available : BigInt(firstInv.remaining), refund: available > BigInt(firstInv.remaining) ? available - BigInt(firstInv.remaining) : 0n } }] : []),
    ...(firstInv ? [{ label: B.presets.split, values: { [firstInv.id]: (available * 60n) / 100n, refund: available - (available * 60n) / 100n } }] : []),
    { label: B.presets.credit, values: { credit: available } },
    { label: B.presets.refundAll, values: { refund: available } },
  ];

  const submit = () =>
    start(async () => {
      setError(null);
      const lines: ProposalLine[] = parsed
        .filter((r) => (r.units ?? 0n) > 0n)
        .map((r) => (r.type === "invoice" ? { type: "invoice", invoiceId: r.invoiceId!, amount: r.value } : { type: r.type, amount: r.value }) as ProposalLine);
      const res = await submitProposalAction(token, {
        lines,
        refundDestination: refund > 0n ? destination!.address : null,
        destinationProof: refund > 0n ? destination!.proof : null,
        note,
      });
      if (!res.ok) return setError(res.error);
      toast.push({ tone: "success", title: t(B.sentToast, { version: String(res.version), business: businessName }), body: B.sentToastBody });
      onDone();
      router.refresh();
    });

  const segs = parsed.filter((r) => (r.units ?? 0n) > 0n);

  return (
    <Card>
      <CardHeader title={current ? t(B.reviseTitle, { version: String(current.version + 1) }) : B.chooseTitle} subtitle={t(B.subtitle, { amount: formatUsd(available) })} />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} onClick={() => preset(p.values)} className="rounded-full border border-veil/10 bg-veil/[0.04] px-3 py-1.5 text-xs text-fg-2 transition hover:border-violet/40 hover:text-fg">
              <Sparkles className="mr-1 inline size-3 text-violet" />
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {parsed.map((r) => {
            const Icon = r.type === "invoice" ? FileText : r.type === "credit" ? PiggyBank : ArrowUpRight;
            const active = (r.units ?? 0n) > 0n;
            return (
              <motion.div key={r.key} layout className={cn("flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition", active ? "border-violet/30 bg-violet/[0.05]" : "border-veil/[0.07] bg-veil/[0.02]")}>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", r.type === "invoice" ? "bg-indigo/15 text-periwinkle" : r.type === "credit" ? "bg-violet/15 text-violet" : "bg-mint/10 text-mint")}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.label}</p>
                  {r.hint && <p className="truncate text-xs text-fg-3">{r.hint}</p>}
                </div>
                <div className="relative w-32 shrink-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3">$</span>
                  <Input inputMode="decimal" placeholder="0" value={r.value} onChange={(e) => set(r.key, e.target.value)} className={cn("h-10 pl-6 text-right font-display font-semibold tabular", r.max !== undefined && (r.units ?? 0n) > r.max && "border-rose/50")} aria-label={r.label} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div>
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-veil/[0.05]">
            {segs.map((r) => (
              <motion.div key={r.key} layout className={cn("h-full", r.type === "invoice" ? "bg-indigo" : r.type === "credit" ? "bg-violet" : "bg-mint")} animate={{ width: `${Math.min(100, Number(((r.units ?? 0n) * 10000n) / (available || 1n)) / 100)}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            ))}
          </div>
          <p className={cn("mt-2 text-sm", left === 0n && total > 0n ? "text-mint" : left < 0n ? "text-rose" : "text-fg-3")}>
            {left === 0n && total > 0n ? (
              <>
                <Check className="mr-1 inline size-4" /> {t(B.allAllocated, { amount: formatUsd(available) })}
              </>
            ) : left > 0n ? (
              t(B.leftToAllocate, { amount: formatUsd(left) })
            ) : (
              t(B.overAllocated, { amount: formatUsd(-left) })
            )}
          </p>
        </div>

        <AnimatePresence>
          {refund > 0n && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <DestinationPicker token={token} config={config} value={destination} onChange={setDestination} />
            </motion.div>
          )}
        </AnimatePresence>

        <Input placeholder={t(B.notePlaceholder, { business: businessName })} value={note} onChange={(e) => setNote(e.target.value)} />

        {error && <Alert tone="rose">{error}</Alert>}

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={pending}>
              {m.common.cancel}
            </Button>
          )}
          <Button size="lg" className="flex-1" disabled={!ready || pending} onClick={submit}>
            {pending ? <LogoSpinner size={20} /> : <ShieldCheck className="size-4" />} {current ? t(B.sendRevised, { version: String(current.version + 1) }) : t(B.sendPlan, { business: businessName })}
          </Button>
        </div>
        {needsDestination && <p className="text-center text-xs text-fg-3">{B.needsWallet}</p>}
      </div>
    </Card>
  );
}

function DestinationPicker({ token, config, value, onChange }: { token: string; config: PublicConfig; value: { address: string; proof: DestinationProof } | null; onChange: (v: { address: string; proof: DestinationProof } | null) => void }) {
  const { publicKey, signMessage } = useWallet();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { m, t } = useI18n();
  const W = m.resolve.destination;

  const viaWallet = async () => {
    if (!publicKey || !signMessage) return setError(W.cantSign);
    setBusy("wallet");
    setError(null);
    try {
      const address = publicKey.toBase58();
      const ch = await destinationChallengeAction(token, address);
      if (!ch.ok) throw new Error(ch.error);
      const sig = await signMessage(new TextEncoder().encode(ch.message));
      onChange({ address, proof: { method: "wallet_signature", message: ch.message, signature: bs58.encode(sig), verifiedAt: new Date().toISOString() } });
    } catch (e) {
      setError(e instanceof Error ? e.message : W.signingCancelled);
    } finally {
      setBusy(null);
    }
  };

  const viaDemo = async (which: "primary" | "alternate") => {
    setBusy(which);
    setError(null);
    const res = await demoProofAction(token, which);
    setBusy(null);
    if (!res.ok) return setError(res.error);
    onChange({ address: res.destination, proof: res.proof });
  };

  const choices = useMemo(() => (config.demoMode ? (["primary", "alternate"] as const) : []), [config.demoMode]);

  return (
    <div className="rounded-2xl border border-veil/[0.08] bg-ink-950/40 p-4">
      <p className="text-sm font-medium">{W.title}</p>
      <p className="mt-0.5 text-xs text-fg-3">{W.body}</p>

      {value ? (
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-3 flex items-center gap-3 rounded-xl border border-mint/25 bg-mint/[0.06] px-3.5 py-3">
          <ShieldCheck className="size-5 shrink-0 text-mint" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[13px] text-fg">{shortAddress(value.address, 8)}</p>
            <p className="text-xs text-mint">{value.proof.method === "demo_wallet" ? W.verifiedDemo : W.verified}</p>
          </div>
          <button onClick={() => onChange(null)} className="text-xs text-fg-3 hover:text-fg">
            {W.change}
          </button>
        </motion.div>
      ) : (
        <div className="mt-3 space-y-2">
          {!config.simulated &&
            (publicKey ? (
              <Button className="w-full" variant="secondary" onClick={viaWallet} disabled={!!busy}>
                {busy === "wallet" ? <LogoSpinner size={18} /> : <Wallet className="size-4" />} {t(W.verifyBySigning, { wallet: shortAddress(publicKey.toBase58()) })}
              </Button>
            ) : (
              <WalletButton className="w-full" label={W.connect} />
            ))}
          {choices.map((w) => (
            <Button key={w} className="w-full" variant="secondary" onClick={() => viaDemo(w)} disabled={!!busy}>
              {busy === w ? <LogoSpinner size={18} /> : <Sparkles className="size-4 text-violet" />} {w === "primary" ? W.demoA : W.demoB}
            </Button>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose">{error}</p>}
    </div>
  );
}

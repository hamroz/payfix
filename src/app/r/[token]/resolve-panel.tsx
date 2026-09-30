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

type Props = { token: string; businessName: string; customerName: string; config: PublicConfig; detail: CaseDetail };

export function ResolvePanel({ token, businessName, customerName, config, detail: d }: Props) {
  const current = d.proposals[0] ?? null;
  const editable = d.case.status === "open" || d.case.status === "proposed" || d.case.status === "approved";
  const [editing, setEditing] = useState(!current && editable);
  const available = BigInt(current && !editable ? current.available : d.available);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-5">
        <FadeIn>
          <div className="flex flex-wrap items-center gap-2">
            <CaseStatusBadge status={d.case.status} customerView />
          </div>
          <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight tracking-tight sm:text-3xl">
            {d.case.status === "resolved" ? "All settled. Thank you!" : `You sent ${businessName} a little extra`}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-fg-2">
            {d.case.status === "resolved"
              ? "Every dollar you sent has a confirmed destination. Your receipt is below."
              : d.invoice
                ? `${customerName}, you paid ${formatUsd(BigInt(d.invoicePaid))} toward ${d.invoice.number}, which was ${formatUsd(BigInt(d.invoice.amount))}. You decide what happens to the extra — nothing moves until ${businessName} approves your exact plan.`
                : `${customerName}, ${formatUsd(BigInt(d.received))} reached ${businessName} without an invoice reference. You decide what happens to it — nothing moves until ${businessName} approves your exact plan.`}
          </p>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-fg-3">{d.case.status === "resolved" ? "Extra, now resolved" : "Extra to allocate"}</p>
                <AnimatedAmount units={(d.case.status === "resolved" || !editable ? (current?.available ?? d.available) : d.available).toString()} className="tabular mt-1 block font-display text-4xl font-semibold tracking-tight text-gradient" />
              </div>
              <div className="flex flex-col gap-1.5">
                {d.transfers
                  .filter((t) => t.direction === "in")
                  .map((t) => (
                    <span key={t.id} className="inline-flex items-center gap-2 text-xs text-fg-3">
                      <ArrowDownLeft className="size-3.5 text-mint" /> {formatUsd(BigInt(t.amount))} received
                    </span>
                  ))}
              </div>
            </div>
          </Card>
        </FadeIn>

        <AnimatePresence mode="wait">
          {editing && editable ? (
            <motion.div key="builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <PlanBuilder token={token} available={BigInt(d.available)} openInvoices={d.openInvoices.filter((i) => BigInt(i.remaining) > 0n)} current={current} config={config} businessName={businessName} onDone={() => setEditing(false)} onCancel={current ? () => setEditing(false) : undefined} />
            </motion.div>
          ) : current ? (
            <motion.div key="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card>
                <CardHeader
                  title={`Your plan · version ${current.version}`}
                  subtitle={
                    current.status === "submitted"
                      ? `Waiting for ${businessName} to approve this exact plan`
                      : current.status === "approved"
                        ? `${businessName} approved it. They’ll carry it out next.`
                        : current.status === "executed"
                          ? d.case.status === "resolved"
                            ? "Carried out and confirmed"
                            : `Allocations posted. ${businessName} is signing your refund.`
                          : current.status
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
                        {formatUsd(BigInt(d.refund.amount))} refund {d.refund.status === "submitted" ? "is confirming on chain" : `is reserved and waiting for ${businessName}’s wallet signature`}
                      </span>
                    </div>
                  )}
                  {editable && (
                    <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
                      <PencilLine className="size-4" /> Change plan
                    </Button>
                  )}
                  {editable && current.status === "approved" && <p className="text-center text-xs text-fg-3">Changing an approved plan voids the approval. {businessName} would need to approve the new version.</p>}
                </div>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {d.case.status === "resolved" && (
          <FadeIn delay={0.1}>
            <Card className="flex flex-col items-center p-8 text-center">
              <LogoMark size={72} animate />
              <p className="mt-5 font-display text-xl font-semibold">Loop closed</p>
              <p className="mt-1 max-w-sm text-sm text-fg-2">
                {available > 0n ? `${formatUsd(available)} placed exactly as you asked. ` : ""}You and {businessName} share the same receipt.
              </p>
              <Link href={`/receipt/${d.case.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-veil/[0.06] px-4 py-2.5 text-sm font-medium hover:bg-veil/[0.1]">
                <ReceiptText className="size-4" /> View receipt
              </Link>
            </Card>
          </FadeIn>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <FadeIn delay={0.1}>
          <Card className="p-5">
            <h3 className="font-display text-[15px] font-semibold">How this works</h3>
            <ol className="mt-3 space-y-3 text-[13px] text-fg-2">
              {[
                "Choose where the extra goes: another open invoice, credit for next time, a refund, or a mix.",
                "For a refund, sign a message with the receiving wallet so no one can redirect it.",
                `${businessName} approves your exact plan. If you change anything, they approve again.`,
                `${businessName} signs the refund from their wallet. You both get the same receipt.`,
              ].map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-veil/[0.06] text-[11px] font-semibold text-fg">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader title="Timeline" />
            <ActivityFeed events={d.activity} viewer="customer" businessName={businessName} />
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

type Row = { key: string; type: ProposalLine["type"]; invoiceId?: string; label: string; hint?: string; max?: bigint; value: string };

function PlanBuilder({ token, available, openInvoices, current, config, businessName, onDone, onCancel }: { token: string; available: bigint; openInvoices: CaseDetail["openInvoices"]; current: CaseDetail["proposals"][number] | null; config: PublicConfig; businessName: string; onDone: () => void; onCancel?: () => void }) {
  const initial = (type: string, invoiceId?: string) => {
    const l = current?.lines.find((x) => x.type === type && (type !== "invoice" || (x.type === "invoice" && x.invoiceId === invoiceId)));
    return l ? fromUnits(BigInt(l.amount)) : "";
  };
  const [rows, setRows] = useState<Row[]>([
    ...openInvoices.map((i) => ({ key: i.id, type: "invoice" as const, invoiceId: i.id, label: `Apply to ${i.number}`, hint: `${i.title} · ${formatUsd(BigInt(i.remaining))} remaining`, max: BigInt(i.remaining), value: initial("invoice", i.id) })),
    { key: "credit", type: "credit" as const, label: "Keep as credit", hint: `Use it on a future ${businessName} invoice`, value: initial("credit") },
    { key: "refund", type: "refund" as const, label: "Refund to me", hint: "Sent from their wallet to yours", value: initial("refund") },
  ]);
  const [destination, setDestination] = useState<{ address: string; proof: DestinationProof } | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const parsed = rows.map((r) => ({ ...r, units: r.value ? tryToUnits(r.value) : 0n }));
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
  const presets: { label: string; values: Record<string, bigint> }[] = [
    ...(firstInv ? [{ label: `All to ${firstInv.number}`, values: { [firstInv.id]: available < BigInt(firstInv.remaining) ? available : BigInt(firstInv.remaining), refund: available > BigInt(firstInv.remaining) ? available - BigInt(firstInv.remaining) : 0n } }] : []),
    ...(firstInv ? [{ label: "Split 60 / 40", values: { [firstInv.id]: (available * 60n) / 100n, refund: available - (available * 60n) / 100n } }] : []),
    { label: "Keep as credit", values: { credit: available } },
    { label: "Refund all", values: { refund: available } },
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
      toast.push({ tone: "success", title: `Plan v${res.version} sent to ${businessName}`, body: "They’ll approve this exact version." });
      onDone();
      router.refresh();
    });

  const segs = parsed.filter((r) => (r.units ?? 0n) > 0n);

  return (
    <Card>
      <CardHeader title={current ? `Revise your plan (becomes v${current.version + 1})` : "Choose where the extra goes"} subtitle={`Allocate all ${formatUsd(available)}. Mix and match.`} />
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
                <Check className="mr-1 inline size-4" /> All {formatUsd(available)} allocated
              </>
            ) : left > 0n ? (
              `${formatUsd(left)} left to allocate`
            ) : (
              `${formatUsd(-left)} more than the extra`
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

        <Input placeholder={`Add a note for ${businessName} (optional)`} value={note} onChange={(e) => setNote(e.target.value)} />

        {error && <Alert tone="rose">{error}</Alert>}

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={pending}>
              Cancel
            </Button>
          )}
          <Button size="lg" className="flex-1" disabled={!ready || pending} onClick={submit}>
            {pending ? <LogoSpinner size={20} /> : <ShieldCheck className="size-4" />} {current ? `Send revised plan (v${current.version + 1})` : `Send plan to ${businessName}`}
          </Button>
        </div>
        {needsDestination && <p className="text-center text-xs text-fg-3">Verify a refund wallet to continue.</p>}
      </div>
    </Card>
  );
}

function DestinationPicker({ token, config, value, onChange }: { token: string; config: PublicConfig; value: { address: string; proof: DestinationProof } | null; onChange: (v: { address: string; proof: DestinationProof } | null) => void }) {
  const { publicKey, signMessage } = useWallet();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const viaWallet = async () => {
    if (!publicKey || !signMessage) return setError("This wallet can’t sign messages.");
    setBusy("wallet");
    setError(null);
    try {
      const address = publicKey.toBase58();
      const ch = await destinationChallengeAction(token, address);
      if (!ch.ok) throw new Error(ch.error);
      const sig = await signMessage(new TextEncoder().encode(ch.message));
      onChange({ address, proof: { method: "wallet_signature", message: ch.message, signature: bs58.encode(sig), verifiedAt: new Date().toISOString() } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing was cancelled.");
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
      <p className="text-sm font-medium">Refund wallet</p>
      <p className="mt-0.5 text-xs text-fg-3">Sign a short message with the wallet that should receive the refund. Exchange deposit addresses won’t work — you must control the wallet.</p>

      {value ? (
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-3 flex items-center gap-3 rounded-xl border border-mint/25 bg-mint/[0.06] px-3.5 py-3">
          <ShieldCheck className="size-5 shrink-0 text-mint" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[13px] text-fg">{shortAddress(value.address, 8)}</p>
            <p className="text-xs text-mint">Ownership verified by signature{value.proof.method === "demo_wallet" ? " (demo wallet)" : ""}</p>
          </div>
          <button onClick={() => onChange(null)} className="text-xs text-fg-3 hover:text-fg">
            Change
          </button>
        </motion.div>
      ) : (
        <div className="mt-3 space-y-2">
          {!config.simulated &&
            (publicKey ? (
              <Button className="w-full" variant="secondary" onClick={viaWallet} disabled={!!busy}>
                {busy === "wallet" ? <LogoSpinner size={18} /> : <Wallet className="size-4" />} Verify {shortAddress(publicKey.toBase58())} by signing
              </Button>
            ) : (
              <WalletButton className="w-full" label="Connect refund wallet" />
            ))}
          {choices.map((w) => (
            <Button key={w} className="w-full" variant="secondary" onClick={() => viaDemo(w)} disabled={!!busy}>
              {busy === w ? <LogoSpinner size={18} /> : <Sparkles className="size-4 text-violet" />} Use demo wallet {w === "primary" ? "A" : "B"}
            </Button>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose">{error}</p>}
    </div>
  );
}

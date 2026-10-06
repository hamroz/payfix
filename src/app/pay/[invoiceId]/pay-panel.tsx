"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownLeft, Check, Droplets, ExternalLink, QrCode, Sparkles, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createPaymentRequestAction, demoPayAction } from "@/app/actions/public";
import { faucetAction } from "@/app/actions/business";
import { LogoMark, LogoSpinner } from "@/components/brand/logo";
import { LiveSync } from "@/components/app/live-sync";
import { AnimatedAmount } from "@/components/ui/motion";
import { Alert, Button, Card, Input, Label } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WalletButton } from "@/components/wallet/wallet-button";
import type { PublicConfig } from "@/lib/env";
import { amountFit } from "@/lib/format";
import { formatUsd, fromUnits, tryToUnits } from "@/lib/money";
import { ata, buildPaymentTransaction, explorerUrl, shortAddress } from "@/lib/solana/tx";
import type { TransferRow } from "@/lib/server/views";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n/messages";

type Invoice = { id: string; number: string; title: string; amount: string; applied: string; remaining: string; dueAt: string };
type Method = "demo" | "wallet" | "qr";

export function PayPanel({ config, invoice, business, customerName, payments }: { config: PublicConfig; invoice: Invoice; business: { id: string; name: string; wallet: string }; customerName: string; payments: TransferRow[] }) {
  const remaining = BigInt(invoice.remaining);
  const [amount, setAmount] = useState(remaining > 0n ? fromUnits(remaining) : "");
  const methods: Method[] = config.simulated ? ["demo"] : config.demoMode ? ["demo", "wallet", "qr"] : ["wallet", "qr"];
  const [method, setMethod] = useState<Method>(methods[0]);
  const [phase, setPhase] = useState<"idle" | "paying" | "done">("idle");
  const [lastPaid, setLastPaid] = useState<{ amount: string; signature: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const { m, t, rich, date } = useI18n();
  const P = m.pay;

  const units = tryToUnits(amount || "0");
  const over = units !== null && units > remaining && remaining > 0n ? units - remaining : 0n;
  const paidPct = Number((BigInt(invoice.applied) * 1000n) / (BigInt(invoice.amount) || 1n)) / 10;

  const onPaid = (signature: string) => {
    setLastPaid({ amount: amount, signature });
    setPhase("done");
    router.refresh();
  };

  const payDemo = () =>
    start(async () => {
      setError(null);
      setPhase("paying");
      const res = await demoPayAction(invoice.id, amount);
      if (!res.ok) {
        setPhase("idle");
        return setError(res.error);
      }
      onPaid(res.signature);
    });

  return (
    <div className="grid w-full gap-5 lg:grid-cols-[1fr_1.1fr] lg:gap-6">
      <Card className="h-fit p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#6366F1,#A78BFA)] font-display font-semibold text-white">{business.name[0]}</span>
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">{business.name}</p>
            <p className="text-xs text-fg-3">{t(P.invoiceFor, { customer: customerName })}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <ProgressRing pct={paidPct} />
          <div className="@container min-w-0 flex-1" title={formatUsd(BigInt(remaining === 0n ? invoice.amount : invoice.remaining))}>
            <p className="text-xs uppercase tracking-[0.14em] text-fg-3">
              {remaining === 0n ? P.paidInFull : BigInt(invoice.applied) > 0n ? P.remaining : P.amountDue}
            </p>
            <AnimatedAmount
              units={remaining === 0n ? invoice.amount : invoice.remaining}
              className="tabular mt-1 block whitespace-nowrap font-display font-semibold tracking-tight"
              style={amountFit(remaining === 0n ? invoice.amount : invoice.remaining, 2.25)}
            />
            <p className="mt-1 text-sm text-fg-3">{rich(P.ofTotalDue, { date: (c) => <span suppressHydrationWarning>{c}</span> }, { total: formatUsd(BigInt(invoice.amount)), date: date(invoice.dueAt) })}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-veil/[0.06] bg-ink-950/40 p-4">
          <p className="font-mono text-xs text-fg-3">{invoice.number}</p>
          <p className="mt-1 text-sm text-fg">{invoice.title}</p>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">{P.payments}</p>
            <LiveSync scope={{ invoice: invoice.id }} />
          </div>
          {payments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-veil/10 px-4 py-5 text-center text-sm text-fg-3">{P.noPayments}</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {payments.map((p) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex items-center gap-3 rounded-xl border border-veil/[0.06] bg-veil/[0.03] px-3 py-2.5"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-mint/10 text-mint">
                      <ArrowDownLeft className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="tabular text-sm font-medium">{formatUsd(BigInt(p.amount))}</p>
                      <p className="truncate text-xs text-fg-3">
                        {BigInt(p.appliedHere) < BigInt(p.amount)
                          ? t(P.partlyApplied, { applied: formatUsd(BigInt(p.appliedHere)), held: formatUsd(BigInt(p.amount) - BigInt(p.appliedHere)) })
                          : P.appliedHere}
                      </p>
                    </div>
                    {!config.simulated ? (
                      <a href={explorerUrl("tx", p.signature, config.cluster)} target="_blank" rel="noreferrer" className="text-fg-3 hover:text-fg" aria-label={P.viewOnExplorer}>
                        <ExternalLink className="size-4" />
                      </a>
                    ) : (
                      <span className="font-mono text-[11px] text-fg-3">{shortAddress(p.signature)}</span>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </Card>

      <Card className="relative h-fit overflow-hidden p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {phase === "done" && lastPaid ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-8 text-center">
              <SuccessMark />
              <h2 className="mt-6 font-display text-2xl font-semibold">{P.done.title}</h2>
              <p className="mt-2 max-w-sm text-sm text-fg-2">
                {t(P.done.reached, { amount: formatUsd(tryToUnits(lastPaid.amount) ?? 0n), business: business.name })}{" "}
                {remaining === 0n && BigInt(invoice.applied) > 0n ? P.done.settled : t(P.done.remains, { amount: formatUsd(remaining) })}
              </p>
              {!config.simulated && (
                <a href={explorerUrl("tx", lastPaid.signature, config.cluster)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-violet hover:underline">
                  {P.viewOnExplorer} <ExternalLink className="size-3.5" />
                </a>
              )}
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => {
                  setPhase("idle");
                  setAmount(remaining > 0n ? fromUnits(remaining) : "");
                }}
              >
                {P.done.another}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-xl font-semibold">{t(P.form.title, { token: config.tokenLabel })}</h2>
              <p className="mt-1 text-sm text-fg-3">{P.form.subtitle}</p>

              {methods.length > 1 && (
                <div className="mt-5 grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-veil/[0.07] bg-ink-950/50 p-1">
                  {methods.map((opt) => (
                    <button key={opt} onClick={() => setMethod(opt)} className={cn("relative rounded-lg px-2 py-2 text-[13px] leading-tight transition sm:px-3 sm:text-sm", method === opt ? "text-fg" : "text-fg-3 hover:text-fg-2")}>
                      {method === opt && <motion.span layoutId="pay-method" className="absolute inset-0 rounded-lg bg-veil/[0.08]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                      <span className="relative flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:gap-1.5">
                        {opt === "demo" ? <Sparkles className="size-3.5" /> : opt === "wallet" ? <Wallet className="size-3.5" /> : <QrCode className="size-3.5" />}
                        {P.form.methods[opt]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <Label htmlFor="amount">{P.form.amount}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-fg-3">$</span>
                  <Input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className="h-14 pl-8 font-display text-2xl font-semibold tabular" />
                </div>
                <AnimatePresence>
                  {over > 0n && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <Alert tone="amber" className="mt-3" title={t(P.form.overTitle, { amount: formatUsd(over) })}>
                        {P.form.overBody}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-5">
                {method === "demo" && (
                  <div>
                    <Button size="lg" className="w-full" onClick={payDemo} disabled={pending || !units || units <= 0n}>
                      {phase === "paying" ? (
                        <>
                          <LogoSpinner size={20} /> {config.simulated ? P.form.confirmingSimulated : t(P.form.confirmingOn, { cluster: config.cluster })}
                        </>
                      ) : (
                        <>{units ? t(P.form.payFromDemo, { amount: formatUsd(units) }) : P.form.payFromDemoNoAmount}</>
                      )}
                    </Button>
                    <p className="mt-3 text-center text-xs text-fg-3">{P.form.demoNote}</p>
                  </div>
                )}
                {method === "wallet" && <WalletPay invoiceId={invoice.id} amount={units} business={business} config={config} onPaid={onPaid} onError={setError} />}
                {method === "qr" && <QrPay invoiceId={invoice.id} amount={amount} config={config} />}
              </div>

              {error && <p className="mt-3 text-sm text-rose">{error}</p>}
              {config.demoMode && !config.simulated && method === "wallet" && <FaucetHint />}
              {config.demoMode && !config.simulated && method === "qr" && <PhoneFaucet />}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

function WalletPay({ invoiceId, amount, business, config, onPaid, onError }: { invoiceId: string; amount: bigint | null; business: { id: string; wallet: string }; config: PublicConfig; onPaid: (sig: string) => void; onError: (e: string | null) => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [busy, setBusy] = useState(false);
  const { m, t } = useI18n();
  const W = m.pay.wallet;

  if (!publicKey) return <WalletButton className="w-full" size="lg" label={W.connect} />;

  const pay = async () => {
    if (!amount || amount <= 0n || !config.mint) return;
    onError(null);
    setBusy(true);
    try {
      // Check the balance first so the customer gets a clear answer, not a failed transaction.
      const held = await connection
        .getTokenAccountBalance(ata(config.mint, publicKey), "confirmed")
        .then((r) => BigInt(r.value.amount))
        .catch(() => 0n);
      if (held < amount) {
        onError(t(config.demoMode ? W.insufficientFaucet : W.insufficient, { held: formatUsd(held), token: config.tokenLabel, amount: formatUsd(amount) }));
        return;
      }
      const req = await createPaymentRequestAction(invoiceId, fromUnits(amount));
      if (!req.ok) throw new Error(req.error);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const tx = buildPaymentTransaction({
        payer: publicKey,
        merchant: new PublicKey(business.wallet),
        mint: new PublicKey(config.mint),
        decimals: config.decimals,
        amount,
        reference: new PublicKey(req.reference),
        blockhash,
        lastValidBlockHeight,
      });
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      await fetch(`/api/sync?b=${encodeURIComponent(business.id)}`, { method: "POST" });
      onPaid(signature);
    } catch (e) {
      onError(walletErrorMessage(e, m.pay.errors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" onClick={pay} disabled={busy || !amount || amount <= 0n}>
        {busy ? (
          <>
            <LogoSpinner size={20} /> {W.waiting}
          </>
        ) : (
          <>{amount ? t(W.pay, { amount: formatUsd(amount) }) : W.payNoAmount}</>
        )}
      </Button>
      <div className="flex justify-center">
        <WalletButton size="sm" />
      </div>
    </div>
  );
}

/** Plain-language versions of the errors wallets and RPCs throw. */
function walletErrorMessage(e: unknown, E: Messages["pay"]["errors"]): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/reject|denied|cancel/i.test(msg)) return E.cancelled;
  if (/insufficient|0x1\b|debit an account/i.test(msg)) return E.insufficient;
  if (/blockhash|expired|timed? ?out/i.test(msg)) return E.timeout;
  if (/network|cluster|devnet/i.test(msg)) return E.network;
  return E.generic;
}

function QrPay({ invoiceId, amount, config }: { invoiceId: string; amount: string; config: PublicConfig }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = useMemo(() => `${invoiceId}:${amount}`, [invoiceId, amount]);
  const { m, t } = useI18n();

  useEffect(() => {
    let live = true;
    const t = setTimeout(async () => {
      const res = await createPaymentRequestAction(invoiceId, amount || null);
      if (!live) return;
      if (!res.ok) return setError(res.error);
      setError(null);
      setUrl(res.url);
      setSvg(await QRCode.toString(res.url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0B0F1A", light: "#FFFFFF" } }));
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [key, invoiceId, amount]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative rounded-3xl bg-white p-4 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.6)]">
        {svg ? <div className="size-52" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="skeleton size-52 rounded-xl" />}
        <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white">
          <LogoMark size={34} />
        </span>
      </div>
      <p className="mt-4 text-center text-sm text-fg-2">
        {config.mainnet ? m.pay.qr.scan : t(m.pay.qr.scanOn, { cluster: config.cluster })}
      </p>
      {url && (
        <a href={url} className="mt-2 text-xs text-violet hover:underline">
          {m.pay.qr.openInWallet}
        </a>
      )}
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
    </div>
  );
}

/** Asks the devnet faucet for test USD and reports the outcome, including rate-limit messages. */
function useFaucet() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const { m, t } = useI18n();
  const F = m.pay.faucet;
  const request = async (address: string) => {
    setBusy(true);
    const res = await faucetAction(address);
    setBusy(false);
    toast.push(res.ok ? { tone: "success", title: t(F.sentTitle, { amount: 2000 }), body: F.sentBody } : { tone: "error", title: F.failedTitle, body: res.error });
    return res.ok;
  };
  return { busy, request };
}

function FaucetHint() {
  const { publicKey } = useWallet();
  const { busy, request } = useFaucet();
  const { m, t } = useI18n();
  if (!publicKey) return null;
  return (
    <button
      onClick={() => request(publicKey.toBase58())}
      disabled={busy}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-veil/10 py-2.5 text-xs text-fg-3 transition hover:border-violet/40 hover:text-fg"
    >
      <Droplets className="size-3.5" /> {busy ? m.pay.faucet.sending : t(m.pay.faucet.hint, { amount: 2000 })}
    </button>
  );
}

/** For phone wallets, which can't connect to this page: fund the address before scanning. */
function PhoneFaucet() {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const { busy, request } = useFaucet();
  const { m } = useI18n();
  const F = m.pay.faucet;
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-veil/10 py-2.5 text-xs text-fg-3 transition hover:border-violet/40 hover:text-fg"
      >
        <Droplets className="size-3.5" /> {F.phoneHint}
      </button>
    );
  return (
    <form
      className="mt-4 space-y-2.5 rounded-xl border border-veil/10 bg-veil/[0.03] p-3.5 text-xs text-fg-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await request(address)) setAddress("");
      }}
    >
      <ol className="list-decimal space-y-1 pl-4">
        <li>{F.stepTestnet}</li>
        <li>{F.stepCopy}</li>
        <li>{F.stepScan}</li>
      </ol>
      <div className="flex gap-2">
        <Input value={address} onChange={(e) => setAddress(e.target.value.trim())} placeholder={F.addressPlaceholder} className="h-9 font-mono text-xs" aria-label={F.addressPlaceholder} />
        <Button type="submit" size="sm" disabled={busy || address.length < 32}>
          {busy ? <LogoSpinner size={14} /> : <Droplets className="size-3.5" />} {F.send}
        </Button>
      </div>
    </form>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
      <defs>
        <linearGradient id="pr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#5EF2C2" />
        </linearGradient>
      </defs>
      <circle cx="38" cy="38" r={r} fill="none" className="stroke-veil/[0.08]" strokeWidth="7" />
      <motion.circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="url(#pr)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - Math.min(pct, 100) / 100) }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function SuccessMark() {
  return (
    <div className="relative grid size-24 place-items-center">
      <motion.span className="absolute inset-0 rounded-full bg-mint/20" initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} />
      <motion.span className="absolute inset-2 rounded-full bg-mint/10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} />
      <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }} className="relative grid size-16 place-items-center rounded-full bg-[linear-gradient(135deg,#34D399,#5EF2C2)] text-[#06080e]">
        <Check className="size-8" strokeWidth={3} />
      </motion.span>
    </div>
  );
}

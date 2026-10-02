"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, CircleCheckBig, ExternalLink, Eye, Link2, MessageSquareWarning, PenLine, PlayCircle, Send, ShieldAlert, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  approveAction,
  assignCustomerAction,
  checkRefundAction,
  demoSignRefundAction,
  executeAction,
  prepareRefundAction,
  requestChangesAction,
  sendLinkAction,
  submitRefundAction,
} from "@/app/actions/business";
import { LogoMark, LogoSpinner } from "@/components/brand/logo";
import { CopyButton } from "@/components/ui/interactive";
import { Alert, Button, Card, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WalletButton } from "@/components/wallet/wallet-button";
import type { CaseKind, CaseStatus } from "@/lib/db/schema";
import type { PublicConfig } from "@/lib/env";
import { formatUsd } from "@/lib/money";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";
import type { CaseDetail } from "@/lib/server/views";

type Props = {
  caseId: string;
  status: CaseStatus;
  kind: CaseKind;
  customer: { id: string; name: string; email: string } | null;
  customers: { id: string; name: string }[];
  linkActive: boolean;
  current: { id: string; version: number; status: string; hash: string; businessNote: string | null } | null;
  refund: CaseDetail["refund"];
  businessWallet: string;
  demoMerchant: boolean;
  /** Editors and owners act; viewers see the state only. */
  canAct: boolean;
  config: PublicConfig;
};

export function CaseActions(p: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [assignTo, setAssignTo] = useState(p.customers[0]?.id ?? "");

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) toast.push({ tone: "error", title: "That didn’t work", body: res.error });
      else if (success) toast.push({ tone: "success", title: success });
      router.refresh();
    });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-veil/[0.06] px-5 py-4">
        <h3 className="font-display text-[15px] font-semibold">Next step</h3>
      </div>
      <div className="space-y-4 p-5">
        {p.customer && (
          <div className="flex items-center gap-3 rounded-xl bg-veil/[0.03] px-3.5 py-3">
            <span className="grid size-9 place-items-center rounded-xl bg-violet/15 font-display text-sm font-semibold text-violet">{p.customer.name[0]}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{p.customer.name}</p>
              <p className="truncate text-xs text-fg-3">{p.customer.email}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={`${p.status}-${p.current?.id ?? "none"}-${p.refund?.status ?? ""}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-3">
            {!p.canAct && p.status !== "resolved" && (
              <p className="flex items-start gap-2 rounded-xl bg-veil/[0.04] px-3.5 py-3 text-sm text-fg-2">
                <Eye className="mt-0.5 size-4 shrink-0" /> You have view-only access. An editor or owner handles the next step.
              </p>
            )}

            {p.canAct && !p.customer && p.kind === "unmatched" && (
              <>
                <p className="text-sm text-fg-2">This transfer had no invoice reference, so PayFix won’t guess who sent it. Amount alone isn’t proof. If you know the sender, attribute it — they’ll still confirm how it’s used.</p>
                <Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                  {p.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <Button className="w-full" disabled={pending || !assignTo} onClick={() => act(() => assignCustomerAction(p.caseId, assignTo), "Payment attributed")}>
                  <UserPlus className="size-4" /> Attribute to customer
                </Button>
              </>
            )}

            {p.canAct && p.current?.status === "declined" && (
              <div className="rounded-xl border border-amber/20 bg-amber/[0.06] px-3.5 py-3 text-sm">
                <p className="font-medium text-amber">You asked for changes to v{p.current.version}</p>
                <p className="mt-0.5 text-fg-2">“{p.current.businessNote}” Waiting for the customer’s revised plan.</p>
              </div>
            )}

            {p.canAct && p.customer && (p.status === "open" || p.status === "proposed") && (!p.current || p.current.status === "declined") && (
              <>
                <p className="text-sm text-fg-2">Your customer decides where the extra goes. They’ll verify by email, choose a split, and prove any refund wallet by signing with it.</p>
                <Button
                  className="w-full"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await sendLinkAction(p.caseId);
                      if (!res.ok) return toast.push({ tone: "error", title: "Couldn’t send the link", body: res.error });
                      setLink(res.url);
                      toast.push({ tone: "success", title: "Resolution link sent", body: `Emailed to ${p.customer!.email}` });
                      router.refresh();
                    })
                  }
                >
                  {pending ? <LogoSpinner size={18} /> : <Send className="size-4" />} {p.linkActive ? "Resend resolution link" : "Send resolution link"}
                </Button>
                {link && (
                  <div className="flex items-center gap-2 rounded-xl border border-violet/20 bg-violet/[0.06] px-3 py-2">
                    <Link2 className="size-4 shrink-0 text-violet" />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-fg-2">{link}</span>
                    <CopyButton value={link} />
                  </div>
                )}
                {p.linkActive && !link && <p className="text-xs text-fg-3">A link is active. Waiting for the customer’s plan.</p>}
              </>
            )}

            {p.canAct && p.status === "proposed" && p.current?.status === "submitted" && (
              <>
                <p className="text-sm text-fg-2">
                  Review version {p.current.version}. Your approval covers exactly this plan (<span className="font-mono text-xs">#{p.current.hash.slice(0, 10)}</span>). Any change the customer makes will void it.
                </p>
                <Button className="w-full" disabled={pending} onClick={() => act(() => approveAction(p.caseId, p.current!.id), `Approved v${p.current!.version}`)}>
                  {pending ? <LogoSpinner size={18} /> : <BadgeCheck className="size-4" />} Approve v{p.current.version}
                </Button>
                <RequestChanges caseId={p.caseId} proposalId={p.current.id} version={p.current.version} />
              </>
            )}

            {p.canAct && p.status === "approved" && (
              <>
                <p className="text-sm text-fg-2">Approved. Running the plan re-checks the approval against the current version, posts the allocations, and reserves any refund.</p>
                <Button variant="success" className="w-full" disabled={pending} onClick={() => act(() => executeAction(p.caseId), "Plan executed")}>
                  {pending ? <LogoSpinner size={18} /> : <PlayCircle className="size-4" />} Run plan v{p.current?.version}
                </Button>
                {p.current && <RequestChanges caseId={p.caseId} proposalId={p.current.id} version={p.current.version} />}
              </>
            )}

            {p.status === "executing" && p.refund && (p.canAct ? <RefundPanel {...p} refund={p.refund} /> : <p className="text-sm text-fg-2">Refund of the plan is in progress.</p>)}

            {p.status === "resolved" && (
              <div className="flex flex-col items-center py-3 text-center">
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
                  <LogoMark size={64} animate />
                </motion.div>
                <p className="mt-4 font-display text-lg font-semibold">Loop closed</p>
                <p className="mt-1 text-sm text-fg-2">Every dollar is accounted for, and both sides share the same receipt.</p>
                {p.refund?.signature && !p.config.simulated && (
                  <a href={explorerUrl("tx", p.refund.signature, p.config.cluster)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-violet hover:underline">
                    Refund on Explorer <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}

/** Decline this version with a note. The customer revises; the business never edits their plan. */
function RequestChanges({ caseId, proposalId, version }: { caseId: string; proposalId: string; version: number }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  if (!open)
    return (
      <Button variant="ghost" className="w-full" onClick={() => setOpen(true)}>
        <MessageSquareWarning className="size-4" /> Request changes
      </Button>
    );
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 overflow-hidden">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        autoFocus
        placeholder="e.g. Please keep the $40 as credit instead of a refund."
        className="w-full rounded-xl border border-veil/10 bg-ink-950/60 px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-3/70 focus:border-violet/60 focus:ring-4 focus:ring-violet/15"
      />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1"
          disabled={pending || note.trim().length < 3}
          onClick={() =>
            start(async () => {
              const res = await requestChangesAction(caseId, proposalId, note);
              if (!res.ok) return toast.push({ tone: "error", title: "Couldn’t send", body: res.error });
              toast.push({ tone: "success", title: `Asked for changes to v${version}`, body: "The customer was notified." });
              router.refresh();
            })
          }
        >
          {pending ? <LogoSpinner size={16} /> : "Send to customer"}
        </Button>
      </div>
      <p className="text-xs text-fg-3">This voids any approval of v{version}. The customer sends a new version.</p>
    </motion.div>
  );
}

function RefundPanel(p: Props & { refund: NonNullable<CaseDetail["refund"]> }) {
  const router = useRouter();
  const toast = useToast();
  const { publicKey, signTransaction } = useWallet();
  useConnection();
  const [busy, setBusy] = useState<null | "demo" | "wallet">(null);
  const r = p.refund;

  // While a refund is in flight, reconcile with the chain. One check at a time, and stop
  // once it settles: a page render can take longer than the poll interval, and a new
  // refresh cancels the one in flight, so refreshing on every tick never lands.
  useEffect(() => {
    if (r.status !== "submitted") return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const res = await checkRefundAction(r.id);
      if (stopped) return;
      if (res.ok && res.status !== "submitted") {
        if (res.status === "confirmed") toast.push({ tone: "success", title: "Refund confirmed on chain", body: "Case resolved." });
        router.refresh();
        return;
      }
      timer = setTimeout(tick, 2000);
    };
    timer = setTimeout(tick, 2000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [r.status, r.id, router, toast]);

  const walletMatches = publicKey?.toBase58() === p.businessWallet;

  const signWithWallet = async () => {
    if (!signTransaction) return;
    setBusy("wallet");
    try {
      const prep = await prepareRefundAction(r.id);
      if (!prep.ok) throw new Error(prep.error);
      const signed = await signTransaction(Transaction.from(Buffer.from(prep.transaction, "base64")));
      const res = await submitRefundAction(prep.attemptId, Buffer.from(signed.serialize()).toString("base64"));
      if (!res.ok) throw new Error(res.error);
      toast.push({ tone: "success", title: "Refund signed and sent" });
      router.refresh();
    } catch (e) {
      toast.push({ tone: "error", title: "Refund not sent", body: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(null);
    }
  };

  const signWithDemo = async () => {
    setBusy("demo");
    const res = await demoSignRefundAction(r.id);
    setBusy(null);
    if (!res.ok) return toast.push({ tone: "error", title: "Refund not sent", body: res.error });
    toast.push({ tone: "success", title: "Refund signed and sent" });
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.05] p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-[0.14em] text-fg-3">Refund</span>
          <span className="tabular font-display text-xl font-semibold">{formatUsd(BigInt(r.amount))}</span>
        </div>
        <p className="mt-1 text-xs text-fg-3">
          to <span className="font-mono text-fg-2">{shortAddress(r.destination, 6)}</span> · wallet ownership proven by signature
        </p>
      </div>

      {r.status === "submitted" ? (
        <div className="flex items-center gap-3 rounded-xl bg-veil/[0.03] px-3.5 py-3 text-sm text-fg-2">
          <LogoSpinner size={22} />
          <div className="min-w-0 flex-1">
            <p className="text-fg">Confirming on {p.config.simulated ? "the simulated chain" : p.config.cluster}…</p>
            {r.signature && <p className="truncate font-mono text-[11px] text-fg-3">{r.signature}</p>}
          </div>
        </div>
      ) : (
        <>
          {r.status === "failed" && (
            <Alert tone="rose" title="The last attempt failed on chain">
              No funds moved. The refund is still reserved; you can sign again.
            </Alert>
          )}
          <p className="text-sm text-fg-2">Allocations are posted. The refund is reserved and waits for your wallet’s signature. PayFix records the signature before broadcasting, so it can’t be sent twice.</p>
          {p.demoMerchant && (
            <Button variant="success" className="w-full" disabled={!!busy} onClick={signWithDemo}>
              {busy === "demo" ? <LogoSpinner size={18} /> : <PenLine className="size-4" />} Sign with demo merchant wallet
            </Button>
          )}
          {!p.config.simulated &&
            (publicKey ? (
              walletMatches ? (
                <Button variant={p.demoMerchant ? "secondary" : "success"} className="w-full" disabled={!!busy} onClick={signWithWallet}>
                  {busy === "wallet" ? <LogoSpinner size={18} /> : <PenLine className="size-4" />} Sign refund in {shortAddress(publicKey.toBase58())}
                </Button>
              ) : (
                <Alert tone="amber" title="Different wallet connected">
                  Refunds must come from the wallet that received the payment ({shortAddress(p.businessWallet)}).
                </Alert>
              )
            ) : (
              !p.demoMerchant && <WalletButton className="w-full" label="Connect business wallet" />
            ))}
        </>
      )}

      {r.attempts.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs text-fg-3">Attempts</p>
          {r.attempts.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-xs">
              {a.status === "confirmed" ? <CircleCheckBig className="size-3.5 text-mint" /> : a.status === "failed" || a.status === "expired" ? <ShieldAlert className="size-3.5 text-amber" /> : <LogoSpinner size={14} />}
              <span className="text-fg-2">{a.status}</span>
              {a.signature && <span className="truncate font-mono text-fg-3">{shortAddress(a.signature, 6)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

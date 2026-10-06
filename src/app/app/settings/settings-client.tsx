"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Droplets, ExternalLink, Plus, RotateCcw, Trash2, Wallet as WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useWalletProof } from "@/components/wallet/use-wallet-proof";
import { addWalletAction, faucetAction, removeWalletAction, resetWorkspaceAction, setActiveWalletAction } from "@/app/actions/business";
import { CopyButton } from "@/components/ui/interactive";
import { cn } from "@/lib/cn";
import { LogoSpinner } from "@/components/brand/logo";
import { Alert, Badge, Button, Card, CardHeader, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WalletButton } from "@/components/wallet/wallet-button";
import { useI18n } from "@/lib/i18n/client";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";

type Wallet = { address: string; label: string; active: boolean; serverHeld: boolean };

/**
 * Several receiving wallets, one active. New payment links use the active wallet; PayFix
 * keeps watching the others, and each refund is signed by the wallet that got the money.
 */
export function WalletSettings({ wallets, canManage, cluster, simulated, demoMode }: { wallets: Wallet[]; canManage: boolean; cluster: string; simulated: boolean; demoMode: boolean }) {
  const { publicKey, wallet } = useWallet();
  const { prove } = useWalletProof();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [manual, setManual] = useState({ address: "", label: "" });
  const [makeActive, setMakeActive] = useState(true);
  const toast = useToast();
  const { m, t } = useI18n();
  const copy = m.settings.wallets;
  const connected = publicKey?.toBase58();
  const connectedKnown = connected ? wallets.some((w) => w.address === connected) : false;

  const act = (key: string, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      setBusy(key);
      const res = await fn();
      setBusy(null);
      toast.push(res.ok ? { tone: "success", title: success } : { tone: "error", title: copy.failed, body: res.error });
    });

  return (
    <Card>
      <CardHeader title={copy.title} subtitle={copy.subtitle} />
      <div className="space-y-4 p-5">
        <ul className="space-y-2">
          {wallets.map((w) => (
            <li key={w.address} className={cn("flex flex-wrap items-center gap-3 rounded-xl border px-3.5 py-3", w.active ? "border-violet/30 bg-violet/[0.05]" : "border-veil/[0.07] bg-veil/[0.02]")}>
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", w.active ? "bg-violet/15 text-violet" : "bg-veil/[0.06] text-fg-3")}>
                <WalletIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {w.label}
                  {w.active && <Badge tone="violet">{copy.active}</Badge>}
                  {w.serverHeld && <span className="text-xs font-normal text-fg-3">{copy.serverHeld}</span>}
                </p>
                <p className="flex items-center gap-1 font-mono text-xs text-fg-3">
                  {shortAddress(w.address, 6)}
                  <CopyButton value={w.address} />
                  {!simulated && (
                    <a href={explorerUrl("address", w.address, cluster)} target="_blank" rel="noreferrer" className="hover:text-fg" aria-label={m.settings.explorer}>
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </p>
              </div>
              {!w.active && canManage && (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" disabled={pending} onClick={() => act(`a:${w.address}`, () => setActiveWalletAction(w.address), t(copy.nowActive, { label: w.label }))}>
                    {busy === `a:${w.address}` ? <LogoSpinner size={14} /> : copy.makeActive}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(`r:${w.address}`, () => removeWalletAction(w.address), t(copy.removed, { label: w.label }))} aria-label={t(copy.remove, { label: w.label })}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {canManage && (
        <div className="rounded-2xl border border-dashed border-veil/10 p-4">
          <p className="text-sm font-medium">{copy.addTitle}</p>
          <p className="mt-0.5 text-xs text-fg-3">
            {demoMode ? t(copy.addDemo, { cluster }) : copy.addProof}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!simulated && <WalletButton size="sm" />}
            {connected && !connectedKnown && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  act(
                    "connected",
                    async () => {
                      try {
                        const { address, proof } = await prove();
                        return await addWalletAction({ address, label: wallet?.adapter.name ?? "", makeActive, proof });
                      } catch (e) {
                        return { ok: false, error: e instanceof Error ? e.message : copy.didntSign };
                      }
                    },
                    t(copy.verifiedAdded, { name: wallet?.adapter.name ?? copy.walletFallback }),
                  )
                }
              >
                {busy === "connected" ? <LogoSpinner size={14} /> : <Plus className="size-4" />} {t(copy.verifyAndAdd, { address: shortAddress(connected) })}
              </Button>
            )}
          </div>
          {demoMode && (
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px_auto]">
            <Input placeholder={copy.addressPlaceholder} value={manual.address} onChange={(e) => setManual((v) => ({ ...v, address: e.target.value.trim() }))} className="font-mono text-sm" />
            <Input placeholder={copy.labelPlaceholder} value={manual.label} onChange={(e) => setManual((v) => ({ ...v, label: e.target.value }))} />
            <Button
              variant="secondary"
              disabled={pending || !manual.address}
              onClick={() =>
                act("manual", async () => {
                  const res = await addWalletAction({ ...manual, makeActive });
                  if (res.ok) setManual({ address: "", label: "" });
                  return res;
                }, copy.added)
              }
            >
              {busy === "manual" ? <LogoSpinner size={16} /> : copy.add}
            </Button>
          </div>
          )}
          <label className="mt-3 flex items-center gap-2 text-xs text-fg-2">
            <input type="checkbox" checked={makeActive} onChange={(e) => setMakeActive(e.target.checked)} className="accent-violet" />
            {copy.makeActiveCheckbox}
          </label>
        </div>
        )}
        {wallets.find((w) => w.active)?.serverHeld && (
          <Alert tone="violet" title={copy.demoActiveTitle}>
            {copy.demoActiveBody}
          </Alert>
        )}
      </div>
    </Card>
  );
}

export function DemoTools({ simulated, canReset }: { simulated: boolean; canReset: boolean }) {
  const [address, setAddress] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const { m } = useI18n();
  const d = m.settings.demo;

  return (
    <Card>
      <CardHeader title={d.title} subtitle={simulated ? d.subtitleSimulated : d.subtitleDevnet} />
      <div className="space-y-5 p-5">
        <div>
          <p className="text-sm font-medium">{d.faucetTitle}</p>
          <p className="mt-0.5 text-xs text-fg-3">{simulated ? d.faucetBodySimulated : d.faucetBody}</p>
          <div className="mt-2 flex gap-2">
            <Input placeholder={d.walletPlaceholder} value={address} onChange={(e) => setAddress(e.target.value.trim())} className="font-mono text-sm" />
            <Button
              variant="secondary"
              disabled={!address || busy === "faucet"}
              onClick={async () => {
                setBusy("faucet");
                const res = await faucetAction(address);
                setBusy(null);
                toast.push(res.ok ? { tone: "success", title: d.sent } : { tone: "error", title: d.faucetFailed, body: res.error });
              }}
            >
              {busy === "faucet" ? <LogoSpinner size={18} /> : <Droplets className="size-4" />} {d.send}
            </Button>
          </div>
        </div>
        {canReset && (
        <div className="border-t border-veil/[0.06] pt-5">
          <p className="text-sm font-medium">{d.resetTitle}</p>
          <p className="mt-0.5 text-xs text-fg-3">{d.resetBody}</p>
          <Button
            variant="danger"
            className="mt-3"
            disabled={pending}
            onClick={() => {
              if (!confirm(d.resetConfirm)) return;
              start(async () => {
                const res = await resetWorkspaceAction();
                if (!res.ok) return toast.push({ tone: "error", title: d.resetFailed, body: res.error });
                toast.push({ tone: "success", title: d.resetDone, body: d.resetDoneBody });
                router.push("/app");
              });
            }}
          >
            {pending ? <LogoSpinner size={18} /> : <RotateCcw className="size-4" />} {d.resetButton}
          </Button>
        </div>
        )}
      </div>
    </Card>
  );
}

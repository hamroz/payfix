"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Droplets, ExternalLink, Plus, RotateCcw, Trash2, Wallet as WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addWalletAction, faucetAction, removeWalletAction, resetDemoAction, setActiveWalletAction } from "@/app/actions/business";
import { CopyButton } from "@/components/ui/interactive";
import { cn } from "@/lib/cn";
import { LogoSpinner } from "@/components/brand/logo";
import { Alert, Badge, Button, Card, CardHeader, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WalletButton } from "@/components/wallet/wallet-button";
import { explorerUrl, shortAddress } from "@/lib/solana/tx";

type Wallet = { address: string; label: string; active: boolean };

/**
 * Several receiving wallets, one active. New payment links use the active wallet; PayFix
 * keeps watching the others, and each refund is signed by the wallet that got the money.
 */
export function WalletSettings({ wallets, demoMerchant, cluster, simulated }: { wallets: Wallet[]; demoMerchant: string | null; cluster: string; simulated: boolean }) {
  const { publicKey, wallet } = useWallet();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [manual, setManual] = useState({ address: "", label: "" });
  const [makeActive, setMakeActive] = useState(true);
  const toast = useToast();
  const connected = publicKey?.toBase58();
  const connectedKnown = connected ? wallets.some((w) => w.address === connected) : false;

  const act = (key: string, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      setBusy(key);
      const res = await fn();
      setBusy(null);
      toast.push(res.ok ? { tone: "success", title: success } : { tone: "error", title: "Couldn’t update", body: res.error });
    });

  return (
    <Card>
      <CardHeader title="Receiving wallets" subtitle="Payments go to the active wallet. PayFix keeps watching all of them, and refunds are signed by the wallet that received the money." />
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
                  {w.active && <Badge tone="violet">Active</Badge>}
                  {w.address === demoMerchant && <span className="text-xs font-normal text-fg-3">server-held demo key</span>}
                </p>
                <p className="flex items-center gap-1 font-mono text-xs text-fg-3">
                  {shortAddress(w.address, 6)}
                  <CopyButton value={w.address} />
                  {!simulated && (
                    <a href={explorerUrl("address", w.address, cluster)} target="_blank" rel="noreferrer" className="hover:text-fg" aria-label="Explorer">
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </p>
              </div>
              {!w.active && (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" disabled={pending} onClick={() => act(`a:${w.address}`, () => setActiveWalletAction(w.address), `${w.label} is now active`)}>
                    {busy === `a:${w.address}` ? <LogoSpinner size={14} /> : "Make active"}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(`r:${w.address}`, () => removeWalletAction(w.address), `${w.label} removed`)} aria-label={`Remove ${w.label}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-dashed border-veil/10 p-4">
          <p className="text-sm font-medium">Add a wallet</p>
          <p className="mt-0.5 text-xs text-fg-3">Connect it (Phantom, Solflare, MetaMask with a Solana account) or paste its Solana address. Switch the wallet to devnet first.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!simulated && <WalletButton size="sm" />}
            {connected && !connectedKnown && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() => act("connected", () => addWalletAction({ address: connected, label: wallet?.adapter.name ?? "", makeActive }), `${wallet?.adapter.name ?? "Wallet"} added`)}
              >
                {busy === "connected" ? <LogoSpinner size={14} /> : <Plus className="size-4" />} Add {wallet?.adapter.name ?? "wallet"} {shortAddress(connected)}
              </Button>
            )}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px_auto]">
            <Input placeholder="Solana address" value={manual.address} onChange={(e) => setManual((m) => ({ ...m, address: e.target.value.trim() }))} className="font-mono text-sm" />
            <Input placeholder="Label (optional)" value={manual.label} onChange={(e) => setManual((m) => ({ ...m, label: e.target.value }))} />
            <Button
              variant="secondary"
              disabled={pending || !manual.address}
              onClick={() =>
                act("manual", async () => {
                  const res = await addWalletAction({ ...manual, makeActive });
                  if (res.ok) setManual({ address: "", label: "" });
                  return res;
                }, "Wallet added")
              }
            >
              {busy === "manual" ? <LogoSpinner size={16} /> : "Add"}
            </Button>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-fg-2">
            <input type="checkbox" checked={makeActive} onChange={(e) => setMakeActive(e.target.checked)} className="accent-violet" />
            Make it the active wallet for new payment links
          </label>
        </div>
        {demoMerchant && wallets.find((w) => w.active)?.address === demoMerchant && (
          <Alert tone="violet" title="The demo merchant wallet is active">
            Its key is held by this server so refunds sign in one click. Add your own wallet and make it active to sign refunds yourself.
          </Alert>
        )}
      </div>
    </Card>
  );
}

export function DemoTools({ simulated }: { simulated: boolean }) {
  const [address, setAddress] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  return (
    <Card>
      <CardHeader title="Demo tools" subtitle={simulated ? "Simulated chain — nothing here touches a real network." : "Devnet test money only."} />
      <div className="space-y-5 p-5">
        <div>
          <p className="text-sm font-medium">Test-token faucet</p>
          <p className="mt-0.5 text-xs text-fg-3">Send 2,000 test USD{simulated ? "" : " and a little devnet SOL for fees"} to any wallet, e.g. a judge’s Phantom.</p>
          <div className="mt-2 flex gap-2">
            <Input placeholder="Wallet address" value={address} onChange={(e) => setAddress(e.target.value.trim())} className="font-mono text-sm" />
            <Button
              variant="secondary"
              disabled={!address || busy === "faucet"}
              onClick={async () => {
                setBusy("faucet");
                const res = await faucetAction(address);
                setBusy(null);
                toast.push(res.ok ? { tone: "success", title: "Test USD sent" } : { tone: "error", title: "Faucet failed", body: res.error });
              }}
            >
              {busy === "faucet" ? <LogoSpinner size={18} /> : <Droplets className="size-4" />} Send
            </Button>
          </div>
        </div>
        <div className="border-t border-veil/[0.06] pt-5">
          <p className="text-sm font-medium">Reset the demo</p>
          <p className="mt-0.5 text-xs text-fg-3">Clears all invoices, payments, and cases, then recreates Lumen Studio, Acme Robotics, and invoices A ($1,000) and B ($400). Past chain history is ignored.</p>
          <Button
            variant="danger"
            className="mt-3"
            disabled={pending}
            onClick={() => {
              if (!confirm("Reset the demo workspace? This deletes all demo data.")) return;
              start(async () => {
                const res = await resetDemoAction();
                if (!res.ok) return toast.push({ tone: "error", title: "Reset failed", body: res.error });
                router.push("/login");
              });
            }}
          >
            {pending ? <LogoSpinner size={18} /> : <RotateCcw className="size-4" />} Reset demo data
          </Button>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Droplets, RotateCcw, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { faucetAction, resetDemoAction, updateWalletAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Alert, Button, Card, CardHeader, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WalletButton } from "@/components/wallet/wallet-button";
import { shortAddress } from "@/lib/solana/tx";

export function WalletSettings({ current, demoMerchant }: { current: string; demoMerchant: boolean }) {
  const { publicKey } = useWallet();
  const [pending, start] = useTransition();
  const toast = useToast();
  const connected = publicKey?.toBase58();
  return (
    <Card>
      <CardHeader title="Receiving wallet" subtitle="Payments land here, and refunds are signed from here." />
      <div className="space-y-3 p-5">
        {demoMerchant && <Alert tone="violet" title="Using the demo merchant wallet">Its key is held by this server so refunds can be signed in one click during demos. Switch to your own wallet to sign refunds yourself.</Alert>}
        <div className="flex flex-wrap items-center gap-2">
          <WalletButton />
          {connected && connected !== current && (
            <Button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await updateWalletAction(connected);
                  toast.push(res.ok ? { tone: "success", title: `Receiving wallet set to ${shortAddress(connected)}` } : { tone: "error", title: "Couldn’t update", body: res.error });
                })
              }
            >
              <Wallet className="size-4" /> Receive into {shortAddress(connected)}
            </Button>
          )}
        </div>
        <p className="text-xs text-fg-3">Change this before sharing payment links. Payments already received stay tied to the wallet they were sent to.</p>
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

"use client";

import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { createWorkspaceAction, switchWorkspaceAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Input, Label } from "@/components/ui/primitives";
import { WalletButton } from "@/components/wallet/wallet-button";
import { useWalletProof } from "@/components/wallet/use-wallet-proof";
import { useI18n } from "@/lib/i18n/client";
import { shortAddress } from "@/lib/solana/tx";
import type { Role } from "@/lib/roles";

export function OnboardingForm({ email, demo, existing }: { email: string; demo: boolean; existing: { businessId: string; name: string; role: Role }[] }) {
  const { m, t, rich } = useI18n();
  const o = m.onboarding;
  const [name, setName] = useState("");
  const [sample, setSample] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const { address, prove } = useWalletProof();

  const create = () =>
    start(async () => {
      setError(null);
      let walletInput = {};
      if (!demo) {
        try {
          const { address: walletAddress, proof } = await prove();
          walletInput = { walletAddress, walletProof: proof };
        } catch (e) {
          return setError(e instanceof Error ? e.message : o.wallet.didNotSign);
        }
      }
      const res = await createWorkspaceAction({ name, ...walletInput, sampleData: demo && sample });
      if (res && !res.ok) setError(res.error);
    });

  return (
    <div className="w-full max-w-[440px] space-y-4">
      <form
        className="glass rounded-3xl p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
      >
        <h1 className="font-display text-2xl font-semibold tracking-tight">{existing.length ? o.createAnother : o.title}</h1>
        <p className="mt-1.5 text-sm text-fg-2">{rich(o.signedInAs, { email: (c) => <span className="text-fg">{c}</span> }, { email })}</p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">{o.companyName}</Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-3" />
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Lumen Studio" className="pl-10" autoFocus />
            </div>
          </div>
          {demo ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-violet/20 bg-violet/[0.06] p-3.5 text-[13px]">
              <input type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} className="mt-0.5 accent-violet" />
              <span className="text-fg-2">
                <span className="font-medium text-fg">{o.sampleData.title}</span>
                <br />
                {t(o.sampleData.body, { customer: "Acme Robotics", first: "$1,000", second: "$400" })}
              </span>
            </label>
          ) : (
            <div>
              <Label>{o.wallet.label}</Label>
              <div className="flex items-center gap-2">
                <WalletButton size="sm" />
                {address && <span className="font-mono text-xs text-fg-2">{shortAddress(address, 6)}</span>}
              </div>
              <p className="mt-1.5 text-xs text-fg-3">
                {o.wallet.hint}
              </p>
            </div>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-rose">{error}</p>}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending || name.trim().length < 2 || (!demo && !address)}>
          {pending ? (
            <>
              <LogoSpinner size={20} /> {demo ? o.settingUpWallet : o.waitingForWallet}
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> {o.create} <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {existing.length > 0 && (
        <div className="glass rounded-3xl p-4">
          <p className="px-2 pb-2 text-xs uppercase tracking-[0.14em] text-fg-3">{o.openExisting}</p>
          {existing.map((w) => (
            <button
              key={w.businessId}
              onClick={() => start(async () => void (await switchWorkspaceAction(w.businessId)))}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-veil/[0.05]"
            >
              <span className="font-medium">{w.name}</span>
              <span className="text-xs text-fg-3">{m.roles[w.role].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

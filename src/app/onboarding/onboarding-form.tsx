"use client";

import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { createWorkspaceAction, switchWorkspaceAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Input, Label } from "@/components/ui/primitives";
import { roleLabel, type Role } from "@/lib/roles";

export function OnboardingForm({ email, demo, existing }: { email: string; demo: boolean; existing: { businessId: string; name: string; role: Role }[] }) {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [sample, setSample] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const create = () =>
    start(async () => {
      setError(null);
      const res = await createWorkspaceAction({ name, walletAddress: demo ? undefined : wallet, sampleData: demo && sample });
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
        <h1 className="font-display text-2xl font-semibold tracking-tight">{existing.length ? "Create another company" : "Create your company"}</h1>
        <p className="mt-1.5 text-sm text-fg-2">
          Signed in as <span className="text-fg">{email}</span>. You’ll be its owner and can invite your team later.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Company name</Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-3" />
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Lumen Studio" className="pl-10" autoFocus />
            </div>
          </div>
          {demo ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-violet/20 bg-violet/[0.06] p-3.5 text-[13px]">
              <input type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} className="mt-0.5 accent-violet" />
              <span className="text-fg-2">
                <span className="font-medium text-fg">Add the demo customer and invoices</span>
                <br />
                Acme Robotics with a $1,000 and a $400 invoice, ready for the guided demo. Your company gets its own devnet test wallet.
              </span>
            </label>
          ) : (
            <div>
              <Label htmlFor="wallet">Receiving wallet (Solana address)</Label>
              <Input id="wallet" value={wallet} onChange={(e) => setWallet(e.target.value.trim())} placeholder="Your business wallet address" className="font-mono text-sm" />
              <p className="mt-1.5 text-xs text-fg-3">Payments land here and refunds are signed from here. You can add more wallets later.</p>
            </div>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-rose">{error}</p>}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending || name.trim().length < 2}>
          {pending ? (
            <>
              <LogoSpinner size={20} /> {demo ? "Setting up your wallet…" : "Creating…"}
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Create company <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {existing.length > 0 && (
        <div className="glass rounded-3xl p-4">
          <p className="px-2 pb-2 text-xs uppercase tracking-[0.14em] text-fg-3">Or open one of yours</p>
          {existing.map((w) => (
            <button
              key={w.businessId}
              onClick={() => start(async () => void (await switchWorkspaceAction(w.businessId)))}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-veil/[0.05]"
            >
              <span className="font-medium">{w.name}</span>
              <span className="text-xs text-fg-3">{roleLabel(w.role)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

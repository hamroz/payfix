"use client";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, LogOut, Wallet, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import { shortAddress } from "@/lib/solana/tx";

/** Connect / disconnect button with a wallet picker listing wallets detected in this browser. */
export function WalletButton({ className, size = "md", label }: { className?: string; size?: "sm" | "md" | "lg"; label?: string }) {
  const { m } = useI18n();
  const { wallets, select, publicKey, disconnect, connecting, wallet } = useWallet();
  const [open, setOpen] = useState(false);
  const installed = wallets.filter((w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable);

  if (publicKey) {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-veil/10 bg-veil/[0.05] px-3 text-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs */}
          {wallet?.adapter.icon && <img src={wallet.adapter.icon} alt="" className="size-4 rounded" />}
          <span className="font-mono text-[13px]">{shortAddress(publicKey.toBase58())}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={() => disconnect()} aria-label={m.wallet.disconnect}>
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="secondary" size={size} className={className} onClick={() => setOpen(true)} disabled={connecting}>
        <Wallet className="size-4" /> {connecting ? m.wallet.connecting : (label ?? m.wallet.connect)}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="glass w-full max-w-sm rounded-3xl bg-ink-850/95 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{m.wallet.pickerTitle}</h3>
                <button onClick={() => setOpen(false)} className="text-fg-3 hover:text-fg" aria-label={m.common.close}>
                  <X className="size-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-fg-3">{m.wallet.devnetHint}</p>
              <div className="mt-4 space-y-2">
                {installed.length === 0 && (
                  <div className="rounded-2xl border border-veil/10 bg-veil/[0.03] p-4 text-sm text-fg-2">
                    {m.wallet.noneFound}
                    <a href="https://phantom.com/download" target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1.5 text-violet hover:underline">
                      {m.wallet.getPhantom} <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                )}
                {installed.map((w) => (
                  <button
                    key={w.adapter.name}
                    onClick={() => {
                      select(w.adapter.name);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-veil/[0.07] bg-veil/[0.03] px-4 py-3 text-left transition hover:border-violet/40 hover:bg-veil/[0.06]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs */}
                    <img src={w.adapter.icon} alt="" className="size-7 rounded-lg" />
                    <span className="flex-1 text-sm font-medium">{w.adapter.name}</span>
                    <span className="text-xs text-mint">{m.wallet.detected}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

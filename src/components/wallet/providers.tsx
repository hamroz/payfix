"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import type { ReactNode } from "react";

/**
 * Wallet context for pages that need a browser wallet. Wallets are discovered through
 * the Wallet Standard (Phantom, Solflare, Backpack…), so no adapters are bundled.
 */
export function WalletProviders({ rpcUrl, children }: { rpcUrl: string; children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={rpcUrl} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={[]} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

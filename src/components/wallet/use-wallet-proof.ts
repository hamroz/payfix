"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useI18n } from "@/lib/i18n/client";
import { walletOwnershipMessage, type OwnershipProof } from "@/lib/solana/proof";

/** Asks the connected wallet to sign the ownership message for its own address. */
export function useWalletProof() {
  const { m } = useI18n();
  const { publicKey, signMessage } = useWallet();
  const prove = async (): Promise<{ address: string; proof: OwnershipProof }> => {
    if (!publicKey) throw new Error(m.wallet.connectFirst);
    if (!signMessage) throw new Error(m.wallet.cannotSign);
    const address = publicKey.toBase58();
    const message = walletOwnershipMessage({ address, issuedAt: new Date().toISOString() });
    const signature = await signMessage(new TextEncoder().encode(message));
    return { address, proof: { message, signature: bs58.encode(signature) } };
  };
  return { address: publicKey?.toBase58() ?? null, canSign: !!signMessage, prove };
}

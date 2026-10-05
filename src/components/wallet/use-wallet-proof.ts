"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { walletOwnershipMessage, type OwnershipProof } from "@/lib/solana/proof";

/** Asks the connected wallet to sign the ownership message for its own address. */
export function useWalletProof() {
  const { publicKey, signMessage } = useWallet();
  const prove = async (): Promise<{ address: string; proof: OwnershipProof }> => {
    if (!publicKey) throw new Error("Connect a wallet first.");
    if (!signMessage) throw new Error("This wallet can’t sign messages. Try Phantom or Solflare.");
    const address = publicKey.toBase58();
    const message = walletOwnershipMessage({ address, issuedAt: new Date().toISOString() });
    const signature = await signMessage(new TextEncoder().encode(message));
    return { address, proof: { message, signature: bs58.encode(signature) } };
  };
  return { address: publicKey?.toBase58() ?? null, canSign: !!signMessage, prove };
}

// Isomorphic transaction helpers: used by the browser (wallet payments) and the server
// (demo wallets, refund preparation). Nothing here touches secrets.
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PublicKey, Transaction, TransactionInstruction, type Blockhash } from "@solana/web3.js";

export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export const ata = (mint: PublicKey | string, owner: PublicKey | string) =>
  getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(owner));

/** A real wallet address: valid base58 and on the ed25519 curve (rejects PDAs and typos). */
export function isWalletAddress(address: string): boolean {
  try {
    const pk = new PublicKey(address);
    return PublicKey.isOnCurve(pk.toBytes()) && pk.toBase58() === address;
  } catch {
    return false;
  }
}

export function memoInstruction(memo: string, signer: PublicKey): TransactionInstruction {
  return new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
    data: new TextEncoder().encode(memo) as Buffer,
  });
}

/**
 * Customer → merchant payment, Solana Pay style: a checked transfer with the payment
 * request's reference key appended as a read-only account so the payment can be found
 * on chain without putting any invoice details on chain.
 */
export function buildPaymentTransaction(p: {
  payer: PublicKey;
  merchant: PublicKey;
  mint: PublicKey;
  decimals: number;
  amount: bigint;
  reference: PublicKey;
  blockhash: Blockhash;
  lastValidBlockHeight: number;
}): Transaction {
  const merchantAta = ata(p.mint, p.merchant);
  const ix = createTransferCheckedInstruction(ata(p.mint, p.payer), p.mint, merchantAta, p.payer, p.amount, p.decimals);
  ix.keys.push({ pubkey: p.reference, isSigner: false, isWritable: false });
  // A freshly added receiving wallet may not have a token account yet; create it if missing (no-op otherwise).
  return new Transaction({ feePayer: p.payer, blockhash: p.blockhash, lastValidBlockHeight: p.lastValidBlockHeight }).add(
    createAssociatedTokenAccountIdempotentInstruction(p.payer, merchantAta, p.merchant, p.mint),
    ix,
  );
}

/**
 * Merchant → customer refund. Creates the destination token account if needed (the
 * merchant pays that rent) and tags the transfer with a memo naming the refund id.
 */
export function buildRefundTransaction(p: {
  merchant: PublicKey;
  destination: PublicKey;
  mint: PublicKey;
  decimals: number;
  amount: bigint;
  refundId: string;
  blockhash: Blockhash;
  lastValidBlockHeight: number;
}): Transaction {
  const destAta = ata(p.mint, p.destination);
  return new Transaction({ feePayer: p.merchant, blockhash: p.blockhash, lastValidBlockHeight: p.lastValidBlockHeight }).add(
    createAssociatedTokenAccountIdempotentInstruction(p.merchant, destAta, p.destination, p.mint),
    createTransferCheckedInstruction(ata(p.mint, p.merchant), p.mint, destAta, p.merchant, p.amount, p.decimals),
    memoInstruction(`payfix:refund:${p.refundId}`, p.merchant),
  );
}

/** Solana Pay transfer-request URL, scannable by Phantom, Solflare, and other wallets. */
export function solanaPayUrl(p: {
  recipient: string;
  amount: string | null;
  mint: string;
  reference: string;
  label: string;
  message: string;
}): string {
  const q = new URLSearchParams();
  if (p.amount) q.set("amount", p.amount);
  q.set("spl-token", p.mint);
  q.set("reference", p.reference);
  q.set("label", p.label);
  q.set("message", p.message);
  return `solana:${p.recipient}?${q.toString().replace(/\+/g, "%20")}`;
}

export function explorerUrl(kind: "tx" | "address", value: string, cluster: string): string {
  const c = cluster === "mainnet-beta" ? "" : `?cluster=${cluster === "localnet" ? "custom" : cluster}`;
  return `https://explorer.solana.com/${kind}/${value}${c}`;
}

export const shortAddress = (a: string, n = 4) => (a.length > 2 * n + 1 ? `${a.slice(0, n)}…${a.slice(-n)}` : a);

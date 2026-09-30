import path from "node:path";
import { Connection, type ParsedTransactionWithMeta } from "@solana/web3.js";
import { env } from "@/lib/env";
import { SimChain } from "./sim-chain";
import { simulatedKeys } from "./sim-keys";

/** The slice of the Solana RPC that PayFix depends on. Swappable with a fake in tests. */
export interface ChainClient {
  getSignatures(address: string, limit: number): Promise<{ signature: string; failed: boolean }[]>;
  getParsedTransaction(signature: string): Promise<ParsedTransactionWithMeta | null>;
  getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }>;
  getBlockHeight(): Promise<number>;
  sendRawTransaction(bytes: Uint8Array): Promise<string>;
  /** null when the cluster has no record of the signature. */
  getSignatureStatus(signature: string): Promise<{ confirmed: boolean; err: unknown } | null>;
}

export function rpcChain(connection: Connection): ChainClient {
  return {
    async getSignatures(address, limit) {
      const { PublicKey } = await import("@solana/web3.js");
      const sigs = await connection.getSignaturesForAddress(new PublicKey(address), { limit }, "confirmed");
      return sigs.map((s) => ({ signature: s.signature, failed: s.err !== null }));
    },
    getParsedTransaction: (signature) =>
      connection.getParsedTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 }),
    getLatestBlockhash: () => connection.getLatestBlockhash("confirmed"),
    getBlockHeight: () => connection.getBlockHeight("confirmed"),
    sendRawTransaction: (bytes) => connection.sendRawTransaction(bytes, { skipPreflight: false, preflightCommitment: "confirmed" }),
    async getSignatureStatus(signature) {
      const { value } = await connection.getSignatureStatuses([signature], { searchTransactionHistory: true });
      const s = value[0];
      if (!s) return null;
      return { confirmed: s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized", err: s.err };
    },
  };
}

const holder = globalThis as typeof globalThis & { __payfixConnection?: Connection; __payfixChain?: ChainClient };

export function connection(): Connection {
  holder.__payfixConnection ??= new Connection(env().SOLANA_RPC_URL, "confirmed");
  return holder.__payfixConnection;
}

export function chain(): ChainClient {
  holder.__payfixChain ??= env().SOLANA_CLUSTER === "simulated" ? simulatedChain() : rpcChain(connection());
  return holder.__payfixChain;
}

/** The simulator behind chain() in simulated mode (for the faucet); null on a real cluster. */
export const sim = () => (isSimulated() ? (chain() as SimChain) : null);

export const isSimulated = () => env().SOLANA_CLUSTER === "simulated";

export function simulatedChain(): SimChain {
  const e = env();
  const sim = new SimChain(e.PAYFIX_MINT!, path.resolve(/*turbopackIgnore: true*/ process.cwd(), path.dirname(e.PGLITE_DIR), "simchain.json"));
  const keys = simulatedKeys();
  if (sim.balance(keys.customer.publicKey.toBase58()) === 0n) sim.fund(keys.customer.publicKey.toBase58(), 10_000_000_000n);
  sim.fund(keys.merchant.publicKey.toBase58(), 0n);
  return sim;
}

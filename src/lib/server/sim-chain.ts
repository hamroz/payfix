import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import bs58 from "bs58";
import { Keypair, PublicKey, Transaction, type ParsedTransactionWithMeta } from "@solana/web3.js";
import { ata, MEMO_PROGRAM_ID } from "@/lib/solana/tx";
import type { ChainClient } from "./chain";

type Account = { owner: string; mint: string; amount: bigint };

/**
 * A simulated Solana cluster with one SPL mint. It produces parsed transactions with
 * real-looking pre/post token balances, so the production parser, ingestion, and
 * refund code run unmodified. Used by tests, and by the app when no devnet test mint
 * is configured (always labeled "Simulated" in the UI). Optionally persists to disk.
 */
export class SimChain implements ChainClient {
  accounts = new Map<string, Account>();
  txs = new Map<string, ParsedTransactionWithMeta>();
  byAddress = new Map<string, string[]>();
  statuses = new Map<string, { confirmed: boolean; err: unknown }>();
  height = 1000;
  slot = 5000;
  /** When set, the next broadcast is accepted but never lands (simulates a dropped tx). */
  dropNextBroadcast = false;

  constructor(
    public mint: string,
    private file?: string,
  ) {
    if (file && existsSync(file)) this.load();
  }

  fund(owner: string, amount: bigint) {
    const key = ata(this.mint, owner).toBase58();
    const acc = this.accounts.get(key) ?? { owner, mint: this.mint, amount: 0n };
    acc.amount += amount;
    this.accounts.set(key, acc);
    this.save();
  }

  balance(owner: string) {
    return this.accounts.get(ata(this.mint, owner).toBase58())?.amount ?? 0n;
  }

  /** Executes a token transfer between two owners and records it as a parsed transaction. */
  transfer(p: { from: string; to: string; amount: bigint; reference?: string; memo?: string; signature?: string }): string {
    const src = ata(this.mint, p.from).toBase58();
    const dst = ata(this.mint, p.to).toBase58();
    const srcAcc = this.accounts.get(src);
    if (!srcAcc || srcAcc.amount < p.amount) throw new Error("simulation failed: insufficient funds");
    const dstAcc = this.accounts.get(dst) ?? { owner: p.to, mint: this.mint, amount: 0n };
    const keys = [p.from, src, dst, this.mint, ...(p.reference ? [p.reference] : [])];
    const pre = [
      { accountIndex: 1, mint: this.mint, owner: p.from, uiTokenAmount: { amount: srcAcc.amount.toString() } },
      ...(this.accounts.has(dst) ? [{ accountIndex: 2, mint: this.mint, owner: p.to, uiTokenAmount: { amount: dstAcc.amount.toString() } }] : []),
    ];
    srcAcc.amount -= p.amount;
    dstAcc.amount += p.amount;
    this.accounts.set(dst, dstAcc);
    const post = [
      { accountIndex: 1, mint: this.mint, owner: p.from, uiTokenAmount: { amount: srcAcc.amount.toString() } },
      { accountIndex: 2, mint: this.mint, owner: p.to, uiTokenAmount: { amount: dstAcc.amount.toString() } },
    ];
    const signature = p.signature ?? bs58.encode(Keypair.generate().secretKey);
    this.slot += 1;
    const tx = {
      slot: this.slot,
      blockTime: Math.floor(Date.now() / 1000),
      transaction: {
        signatures: [signature],
        message: {
          accountKeys: keys.map((k, i) => ({ pubkey: new PublicKey(k), signer: i === 0, writable: i === 1 || i === 2 })),
          instructions: p.memo ? [{ program: "spl-memo", programId: MEMO_PROGRAM_ID, parsed: p.memo }] : [],
        },
      },
      meta: { err: null, fee: 5000, preBalances: [], postBalances: [], preTokenBalances: pre, postTokenBalances: post, innerInstructions: [] },
    } as unknown as ParsedTransactionWithMeta;
    this.txs.set(signature, tx);
    for (const addr of [src, dst, ...(p.reference ? [p.reference] : [])]) {
      this.byAddress.set(addr, [signature, ...(this.byAddress.get(addr) ?? [])]);
    }
    this.statuses.set(signature, { confirmed: true, err: null });
    this.save();
    return signature;
  }

  async getSignatures(address: string, limit: number) {
    return (this.byAddress.get(address) ?? []).slice(0, limit).map((signature) => ({ signature, failed: false }));
  }
  async getParsedTransaction(signature: string) {
    return this.txs.get(signature) ?? null;
  }
  async getLatestBlockhash() {
    return { blockhash: Keypair.generate().publicKey.toBase58(), lastValidBlockHeight: this.currentHeight() + 150 };
  }
  async getBlockHeight() {
    return this.currentHeight();
  }
  async getSignatureStatus(signature: string) {
    return this.statuses.get(signature) ?? null;
  }

  /** Persistent sims advance ~2.5 blocks per second like a real cluster; tests move height by hand. */
  private currentHeight() {
    return this.file ? this.height + Math.floor((Date.now() - SIM_EPOCH) / 400) : this.height;
  }

  /** Decodes a refund transaction built by buildRefundTransaction and executes its transfer. */
  async sendRawTransaction(bytes: Uint8Array) {
    const tx = Transaction.from(bytes);
    if (!tx.verifySignatures()) throw new Error("simulation failed: missing or invalid signature");
    const signature = bs58.encode(tx.signature!);
    if (this.dropNextBroadcast) {
      this.dropNextBroadcast = false;
      return signature;
    }
    const transferIx = tx.instructions.find((ix) => ix.data[0] === 12 && ix.keys.length >= 4);
    if (!transferIx) throw new Error("simulation failed: no transferChecked");
    const amount = transferIx.data.readBigUInt64LE(1);
    const owner = transferIx.keys[3].pubkey.toBase58();
    const destAta = transferIx.keys[2].pubkey.toBase58();
    const refKey = transferIx.keys[4]?.pubkey.toBase58();
    const createIx = tx.instructions.find((ix) => ix.keys.length >= 3 && ix.keys[1].pubkey.toBase58() === destAta);
    const destOwner = this.accounts.get(destAta)?.owner ?? createIx?.keys[2].pubkey.toBase58();
    if (!destOwner) throw new Error("simulation failed: destination token account does not exist");
    const memoIx = tx.instructions.find((ix) => ix.programId.equals(MEMO_PROGRAM_ID));
    this.transfer({ from: owner, to: destOwner, amount, signature, reference: refKey, memo: memoIx ? Buffer.from(memoIx.data).toString() : undefined });
    return signature;
  }

  private save() {
    if (!this.file) return;
    mkdirSync(path.dirname(this.file), { recursive: true });
    writeFileSync(
      this.file,
      JSON.stringify(
        { mint: this.mint, accounts: [...this.accounts], txs: [...this.txs], byAddress: [...this.byAddress], statuses: [...this.statuses], slot: this.slot },
        (_, v) => (typeof v === "bigint" ? { __bigint: v.toString() } : v instanceof PublicKey ? { __pubkey: v.toBase58() } : v),
      ),
    );
  }

  private load() {
    const data = JSON.parse(readFileSync(this.file!, "utf8"), (_, v) =>
      v && typeof v === "object" && "__bigint" in v ? BigInt(v.__bigint) : v && typeof v === "object" && "__pubkey" in v ? new PublicKey(v.__pubkey) : v,
    );
    if (data.mint !== this.mint) return;
    this.accounts = new Map(data.accounts);
    // PublicKey serializes via toJSON to a plain string; restore the objects parsers expect.
    this.txs = new Map(
      (data.txs as [string, ParsedTransactionWithMeta][]).map(([sig, tx]) => {
        const msg = tx.transaction.message as unknown as { accountKeys: { pubkey: string | PublicKey }[]; instructions: { programId?: string | PublicKey }[] };
        msg.accountKeys = msg.accountKeys.map((k) => ({ ...k, pubkey: new PublicKey(k.pubkey) }));
        msg.instructions = msg.instructions.map((ix) => (ix.programId ? { ...ix, programId: new PublicKey(ix.programId) } : ix));
        return [sig, tx];
      }),
    );
    this.byAddress = new Map(data.byAddress);
    this.statuses = new Map(data.statuses);
    this.slot = data.slot;
  }
}

const SIM_EPOCH = Date.UTC(2026, 8, 1);

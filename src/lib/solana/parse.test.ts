import { Keypair, type ParsedTransactionWithMeta } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { parseTokenMovement } from "./parse";
import { ata } from "./tx";

// Reliability gate 1: only a confirmed, successful movement of the configured mint into the
// business's own token account counts as a payment, for exactly the amount that moved.

const mint = Keypair.generate().publicKey.toBase58();
const otherMint = Keypair.generate().publicKey.toBase58();
const merchant = Keypair.generate().publicKey.toBase58();
const payer = Keypair.generate().publicKey.toBase58();
const merchantAta = ata(mint, merchant).toBase58();
const payerAta = ata(mint, payer).toBase58();

type Bal = { index: number; mint: string; owner: string; pre: bigint; post: bigint };

function tx(balances: Bal[], opts: { err?: unknown; keys?: string[] } = {}): ParsedTransactionWithMeta {
  const keys = opts.keys ?? [payer, payerAta, merchantAta];
  const entry = (b: Bal, amount: bigint) => ({ accountIndex: b.index, mint: b.mint, owner: b.owner, uiTokenAmount: { amount: amount.toString(), decimals: 6, uiAmount: null, uiAmountString: "" } });
  return {
    slot: 42,
    blockTime: 1_790_000_000,
    meta: {
      err: opts.err ?? null,
      fee: 5000,
      preBalances: [],
      postBalances: [],
      preTokenBalances: balances.map((b) => entry(b, b.pre)),
      postTokenBalances: balances.map((b) => entry(b, b.post)),
    },
    transaction: { signatures: ["sig"], message: { accountKeys: keys.map((k) => ({ pubkey: { toBase58: () => k }, signer: false, writable: true })), instructions: [], recentBlockhash: "x" } },
  } as unknown as ParsedTransactionWithMeta;
}

const watch = { tokenAccount: merchantAta, mint };
const payment = (m = mint): Bal[] => [
  { index: 1, mint: m, owner: payer, pre: 1_000_000_000n, post: 400_000_000n },
  { index: 2, mint: m, owner: merchant, pre: 0n, post: 600_000_000n },
];

describe("verifying an incoming payment", () => {
  it("counts the exact amount of the configured mint received by the business's account", () => {
    const m = parseTokenMovement(tx(payment()), watch);
    expect(m).toMatchObject({ direction: "in", amount: 600_000_000n, counterpartyOwner: payer });
  });

  it("ignores a different mint, even with the same amounts", () => {
    expect(parseTokenMovement(tx(payment(otherMint)), watch)).toBeNull();
  });

  it("ignores a failed transaction", () => {
    expect(parseTokenMovement(tx(payment(), { err: { InstructionError: [0, "Custom"] } }), watch)).toBeNull();
  });

  it("ignores a transfer to someone else's token account", () => {
    const elsewhere = ata(mint, Keypair.generate().publicKey.toBase58()).toBase58();
    expect(parseTokenMovement(tx(payment(), { keys: [payer, payerAta, elsewhere] }), watch)).toBeNull();
  });

  it("ignores a transaction that touches the account without moving the balance", () => {
    expect(parseTokenMovement(tx([{ index: 2, mint, owner: merchant, pre: 5n, post: 5n }]), watch)).toBeNull();
  });
});

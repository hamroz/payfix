import type { ParsedTransactionWithMeta } from "@solana/web3.js";

export type TokenMovement = {
  direction: "in" | "out";
  amount: bigint;
  counterpartyOwner: string | null;
  counterpartyTokenAccount: string | null;
  references: string[];
  /** Every account key in the transaction; used to look up payment-request references. */
  accountKeys: string[];
  memos: string[];
  slot: number;
  blockTime: Date | null;
};

/**
 * Extracts the net movement of `mint` on the watched token account from a parsed
 * transaction, using pre/post token balances rather than trusting instruction data.
 * Returns null for failed transactions, other mints, or no net change.
 */
export function parseTokenMovement(
  tx: ParsedTransactionWithMeta,
  watch: { tokenAccount: string; mint: string; references?: Set<string> },
): TokenMovement | null {
  if (!tx.meta || tx.meta.err) return null;
  const keys = tx.transaction.message.accountKeys.map((k) => (typeof k === "string" ? k : k.pubkey.toBase58()));

  const deltas = new Map<number, { owner: string | null; delta: bigint }>();
  const add = (list: typeof tx.meta.preTokenBalances, sign: 1n | -1n) => {
    for (const b of list ?? []) {
      if (b.mint !== watch.mint) continue;
      const cur = deltas.get(b.accountIndex) ?? { owner: b.owner ?? null, delta: 0n };
      cur.delta += sign * BigInt(b.uiTokenAmount.amount);
      cur.owner ??= b.owner ?? null;
      deltas.set(b.accountIndex, cur);
    }
  };
  add(tx.meta.preTokenBalances, -1n);
  add(tx.meta.postTokenBalances, 1n);

  const watchedIndex = keys.indexOf(watch.tokenAccount);
  const watched = deltas.get(watchedIndex);
  if (watchedIndex < 0 || !watched || watched.delta === 0n) return null;

  const direction = watched.delta > 0n ? "in" : "out";
  // The counterparty is the account whose balance moved the opposite way the most.
  let counterparty: { index: number; owner: string | null; delta: bigint } | null = null;
  for (const [index, d] of deltas) {
    if (index === watchedIndex) continue;
    const opposite = direction === "in" ? d.delta < 0n : d.delta > 0n;
    if (!opposite) continue;
    const mag = d.delta < 0n ? -d.delta : d.delta;
    const best = counterparty ? (counterparty.delta < 0n ? -counterparty.delta : counterparty.delta) : -1n;
    if (mag > best) counterparty = { index, ...d };
  }

  const memos: string[] = [];
  const instructions = [
    ...tx.transaction.message.instructions,
    ...(tx.meta.innerInstructions ?? []).flatMap((i) => i.instructions),
  ];
  for (const ix of instructions) {
    if ("parsed" in ix && ix.program === "spl-memo" && typeof ix.parsed === "string") memos.push(ix.parsed);
  }

  return {
    direction,
    amount: watched.delta > 0n ? watched.delta : -watched.delta,
    counterpartyOwner: counterparty?.owner ?? null,
    counterpartyTokenAccount: counterparty ? keys[counterparty.index] : null,
    references: watch.references ? keys.filter((k) => watch.references!.has(k)) : [],
    accountKeys: keys,
    memos,
    slot: tx.slot,
    blockTime: tx.blockTime ? new Date(tx.blockTime * 1000) : null,
  };
}

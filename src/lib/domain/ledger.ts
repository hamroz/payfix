import type { Account } from "@/lib/db/schema";
import { sum } from "@/lib/money";

/**
 * Double-entry postings. Every journal entry sums to zero. Money enters through the
 * `external` account when a verified transfer is received; after that it only moves
 * between internal accounts, so for any customer:
 *
 *   received = invoice + credit + refund_pending + refunded + unresolved
 */
export type PostingDraft = {
  account: Account;
  amount: bigint;
  transferId?: string | null;
  invoiceId?: string | null;
  customerId?: string | null;
  refundId?: string | null;
  caseId?: string | null;
};

export type Dimensions = Omit<PostingDraft, "account" | "amount">;

export function move(from: Account, to: Account, amount: bigint, dims: Dimensions, toDims: Dimensions = {}): PostingDraft[] {
  if (amount <= 0n) throw new Error("Ledger moves must be positive");
  return [
    { account: from, amount: -amount, ...dims },
    { account: to, amount, ...dims, ...toDims },
  ];
}

/** A verified incoming transfer lands in `unresolved` until it is applied somewhere. */
export function receipt(amount: bigint, dims: Dimensions): PostingDraft[] {
  return move("external", "unresolved", amount, dims);
}

export function assertBalanced(postings: PostingDraft[]): void {
  const total = sum(postings.map((p) => p.amount));
  if (total !== 0n) throw new Error(`Journal entry is unbalanced by ${total}`);
  if (postings.length === 0) throw new Error("Journal entry has no postings");
}

export type Balances = Record<Exclude<Account, "external">, bigint>;

export const emptyBalances = (): Balances => ({
  unresolved: 0n,
  invoice: 0n,
  credit: 0n,
  refund_pending: 0n,
  refunded: 0n,
});

export function balancesFrom(rows: { account: Account; amount: bigint }[]): Balances & { received: bigint } {
  const b = emptyBalances();
  let received = 0n;
  for (const r of rows) {
    if (r.account === "external") received -= r.amount;
    else b[r.account] += r.amount;
  }
  return { ...b, received };
}

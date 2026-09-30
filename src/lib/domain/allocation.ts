import type { CaseKind } from "@/lib/db/schema";
import { min } from "@/lib/money";

export const DUPLICATE_WINDOW_MS = 72 * 60 * 60 * 1000;

export type PriorPayment = { amount: bigint; counterparty: string | null; receivedAt: Date };

export type IncomingPlan = {
  /** Amount applied to the referenced invoice automatically. */
  apply: bigint;
  /** Amount left unresolved; creates an exception when > 0. */
  excess: bigint;
  late: boolean;
  exception: CaseKind | null;
};

/**
 * Decides what happens to a verified transfer that references an invoice.
 * The transfer covers the invoice's remaining balance; anything beyond that is excess.
 * Excess is an "apparent duplicate" when the invoice was already settled and the same
 * payer recently sent the same amount — otherwise it's a plain overpayment. Either way
 * it stays unresolved until customer and business agree what to do with it.
 */
export function planIncoming(input: {
  amount: bigint;
  invoiceAmount: bigint;
  alreadyApplied: bigint;
  dueAt: Date;
  receivedAt: Date;
  counterparty: string | null;
  priorPayments: PriorPayment[];
}): IncomingPlan {
  if (input.amount <= 0n) throw new Error("Transfer amount must be positive");
  const remaining = input.invoiceAmount > input.alreadyApplied ? input.invoiceAmount - input.alreadyApplied : 0n;
  const apply = min(input.amount, remaining);
  const excess = input.amount - apply;
  const late = input.receivedAt.getTime() > input.dueAt.getTime();

  let exception: CaseKind | null = null;
  if (excess > 0n) {
    const looksRepeated =
      remaining === 0n &&
      input.priorPayments.some(
        (p) =>
          p.amount === input.amount &&
          p.counterparty !== null &&
          p.counterparty === input.counterparty &&
          Math.abs(input.receivedAt.getTime() - p.receivedAt.getTime()) <= DUPLICATE_WINDOW_MS,
      );
    exception = looksRepeated ? "duplicate" : "overpayment";
  }
  return { apply, excess, late, exception };
}

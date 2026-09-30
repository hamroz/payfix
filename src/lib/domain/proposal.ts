import { createHash } from "node:crypto";
import type { ProposalLine } from "@/lib/db/schema";
import { formatUsd, sum, tryToUnits } from "@/lib/money";

export type OpenInvoice = { id: string; number: string; remaining: bigint };

/** Stored and hashed lines carry amounts as integer base-unit strings ("60000000"). */
export type ProposalInput = {
  lines: ProposalLine[];
  refundDestination: string | null;
};

/**
 * Converts lines entered by a person (decimal amounts like "60" or "40.50") into stored
 * lines with base-unit amounts. Invalid or non-positive amounts are reported, not guessed.
 */
export function parseLines(draft: ProposalLine[]): { ok: true; lines: ProposalLine[] } | { ok: false; errors: string[] } {
  const lines: ProposalLine[] = [];
  for (const l of draft) {
    const units = tryToUnits(l.amount);
    if (units === null || units <= 0n) return { ok: false, errors: ["Every allocation needs a positive amount."] };
    lines.push({ ...l, amount: units.toString() });
  }
  return { ok: true, lines };
}

const units = (l: ProposalLine) => BigInt(l.amount);

export type Validation = { ok: true } | { ok: false; errors: string[] };

/**
 * A proposal must place every unit of the available excess exactly once:
 * onto open invoices for the same customer (never above their remaining balance),
 * into customer credit, or back to the customer as a refund.
 */
export function validateProposal(
  input: ProposalInput,
  ctx: {
    available: bigint;
    openInvoices: OpenInvoice[];
    isValidDestination: (address: string) => boolean;
  },
): Validation {
  const errors: string[] = [];
  const { lines } = input;
  if (lines.length === 0) errors.push("Add at least one allocation.");

  const seenInvoices = new Set<string>();
  let credits = 0;
  let refunds = 0;
  for (const line of lines) {
    const amount = /^\d+$/.test(line.amount) ? BigInt(line.amount) : 0n;
    if (amount <= 0n) {
      errors.push("Every allocation needs a positive amount.");
      continue;
    }
    if (line.type === "invoice") {
      const inv = ctx.openInvoices.find((i) => i.id === line.invoiceId);
      if (!inv) errors.push("That invoice isn't open for this customer.");
      else if (amount > inv.remaining)
        errors.push(`${inv.number} only has ${formatUsd(inv.remaining)} remaining.`);
      if (seenInvoices.has(line.invoiceId)) errors.push("Each invoice can appear only once.");
      seenInvoices.add(line.invoiceId);
    } else if (line.type === "credit") {
      credits++;
    } else if (line.type === "refund") {
      refunds++;
    }
  }
  if (credits > 1) errors.push("Use a single credit line.");
  if (refunds > 1) errors.push("Use a single refund line.");

  const refundTotal = sum(lines.filter((l) => l.type === "refund").map(units));
  if (refundTotal > 0n) {
    if (!input.refundDestination) errors.push("A refund needs a destination wallet.");
    else if (!ctx.isValidDestination(input.refundDestination)) errors.push("The refund destination isn't a valid wallet address.");
  }

  const total = sum(lines.map((l) => (/^\d+$/.test(l.amount) ? BigInt(l.amount) : 0n)));
  if (errors.length === 0 && total !== ctx.available) {
    errors.push(
      total > ctx.available
        ? `That's ${formatUsd(total - ctx.available)} more than the ${formatUsd(ctx.available)} available.`
        : `${formatUsd(ctx.available - total)} is still unallocated.`,
    );
  }
  return errors.length ? { ok: false, errors: [...new Set(errors)] } : { ok: true };
}

/** Canonical, order-independent representation of a plan (amounts in base units). */
export function canonicalLines(lines: ProposalLine[]): ProposalLine[] {
  const rank = { invoice: 0, credit: 1, refund: 2 } as const;
  return lines
    .map((l) => ({ ...l, amount: BigInt(l.amount).toString() }))
    .sort((a, b) => {
      if (a.type !== b.type) return rank[a.type] - rank[b.type];
      return a.type === "invoice" && b.type === "invoice" ? a.invoiceId.localeCompare(b.invoiceId) : 0;
    });
}

/**
 * The approval binds to this hash. It covers the case, version, available amount, every
 * allocation, and the refund destination, so changing any of them needs a new approval.
 */
export function hashProposal(p: {
  caseId: string;
  version: number;
  available: bigint;
  lines: ProposalLine[];
  refundDestination: string | null;
}): string {
  const canonical = JSON.stringify({
    caseId: p.caseId,
    version: p.version,
    available: p.available.toString(),
    lines: canonicalLines(p.lines).map((l) => (l.type === "invoice" ? [l.type, l.invoiceId, l.amount] : [l.type, l.amount])),
    refundDestination: p.refundDestination ?? null,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export const lineAmount = (lines: ProposalLine[], type: ProposalLine["type"]) => sum(lines.filter((l) => l.type === type).map(units));

const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

/** Human-readable list of what changed between two versions; used in the timeline. */
export function describeChanges(
  prev: ProposalInput,
  next: ProposalInput,
  invoiceNumber: (id: string) => string,
): string[] {
  const changes: string[] = [];
  const prevLines = new Map(canonicalLines(prev.lines).map((l) => [l.type === "invoice" ? `invoice:${l.invoiceId}` : l.type, l]));
  const nextLines = new Map(canonicalLines(next.lines).map((l) => [l.type === "invoice" ? `invoice:${l.invoiceId}` : l.type, l]));
  const label = (key: string) =>
    key.startsWith("invoice:") ? `Allocation to ${invoiceNumber(key.slice(8))}` : key === "credit" ? "Credit" : "Refund";

  for (const key of new Set([...prevLines.keys(), ...nextLines.keys()])) {
    const a = prevLines.get(key);
    const b = nextLines.get(key);
    if (a && !b) changes.push(`${label(key)} removed (was ${formatUsd(BigInt(a.amount))})`);
    else if (!a && b) changes.push(`${label(key)} added: ${formatUsd(BigInt(b.amount))}`);
    else if (a && b && a.amount !== b.amount)
      changes.push(`${label(key)} changed from ${formatUsd(BigInt(a.amount))} to ${formatUsd(BigInt(b.amount))}`);
  }
  if ((prev.refundDestination ?? null) !== (next.refundDestination ?? null)) {
    if (prev.refundDestination && next.refundDestination)
      changes.push(`Refund destination changed from ${short(prev.refundDestination)} to ${short(next.refundDestination)}`);
    else if (next.refundDestination) changes.push(`Refund destination set to ${short(next.refundDestination)}`);
    else changes.push("Refund destination removed");
  }
  return changes;
}

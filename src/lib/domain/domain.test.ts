import { describe, expect, it } from "vitest";
import { formatUsd, fromUnits, toUnits } from "@/lib/money";
import { planIncoming } from "./allocation";
import { assertBalanced, balancesFrom, move, receipt } from "./ledger";
import { describeChanges, hashProposal, parseLines, validateProposal } from "./proposal";

const $ = (s: string) => toUnits(s);

describe("money", () => {
  it("round-trips decimal strings through integer units", () => {
    expect(toUnits("1000")).toBe(1_000_000_000n);
    expect(toUnits("60.5")).toBe(60_500_000n);
    expect(fromUnits(1_100_000_000n)).toBe("1100.00");
    expect(fromUnits(123_456n)).toBe("0.123456");
    expect(formatUsd($("1100"))).toBe("$1,100.00");
  });

  it("reads decimal commas and grouping the way people type them", () => {
    expect(toUnits("49,99")).toBe(49_990_000n);
    expect(toUnits("60,5")).toBe(60_500_000n);
    expect(toUnits("1,000")).toBe(1_000_000_000n);
    expect(toUnits("1,000.50")).toBe(1_000_500_000n);
    expect(toUnits("1.000,50")).toBe(1_000_500_000n);
    expect(toUnits("2 000")).toBe(2_000_000_000n);
    expect(toUnits("2\u00a0000,25")).toBe(2_000_250_000n);
    expect(() => toUnits("1,2,3")).toThrow();
    expect(() => toUnits("1,000,5")).toThrow();
  });

  it("rejects malformed and over-precise amounts", () => {
    expect(() => toUnits("-5")).toThrow();
    expect(() => toUnits("1e3")).toThrow();
    expect(() => toUnits("0.0000001")).toThrow();
  });
});

describe("planIncoming", () => {
  const base = {
    invoiceAmount: $("1000"),
    dueAt: new Date("2026-10-10T00:00:00Z"),
    receivedAt: new Date("2026-10-01T00:00:00Z"),
    counterparty: "payer",
    priorPayments: [],
  };

  it("applies a partial payment fully", () => {
    expect(planIncoming({ ...base, amount: $("600"), alreadyApplied: 0n })).toEqual({
      apply: $("600"),
      excess: 0n,
      late: false,
      exception: null,
    });
  });

  it("splits a payment that exceeds the remaining balance into applied and excess", () => {
    const plan = planIncoming({ ...base, amount: $("500"), alreadyApplied: $("600") });
    expect(plan.apply).toBe($("400"));
    expect(plan.excess).toBe($("100"));
    expect(plan.exception).toBe("overpayment");
  });

  it("flags a repeat of the same amount from the same payer after settlement as an apparent duplicate", () => {
    const plan = planIncoming({
      ...base,
      amount: $("1000"),
      alreadyApplied: $("1000"),
      priorPayments: [{ amount: $("1000"), counterparty: "payer", receivedAt: new Date("2026-09-30T12:00:00Z") }],
    });
    expect(plan).toMatchObject({ apply: 0n, excess: $("1000"), exception: "duplicate" });
  });

  it("does not call it a duplicate when the payer differs", () => {
    const plan = planIncoming({
      ...base,
      amount: $("1000"),
      alreadyApplied: $("1000"),
      priorPayments: [{ amount: $("1000"), counterparty: "someone-else", receivedAt: base.receivedAt }],
    });
    expect(plan.exception).toBe("overpayment");
  });

  it("marks payments after the due date as late", () => {
    const plan = planIncoming({ ...base, amount: $("10"), alreadyApplied: 0n, receivedAt: new Date("2026-10-11T00:00:00Z") });
    expect(plan.late).toBe(true);
  });
});

describe("ledger", () => {
  it("keeps received equal to the sum of internal balances", () => {
    const dims = { transferId: "t1", customerId: "c1" };
    const entries = [
      receipt($("600"), dims),
      move("unresolved", "invoice", $("600"), dims, { invoiceId: "A" }),
      receipt($("500"), { ...dims, transferId: "t2" }),
      move("unresolved", "invoice", $("400"), { ...dims, transferId: "t2" }, { invoiceId: "A" }),
      [
        ...move("unresolved", "invoice", $("60"), { transferId: "t2" }, { invoiceId: "B" }),
        ...move("unresolved", "refund_pending", $("40"), { transferId: "t2" }, { refundId: "r1" }),
      ],
      move("refund_pending", "refunded", $("40"), { refundId: "r1" }),
    ];
    entries.forEach(assertBalanced);
    const b = balancesFrom(entries.flat());
    expect(b.received).toBe($("1100"));
    expect(b.invoice).toBe($("1060"));
    expect(b.refunded).toBe($("40"));
    expect(b.unresolved).toBe(0n);
    expect(b.invoice + b.credit + b.refund_pending + b.refunded + b.unresolved).toBe(b.received);
  });

  it("rejects unbalanced entries and non-positive moves", () => {
    expect(() => assertBalanced([{ account: "invoice", amount: 5n }])).toThrow();
    expect(() => move("unresolved", "invoice", 0n, {})).toThrow();
  });
});

describe("proposals", () => {
  const ctx = {
    available: $("100"),
    openInvoices: [{ id: "B", number: "INV-0002", remaining: $("400") }],
    isValidDestination: (a: string) => a.startsWith("wallet"),
  };
  const u = (d: string) => toUnits(d).toString();
  const plan = {
    lines: [
      { type: "invoice" as const, invoiceId: "B", amount: u("60") },
      { type: "refund" as const, amount: u("40") },
    ],
    refundDestination: "walletA",
  };

  it("converts entered decimal amounts to base units and rejects bad input", () => {
    expect(parseLines([{ type: "refund", amount: "40.5" }])).toEqual({ ok: true, lines: [{ type: "refund", amount: "40500000" }] });
    expect(parseLines([{ type: "refund", amount: "-1" }]).ok).toBe(false);
    expect(parseLines([{ type: "refund", amount: "0" }]).ok).toBe(false);
  });

  it("accepts a plan that allocates exactly the available excess", () => {
    expect(validateProposal(plan, ctx)).toEqual({ ok: true });
  });

  it("rejects plans that over-allocate, under-allocate, or refund without a destination", () => {
    expect(validateProposal({ ...plan, lines: [{ type: "refund", amount: u("150") }] }, ctx).ok).toBe(false);
    expect(validateProposal({ ...plan, lines: [{ type: "refund", amount: u("40") }] }, ctx).ok).toBe(false);
    expect(validateProposal({ ...plan, refundDestination: null }, ctx).ok).toBe(false);
    expect(validateProposal({ ...plan, refundDestination: "exchange-deposit" }, ctx).ok).toBe(false);
  });

  it("rejects allocating more to an invoice than it has remaining, or to a foreign invoice", () => {
    const tiny = { ...ctx, openInvoices: [{ id: "B", number: "INV-0002", remaining: $("50") }] };
    expect(validateProposal(plan, tiny).ok).toBe(false);
    expect(validateProposal({ ...plan, lines: [{ type: "invoice", invoiceId: "Z", amount: u("100") }] }, ctx).ok).toBe(false);
  });

  it("changes the hash when the destination, an amount, or the version changes, but not the line order", () => {
    const base = { caseId: "case1", version: 1, available: $("100"), ...plan };
    const h = hashProposal(base);
    expect(hashProposal({ ...base, lines: [...plan.lines].reverse() })).toBe(h);
    expect(hashProposal({ ...base, refundDestination: "walletB" })).not.toBe(h);
    expect(hashProposal({ ...base, version: 2 })).not.toBe(h);
    expect(
      hashProposal({ ...base, lines: [{ type: "invoice", invoiceId: "B", amount: u("70") }, { type: "refund", amount: u("30") }] }),
    ).not.toBe(h);
  });

  it("describes what changed between versions", () => {
    const changes = describeChanges(plan, { ...plan, refundDestination: "walletB9999" }, () => "INV-0002");
    expect(changes).toEqual(["Refund destination changed from wall…letA to wall…9999"]);
  });
});

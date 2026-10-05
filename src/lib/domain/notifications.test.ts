import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES, categoryOf, enabledTypes, isCategoryId } from "./notifications";

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sources(full);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

/** Every `type: "a.b"` inside a `logEvent(...)` call in server code and actions. */
function loggedTypes() {
  const root = path.join(process.cwd(), "src");
  const files = [...sources(path.join(root, "lib/server")), ...sources(path.join(root, "app/actions"))];
  const types = new Set<string>();
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    for (const call of text.split("logEvent(").slice(1)) {
      const m = call.slice(0, call.indexOf("})") + 2).match(/type: "([a-z_]+\.[a-z_]+)"/);
      if (m) types.add(m[1]);
    }
  }
  return types;
}

describe("notification categories", () => {
  it("maps event types to categories", () => {
    expect(categoryOf("payment.received")).toBe("payments");
    expect(categoryOf("invoice.overdue")).toBe("invoices");
    expect(categoryOf("member.removed")).toBe("team");
    expect(categoryOf("nope")).toBeNull();
    expect(isCategoryId("refunds")).toBe(true);
    expect(isCategoryId("bogus")).toBe(false);
  });

  it("enables everything by default and drops muted categories", () => {
    const all = CATEGORIES.flatMap((c) => c.types);
    expect(new Set(enabledTypes([]))).toEqual(new Set(all));
    expect(enabledTypes(["payments"])).not.toContain("payment.received");
    expect(enabledTypes(["payments"])).toContain("invoice.paid");
    expect(enabledTypes(CATEGORIES.map((c) => c.id))).toEqual([]);
  });

  it("maps the event types added for notifications", () => {
    for (const t of ["case.resolved", "customer.verified", "invoice.paid", "invoice.overdue", "customer.created", "member.role_changed", "member.removed", "wallet.removed"])
      expect(categoryOf(t), t).not.toBeNull();
  });

  it("maps every event type the code logs", () => {
    const types = loggedTypes();
    expect(types.size).toBeGreaterThan(10);
    for (const t of types) expect(categoryOf(t), t).not.toBeNull();
  });
});

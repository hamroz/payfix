import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";

// Demo mode (simulated chain) with one platform admin. Set before env() is first read.
vi.stubEnv("ADMIN_EMAILS", "Boss@PayFix.test, second@payfix.test");

const { openPglite } = await import("@/lib/db/client");
const { otpCodes, outbox, sessions } = await import("@/lib/db/schema");
const { env, resetEnvForTests } = await import("@/lib/env");
const { newId, newToken } = await import("@/lib/ids");
const { sessionSubject } = await import("./auth");
const { adminFromToken, isAdminEmail, requestAdminCode, verifyAdminCode } = await import("./admin/access");
const { createHash } = await import("node:crypto");
const { Keypair } = await import("@solana/web3.js");
const { toUnits } = await import("@/lib/money");
const { overviewStats } = await import("./admin/stats");
const { audit, listAudit } = await import("./admin/audit");
const { runDemoScenario } = await import("./test-scenario");
const { createWorkspace, findOrCreateUser, seedSampleData } = await import("./workspaces");

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Requests an admin code and reads it from the console line local delivery prints. */
async function codeFor(db: Db, email: string) {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  await requestAdminCode(db, email);
  const line = log.mock.calls.map((c) => String(c[0])).find((l) => l.includes(`email to ${email.toLowerCase()}`));
  log.mockRestore();
  return line?.match(/\b(\d{6})\b/)?.[1] ?? null;
}

describe("admin sign-in", () => {
  let db: Db;
  beforeAll(async () => {
    db = await openPglite();
  });
  afterEach(() => {
    vi.stubEnv("ADMIN_EMAILS", "Boss@PayFix.test, second@payfix.test");
    resetEnvForTests();
  });

  it("reads the allowlist case-insensitively", () => {
    expect(env().DEMO_MODE).toBe(true);
    expect(isAdminEmail(" BOSS@payfix.test ")).toBe(true);
    expect(isAdminEmail("intruder@payfix.test")).toBe(false);
  });

  it("answers a non-admin the same way but creates no code", async () => {
    const res = await requestAdminCode(db, "intruder@payfix.test");
    expect(res).toEqual({ maskedEmail: expect.stringContaining("@payfix.test") });
    const codes = await db.select().from(otpCodes).where(eq(otpCodes.purpose, "admin"));
    expect(codes).toHaveLength(0);
  });

  it("never puts an admin code in the demo inbox", async () => {
    await codeFor(db, "Boss@PayFix.test");
    const mail = await db.select().from(outbox).where(eq(outbox.to, "boss@payfix.test"));
    expect(mail.length).toBeGreaterThan(0);
    expect(mail.every((m) => m.status !== "demo")).toBe(true);
  });

  it("signs an admin in with the emailed code", async () => {
    const code = await codeFor(db, "second@payfix.test");
    expect(code).toMatch(/^\d{6}$/);
    expect(await verifyAdminCode(db, "intruder@payfix.test", code!)).toEqual({ ok: false, error: "codeExpired" });
    const res = await verifyAdminCode(db, "Second@PayFix.test", code!);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(12 * 3600_000);
    expect(await adminFromToken(db, res.token)).toBe("second@payfix.test");
  });

  it("keeps admin and business sessions apart", async () => {
    const business = newToken();
    await db.insert(sessions).values({ id: newId("ses"), kind: "business", subjectId: "boss@payfix.test", tokenHash: sha256(business), expiresAt: new Date(Date.now() + 3600_000) });
    expect(await adminFromToken(db, business)).toBeNull();

    const code = await codeFor(db, "boss@payfix.test");
    const res = await verifyAdminCode(db, "boss@payfix.test", code!);
    if (!res.ok) throw new Error(res.error);
    expect(await sessionSubject(db, "business", res.token)).toBeNull();
  });

  it("revokes a signed-in admin removed from the allowlist", async () => {
    const code = await codeFor(db, "boss@payfix.test");
    const res = await verifyAdminCode(db, "boss@payfix.test", code!);
    if (!res.ok) throw new Error(res.error);
    expect(await adminFromToken(db, res.token)).toBe("boss@payfix.test");
    vi.stubEnv("ADMIN_EMAILS", "second@payfix.test");
    resetEnvForTests();
    expect(await adminFromToken(db, res.token)).toBeNull();
    const [s] = await db.select().from(sessions).where(and(eq(sessions.kind, "admin"), eq(sessions.tokenHash, sha256(res.token))));
    expect(s).toBeDefined(); // the row stays; the allowlist is what grants access
  });
});

describe("platform statistics", () => {
  let db: Db;
  const $ = (s: string) => toUnits(s);
  beforeAll(async () => {
    db = await openPglite();
    await runDemoScenario(db);
  });

  it("adds up the demo scenario", async () => {
    const o = await overviewStats(db, "30d");
    expect(o.tiles.users).toEqual({ total: 1, inRange: 1 });
    expect(o.tiles.companies).toEqual({ total: 1, inRange: 1 });
    expect(o.tiles.activeCompanies).toBe(1);
    expect(o.tiles.invoices.total).toBe(2);
    expect(o.tiles.payments.total).toBe(2);
    expect(o.tiles.openCases).toBe(0);
    expect(o.money.received).toBe($("1100").toString());
    expect(o.money.invoice).toBe($("1060").toString());
    expect(o.money.refunded).toBe($("40").toString());
    expect(o.money.refundPending).toBe("0");
    expect(o.money.unresolved).toBe("0");
    expect(o.funnel).toEqual({ signedUp: 1, inCompany: 1, invoiced: 1, paid: 1, resolved: 1, refunded: 1 });
    expect(o.refunds.confirmed).toBe(1);
    expect(o.approvals).toEqual({ total: 2, invalidated: 1 });
    expect(o.cases.byStatus.resolved).toBe(1);
    expect(o.cases.byKind.overpayment).toBe(1);
    expect(o.cases.medianMinutesToResolve).not.toBeNull();
    expect(o.growth.length).toBe(30);
    expect(o.growth.at(-1)).toMatchObject({ users: 1, companies: 1 });
  });

  it("counts seeded sample invoices apart from real ones", async () => {
    const u = await findOrCreateUser(db, "sampler@x.test");
    const biz = await createWorkspace(db, { userId: u.id, email: u.email, name: "Sampler", wallet: { address: Keypair.generate().publicKey.toBase58(), label: "Main" } });
    await seedSampleData(db, biz);
    const o = await overviewStats(db, "all");
    expect(o.tiles.invoices.total).toBe(2);
    expect(o.tiles.sampleInvoices).toBe(2);
    expect(o.funnel.inCompany).toBe(2);
    expect(o.funnel.invoiced).toBe(1); // sample invoices alone aren't activation
  });

  it("writes and lists audit rows", async () => {
    await audit(db, { adminEmail: "boss@payfix.test", action: "user.view", targetType: "user", targetId: "usr_1" });
    await audit(db, { adminEmail: "boss@payfix.test", action: "export", targetType: "export", data: { kind: "users" } });
    const all = await listAudit(db, {});
    expect(all.map((a) => a.action)).toEqual(["export", "user.view"]);
    expect(await listAudit(db, { targetType: "user", targetId: "usr_1" })).toHaveLength(1);
  });
});

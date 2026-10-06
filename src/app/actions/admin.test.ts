import { createHash } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Keypair } from "@solana/web3.js";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";

// The real admin server actions, signed in as an admin through a cookie jar the test controls.
const state = vi.hoisted(() => ({ db: null as unknown as Db, cookies: new Map<string, string>() }));
vi.stubEnv("ADMIN_EMAILS", "boss@payfix.test");

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw Object.assign(new Error(`redirect ${to}`), { digest: `NEXT_REDIRECT;${to}` });
  },
  notFound: () => {
    throw Object.assign(new Error("not found"), { digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (state.cookies.has(name) ? { name, value: state.cookies.get(name)! } : undefined),
    set: (name: string, value: string) => state.cookies.set(name, value),
  }),
  headers: async () => new Headers(),
}));
vi.mock("@/lib/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/client")>()),
  getDb: async () => state.db,
}));

const { openPglite } = await import("@/lib/db/client");
const { businesses, sessions, users } = await import("@/lib/db/schema");
const { newId, newToken } = await import("@/lib/ids");
const { createWorkspace, findOrCreateUser } = await import("@/lib/server/workspaces");
const actions = await import("./admin");

const wallet = () => ({ address: Keypair.generate().publicKey.toBase58(), label: "Main" });

async function signInAsAdmin(email = "boss@payfix.test") {
  const token = newToken();
  await state.db.insert(sessions).values({
    id: newId("ses"),
    kind: "admin",
    subjectId: email,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 3600_000),
  });
  state.cookies.clear();
  state.cookies.set("pf_a", token);
}

describe("admin delete actions", () => {
  let a: string;
  let b: string;
  let shared: string;

  beforeAll(async () => {
    state.db = await openPglite();
    const u = await findOrCreateUser(state.db, "test@co.test");
    a = await createWorkspace(state.db, { userId: u.id, email: u.email, name: "Test Co A", wallet: wallet() });
    b = await createWorkspace(state.db, { userId: u.id, email: u.email, name: "Test Co B", wallet: wallet() });
    shared = await createWorkspace(state.db, { userId: u.id, email: u.email, name: "Shared", wallet: wallet() });
  });

  it("is a 404 for anyone who isn't an admin", async () => {
    state.cookies.clear();
    await expect(actions.deleteCompanyAction(a, "x", "Test Co A")).rejects.toThrow("not found");
    await expect(actions.bulkDeleteAction("companies", [a], "x", "DELETE")).rejects.toThrow("not found");
  });

  it("deletes one company only when its exact name is typed", async () => {
    await signInAsAdmin();
    expect(await actions.deleteCompanyAction(a, "cleanup", "test co a")).toEqual({ ok: false, error: expect.stringContaining("Test Co A") });
    expect(await state.db.select().from(businesses).where(eq(businesses.id, a))).toHaveLength(1);
    expect(await actions.deleteCompanyAction(a, "cleanup", " Test Co A ")).toEqual({ ok: true });
    expect(await state.db.select().from(businesses).where(eq(businesses.id, a))).toHaveLength(0);
  });

  it("deletes many after DELETE is typed, and reports what it skipped", async () => {
    await signInAsAdmin();
    expect(await actions.bulkDeleteAction("companies", [b, shared], "cleanup", "delete")).toEqual({ ok: false, error: expect.stringContaining("DELETE") });
    const res = await actions.bulkDeleteAction("companies", [b, "biz_gone"], "cleanup", "DELETE");
    expect(res).toMatchObject({ ok: true, deleted: 1, skipped: [{ id: "biz_gone", error: expect.stringMatching(/no longer exists/) }] });
  });

  it("deletes an account only when its exact email is typed", async () => {
    await signInAsAdmin();
    const [u] = await state.db.select().from(users).where(eq(users.email, "test@co.test"));
    expect(await actions.deleteUserAction(u.id, "cleanup", "someone@else.test")).toMatchObject({ ok: false });
    expect(await actions.deleteUserAction(u.id, "cleanup", "TEST@co.test")).toEqual({ ok: true });
    expect(await state.db.select().from(businesses).where(eq(businesses.id, shared))).toHaveLength(0); // it was the only member
  });
});

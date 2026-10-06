import { createHash } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Keypair } from "@solana/web3.js";
import { eq } from "drizzle-orm";
import { openPglite, type Db } from "@/lib/db/client";
import { customers, invoices, memberships, sessions, users } from "@/lib/db/schema";
import { newId, newToken } from "@/lib/ids";
import { addMember, createWorkspace, findOrCreateUser, listMembers, seedSampleData } from "@/lib/server/workspaces";
import { addBlock, suspendCompany } from "@/lib/server/admin/moderation";

// The real server actions, with Next's request APIs replaced by a cookie jar the test controls.
const state = vi.hoisted(() => ({ db: null as unknown as Db, cookies: new Map<string, string>() }));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: () => {} }));
vi.mock("next/navigation", () => ({
  // Like Next's, the thrown error carries a NEXT_ digest, so run() lets it through.
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

const actions = await import("./business");

async function signInAs(userId: string, businessId: string) {
  const token = newToken();
  await state.db.insert(sessions).values({
    id: newId("ses"),
    kind: "business",
    subjectId: userId,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  state.cookies.clear();
  state.cookies.set("pf_b", token);
  state.cookies.set("pf_ws", businessId);
}

describe("server actions enforce roles", () => {
  let bizId: string;
  let ownerId: string;
  let editorId: string;
  let viewerId: string;
  let customerId: string;
  let invoiceId: string;

  beforeAll(async () => {
    state.db = await openPglite();
    const owner = await findOrCreateUser(state.db, "owner@roles.test");
    ownerId = owner.id;
    bizId = await createWorkspace(state.db, {
      userId: owner.id,
      email: owner.email,
      name: "Roles Co",
      wallet: { address: Keypair.generate().publicKey.toBase58(), label: "Main" },
    });
    await seedSampleData(state.db, bizId);
    await addMember(state.db, { businessId: bizId, email: "editor@roles.test", role: "editor", invitedBy: owner.email });
    await addMember(state.db, { businessId: bizId, email: "viewer@roles.test", role: "viewer", invitedBy: owner.email });
    const members = await listMembers(state.db, bizId);
    editorId = members.find((m) => m.email === "editor@roles.test")!.userId;
    viewerId = members.find((m) => m.email === "viewer@roles.test")!.userId;
    const [inv] = await state.db.select().from(invoices).where(eq(invoices.businessId, bizId)).limit(1);
    invoiceId = inv.id;
    customerId = inv.customerId;
  });

  // Every action an editor may take, called with arguments that would otherwise reach the database.
  const editorActions = () => ({
    createCustomerAction: () => actions.createCustomerAction({ name: "Sneaky", email: "sneaky@roles.test" }),
    createInvoiceAction: () => actions.createInvoiceAction({ customerId, title: "Sneaky", amount: "10", dueDate: "2026-12-31" }),
    applyCreditAction: () => actions.applyCreditAction(invoiceId),
    sendLinkAction: () => actions.sendLinkAction("case_x"),
    assignCustomerAction: () => actions.assignCustomerAction("case_x", customerId),
    approveAction: () => actions.approveAction("case_x", "prop_x"),
    requestChangesAction: () => actions.requestChangesAction("case_x", "prop_x", "no"),
    executeAction: () => actions.executeAction("case_x"),
    prepareRefundAction: () => actions.prepareRefundAction("ref_x"),
    submitRefundAction: () => actions.submitRefundAction("att_x", "AAAA"),
    demoSignRefundAction: () => actions.demoSignRefundAction("ref_x"),
  });

  const ownerActions = () => ({
    resetWorkspaceAction: () => actions.resetWorkspaceAction(),
    addMemberAction: () => actions.addMemberAction({ email: "sneaky@roles.test", role: "owner" }),
    setMemberRoleAction: () => actions.setMemberRoleAction(viewerId, "owner"),
    removeMemberAction: () => actions.removeMemberAction(ownerId),
    addWalletAction: () => actions.addWalletAction({ address: Keypair.generate().publicKey.toBase58(), label: "Sneaky", makeActive: true }),
    setActiveWalletAction: () => actions.setActiveWalletAction(Keypair.generate().publicKey.toBase58()),
    removeWalletAction: () => actions.removeWalletAction(Keypair.generate().publicKey.toBase58()),
  });

  it("rejects every editor and owner action from a viewer, and writes nothing", async () => {
    await signInAs(viewerId, bizId);
    const before = await Promise.all([
      state.db.select().from(customers).where(eq(customers.businessId, bizId)),
      state.db.select().from(invoices).where(eq(invoices.businessId, bizId)),
      state.db.select().from(memberships).where(eq(memberships.businessId, bizId)),
    ]);
    for (const [name, call] of Object.entries({ ...editorActions(), ...ownerActions() })) {
      expect(await call(), name).toEqual({ ok: false, error: expect.stringMatching(/Your role \(Viewer\)/) });
    }
    const after = await Promise.all([
      state.db.select().from(customers).where(eq(customers.businessId, bizId)),
      state.db.select().from(invoices).where(eq(invoices.businessId, bizId)),
      state.db.select().from(memberships).where(eq(memberships.businessId, bizId)),
    ]);
    expect(after).toEqual(before);
  });

  it("rejects owner actions from an editor", async () => {
    await signInAs(editorId, bizId);
    for (const [name, call] of Object.entries(ownerActions())) {
      expect(await call(), name).toEqual({ ok: false, error: expect.stringMatching(/Your role \(Editor\)/) });
    }
  });

  it("lets an editor through, so the rejections above come from the role check", async () => {
    await signInAs(editorId, bizId);
    expect(await actions.createCustomerAction({ name: "Allowed", email: "allowed@roles.test" })).toMatchObject({ ok: true });
  });
});

describe("server actions respect suspensions and blocks", () => {
  let mainBiz: string;
  let otherBiz: string;
  let userId: string;

  beforeAll(async () => {
    state.db = await openPglite();
    const user = await findOrCreateUser(state.db, "member@two.test");
    userId = user.id;
    const wallet = () => ({ address: Keypair.generate().publicKey.toBase58(), label: "Main" });
    mainBiz = await createWorkspace(state.db, { userId, email: user.email, name: "Flagged Co", wallet: wallet() });
    otherBiz = await createWorkspace(state.db, { userId, email: user.email, name: "Fine Co", wallet: wallet() });
  });

  it("sends members of a suspended company to /suspended, and leaves their other company working", async () => {
    await suspendCompany(state.db, "boss@payfix.test", mainBiz, "Fraud report");
    await signInAs(userId, mainBiz);
    await expect(actions.createCustomerAction({ name: "X", email: "x@two.test" })).rejects.toThrow("redirect /suspended");
    expect(await state.db.select().from(customers).where(eq(customers.businessId, mainBiz))).toHaveLength(0);
    await signInAs(userId, otherBiz);
    expect(await actions.createCustomerAction({ name: "Y", email: "y@two.test" })).toMatchObject({ ok: true });
  });

  it("treats a suspended user as signed out", async () => {
    await signInAs(userId, otherBiz);
    await state.db.update(users).set({ suspendedAt: new Date(), suspendedReason: "test" }).where(eq(users.id, userId));
    await expect(actions.createCustomerAction({ name: "Z", email: "z@two.test" })).rejects.toThrow("redirect /login");
    await state.db.update(users).set({ suspendedAt: null }).where(eq(users.id, userId));
  });

  it("refuses the faucet for a blocked wallet", async () => {
    const wallet = Keypair.generate().publicKey.toBase58();
    await addBlock(state.db, "boss@payfix.test", { kind: "faucet", target: wallet, reason: "Draining the treasury" });
    expect(await actions.faucetAction(wallet)).toEqual({ ok: false, error: expect.stringMatching(/blocked/i) });
  });
});

import { beforeAll, describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { eq, inArray } from "drizzle-orm";
import { openPglite, type Db } from "@/lib/db/client";
import {
  businesses,
  businessWallets,
  chainSignatures,
  customers,
  events,
  feedbackResponses,
  invoices,
  memberships,
  postings,
  refunds,
  sessions,
  transfers,
  users,
} from "@/lib/db/schema";
import { newId, newToken } from "@/lib/ids";
import { listAudit } from "./admin/audit";
import { confirmMatches, deleteCompany, deleteFeedback, deleteUser, userDeletionPlan } from "./admin/deletion";
import { saveFeedback } from "./feedback";
import { runDemoScenario } from "./test-scenario";
import { addMember, createWorkspace, findOrCreateUser, seedSampleData } from "./workspaces";

const admin = "boss@payfix.test";
const wallet = () => ({ address: Keypair.generate().publicKey.toBase58(), label: "Main" });
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any table, any condition: a test-only row counter
const rows = async (db: Db, table: any, where: any) => (await db.select().from(table).where(where)).length;

describe("admin deletion", () => {
  let db: Db;
  beforeAll(async () => {
    db = await openPglite();
  });

  it("confirms only on an exact, trimmed match", () => {
    expect(confirmMatches("Lumen Studio", " Lumen Studio ")).toBe(true);
    expect(confirmMatches("Lumen Studio", "lumen studio")).toBe(false);
    expect(confirmMatches("owner@x.test", "OWNER@x.test")).toBe(true); // emails ignore case
    expect(confirmMatches("Lumen Studio", "")).toBe(false);
  });

  it("deletes a company and everything in it, and nothing of anyone else's", async () => {
    const s = await runDemoScenario(db, { ownerEmail: "owner@lumen.test" });
    const other = await findOrCreateUser(db, "other@else.test");
    const otherBiz = await createWorkspace(db, { userId: other.id, email: other.email, name: "Other Co", wallet: wallet() });
    await seedSampleData(db, otherBiz);
    await addMember(db, { businessId: s.businessId, email: "other@else.test", role: "viewer", invitedBy: "owner@lumen.test" });

    await expect(deleteCompany(db, admin, s.businessId, "  ")).rejects.toThrow(/reason/i);
    await deleteCompany(db, admin, s.businessId, "Test company");

    for (const table of [businesses]) expect(await rows(db, table, eq(businesses.id, s.businessId))).toBe(0);
    for (const [table, col] of [
      [customers, customers.businessId],
      [invoices, invoices.businessId],
      [transfers, transfers.businessId],
      [postings, postings.businessId],
      [refunds, refunds.businessId],
      [events, events.businessId],
      [memberships, memberships.businessId],
      [businessWallets, businessWallets.businessId],
      [chainSignatures, chainSignatures.businessId],
    ] as const)
      expect(await rows(db, table, eq(col, s.businessId)), String(col.name)).toBe(0);
    // Members keep their accounts; the other company is untouched.
    expect(await rows(db, users, inArray(users.id, [s.ownerId, other.id]))).toBe(2);
    expect(await rows(db, invoices, eq(invoices.businessId, otherBiz))).toBe(2);
    expect(await rows(db, memberships, eq(memberships.userId, other.id))).toBe(1);

    const [row] = await listAudit(db, { targetType: "business", targetId: s.businessId });
    expect(row).toMatchObject({ action: "business.delete", reason: "Test company", data: { name: "Lumen Studio" } });
  });

  it("refuses to delete a company while a refund is in flight", async () => {
    const u = await findOrCreateUser(db, "flight@x.test");
    const biz = await createWorkspace(db, { userId: u.id, email: u.email, name: "In Flight", wallet: wallet() });
    await db.insert(refunds).values({
      id: newId("rf"),
      businessId: biz,
      caseId: await (async () => {
        const { cases } = await import("@/lib/db/schema");
        const id = newId("case");
        await db.insert(cases).values({ id, businessId: biz, kind: "unmatched" });
        return id;
      })(),
      proposalId: await (async () => {
        const { cases, proposals } = await import("@/lib/db/schema");
        const [c] = await db.select().from(cases).where(eq(cases.businessId, biz));
        const id = newId("prop");
        await db.insert(proposals).values({ id, caseId: c.id, version: 1, authorKind: "business", authorId: "x", lines: [], available: 0n, hash: "h" });
        return id;
      })(),
      amount: 1n,
      destinationOwner: "x",
      destinationTokenAccount: "y",
      status: "submitted",
    });
    await expect(deleteCompany(db, admin, biz, "cleanup")).rejects.toThrow(/refund/i);
    expect(await rows(db, businesses, eq(businesses.id, biz))).toBe(1);
  });

  it("deletes a user with the companies only they belong to", async () => {
    const u = await findOrCreateUser(db, "solo@x.test");
    const solo = await createWorkspace(db, { userId: u.id, email: u.email, name: "Solo Co", wallet: wallet() });
    await seedSampleData(db, solo);
    const shared = await createWorkspace(db, { userId: (await findOrCreateUser(db, "lead@x.test")).id, email: "lead@x.test", name: "Shared Co", wallet: wallet() });
    await addMember(db, { businessId: shared, email: "solo@x.test", role: "editor", invitedBy: "lead@x.test" });
    await db.insert(sessions).values({ id: newId("ses"), kind: "business", subjectId: u.id, tokenHash: newToken(), expiresAt: new Date(Date.now() + 3600_000) });
    await saveFeedback(db, { completed: "unaided", ease: 5, nps: 10, attachAccount: true }, { userId: u.id, locale: "en", ip: "9.9.9.9" });

    expect(await userDeletionPlan(db, u.id)).toEqual({ deletesCompanies: [{ id: solo, name: "Solo Co" }], blockedBy: [] });
    await deleteUser(db, admin, u.id, "Test account");

    expect(await rows(db, users, eq(users.id, u.id))).toBe(0);
    expect(await rows(db, businesses, eq(businesses.id, solo))).toBe(0);
    expect(await rows(db, businesses, eq(businesses.id, shared))).toBe(1);
    expect(await rows(db, memberships, eq(memberships.userId, u.id))).toBe(0);
    expect(await rows(db, sessions, eq(sessions.subjectId, u.id))).toBe(0);
    const [fb] = await db.select().from(feedbackResponses).where(eq(feedbackResponses.ease, 5));
    expect(fb.userId).toBeNull(); // the answers stay, now anonymous
    const [row] = await listAudit(db, { targetType: "user", targetId: u.id });
    expect(row).toMatchObject({ action: "user.delete", data: { email: "solo@x.test", companies: ["Solo Co"] } });
  });

  it("refuses to delete the only owner of a company other people still use", async () => {
    const lead = await findOrCreateUser(db, "lead@x.test");
    const [shared] = await db.select().from(businesses).where(eq(businesses.name, "Shared Co"));
    await addMember(db, { businessId: shared.id, email: "teammate@x.test", role: "editor", invitedBy: "lead@x.test" });
    const plan = await userDeletionPlan(db, lead.id);
    expect(plan.blockedBy).toEqual([{ id: expect.any(String), name: "Shared Co" }]);
    await expect(deleteUser(db, admin, lead.id, "cleanup")).rejects.toThrow(/Shared Co/);
    expect(await rows(db, users, eq(users.id, lead.id))).toBe(1);
  });

  it("deletes a feedback response once, and audits it without its answers", async () => {
    await saveFeedback(db, { completed: "no", ease: 1, nps: 0, answers: { blockers: "secret opinion" } }, { userId: null, locale: "en", ip: "8.8.8.8" });
    const [fb] = await db.select().from(feedbackResponses).where(eq(feedbackResponses.nps, 0));
    expect(await deleteFeedback(db, admin, fb.id)).toBe(true);
    expect(await deleteFeedback(db, admin, fb.id)).toBe(false);
    expect(await rows(db, feedbackResponses, eq(feedbackResponses.id, fb.id))).toBe(0);
    const audit = await listAudit(db, { targetType: "feedback", targetId: fb.id });
    expect(audit.map((a) => a.action)).toEqual(["feedback.delete"]);
    expect(JSON.stringify(audit)).not.toContain("secret opinion");
  });

  it("reports a missing target instead of pretending", async () => {
    await expect(deleteCompany(db, admin, "biz_missing", "x")).rejects.toThrow(/no longer exists/);
    await expect(deleteUser(db, admin, "usr_missing", "x")).rejects.toThrow(/no longer exists/);
  });
});

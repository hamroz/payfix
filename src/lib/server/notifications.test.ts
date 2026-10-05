import { beforeAll, describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { and, eq } from "drizzle-orm";
import { openPglite, type Db } from "@/lib/db/client";
import { events, notificationReads } from "@/lib/db/schema";
import { toUnits } from "@/lib/money";
import { logEvent } from "./journal";
import { SimChain } from "./sim-chain";
import { addMember, clearWorkspaceData, createWorkspace, findOrCreateUser, listMembers, seedSampleData } from "./workspaces";

const $ = (s: string) => toUnits(s);

async function company(db: Db, email: string, name: string) {
  const user = await findOrCreateUser(db, email);
  const wallet = Keypair.generate();
  const businessId = await createWorkspace(db, { userId: user.id, email: user.email, name, wallet: { address: wallet.publicKey.toBase58(), label: "Main" } });
  return { user, wallet, businessId };
}

describe("notifications", () => {
  let db: Db;
  let chain: SimChain;
  const payer = Keypair.generate();
  let a: Awaited<ReturnType<typeof company>>;
  let b: Awaited<ReturnType<typeof company>>;
  let editorId: string;

  beforeAll(async () => {
    db = await openPglite();
    const { env } = await import("@/lib/env");
    chain = new SimChain(env().PAYFIX_MINT!);
    chain.fund(payer.publicKey.toBase58(), $("100000"));
    a = await company(db, "owner@lumen.test", "Lumen Studio");
    b = await company(db, "someone@else.test", "Other Co");
    await seedSampleData(db, a.businessId);
    await addMember(db, { businessId: a.businessId, email: "editor@lumen.test", role: "editor", invitedBy: a.user.email });
    editorId = (await listMembers(db, a.businessId)).find((m) => m.email === "editor@lumen.test")!.userId;
  });

  it("logEvent dedupes by key", async () => {
    const e = { businessId: a.businessId, actor: "system" as const, type: "invoice.overdue", message: "x", dedupeKey: "x:1" };
    expect(await logEvent(db, e)).toBe(true);
    expect(await logEvent(db, e)).toBe(false);
    const rows = await db.select().from(events).where(and(eq(events.businessId, a.businessId), eq(events.dedupeKey, "x:1")));
    expect(rows).toHaveLength(1);
  });

  it("records who caused an event", async () => {
    await logEvent(db, { businessId: a.businessId, actor: "business", type: "invoice.created", message: "by editor", actorUserId: editorId });
    const [row] = await db.select().from(events).where(eq(events.message, "by editor"));
    expect(row.actorUserId).toBe(editorId);
  });
});

describe("workspace reset with notification state", () => {
  it("reset clears read state", async () => {
    const db = await openPglite();
    const a = await company(db, "reset@lumen.test", "Reset Co");
    await seedSampleData(db, a.businessId);
    const [ev] = await db.select().from(events).where(eq(events.businessId, a.businessId)).limit(1);
    await db.insert(notificationReads).values({ userId: a.user.id, eventId: ev.id });
    await expect(clearWorkspaceData(db, a.businessId)).resolves.toBeUndefined();
    expect(await db.select().from(notificationReads)).toHaveLength(0);
  });
});

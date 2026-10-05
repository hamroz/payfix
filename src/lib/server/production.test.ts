import bs58 from "bs58";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/client";

// This file runs PayFix as production does: devnet, demo mode off. Set before env() is first read.
vi.stubEnv("SOLANA_CLUSTER", "devnet");
vi.stubEnv("DEMO_MODE", "false");
vi.stubEnv("PAYFIX_MINT", "Bqztnad4TJGihP3S7KCZvLyFWqjvZvebBS1JkTXwArTr");
vi.stubEnv("RESEND_API_KEY", "re_test");

const { openPglite } = await import("@/lib/db/client");
const { outbox } = await import("@/lib/db/schema");
const { walletOwnershipMessage } = await import("@/lib/solana/proof");
const { consume, rateKey, MINUTE } = await import("./ratelimit");
const { assertWalletOwnership } = await import("./wallets");
const { deliverOutbox, emailFailed, queueEmail } = await import("./email");

function signedProof(kp: Keypair, issuedAt = new Date().toISOString(), address = kp.publicKey.toBase58()) {
  const message = walletOwnershipMessage({ address, issuedAt });
  return { message, signature: bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey)) };
}

describe("production safeguards", () => {
  let db: Db;
  beforeAll(async () => {
    db = await openPglite();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("limits each key independently within its window", async () => {
    const limit = (subject: string) => ({ key: rateKey("test", subject), max: 2, windowMs: 10 * MINUTE, message: `slow down ${subject}` });
    await consume(db, [limit("a@x.test")]);
    await consume(db, [limit("A@X.test")]); // keys are case-insensitive
    await expect(consume(db, [limit("a@x.test")])).rejects.toThrow("slow down a@x.test");
    await consume(db, [limit("b@x.test")]);
  });

  it("requires a fresh signature from the wallet being added", () => {
    const kp = Keypair.generate();
    const other = Keypair.generate();
    const address = kp.publicKey.toBase58();
    expect(() => assertWalletOwnership(address, undefined)).toThrow(/Connect the wallet/);
    expect(() => assertWalletOwnership(address, signedProof(kp))).not.toThrow();
    // Someone else's signature over this address, a proof for a different address, and an old proof all fail.
    expect(() => assertWalletOwnership(address, signedProof(other, undefined, address))).toThrow(/doesn’t match/);
    expect(() => assertWalletOwnership(address, signedProof(other))).toThrow(/different wallet/);
    expect(() => assertWalletOwnership(address, signedProof(kp, new Date(Date.now() - 20 * MINUTE).toISOString()))).toThrow(/expired/);
  });

  it("delivers queued email, then erases the code and link", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const id = await queueEmail(db, { to: "c@x.test", subject: "123456 is your PayFix code", body: "Enter 123456", code: "123456", link: "https://x/r/secret" });
    let [row] = await db.select().from(outbox).where(eq(outbox.id, id));
    expect(row.status).toBe("pending");
    await deliverOutbox(db);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ to: ["c@x.test"], subject: "123456 is your PayFix code" });
    [row] = await db.select().from(outbox).where(eq(outbox.id, id));
    expect(row).toMatchObject({ status: "sent", code: null, link: null });
    expect(await emailFailed(db, id)).toBe(false);
  });

  it("reports a failed send and retries it later", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    const id = await queueEmail(db, { to: "d@x.test", subject: "s", body: "b" });
    await deliverOutbox(db);
    expect(await emailFailed(db, id)).toBe(true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await deliverOutbox(db);
    const [row] = await db.select().from(outbox).where(eq(outbox.id, id));
    expect(row).toMatchObject({ status: "sent", attempts: 2 });
  });
});

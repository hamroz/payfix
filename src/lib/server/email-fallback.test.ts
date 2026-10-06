import { beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";

// Production build, no email provider, APP_URL left at its localhost default. Set before env() is read.
vi.stubEnv("NODE_ENV", "production");
vi.stubEnv("SOLANA_CLUSTER", "devnet");
vi.stubEnv("DEMO_MODE", "false");
vi.stubEnv("PAYFIX_MINT", "Bqztnad4TJGihP3S7KCZvLyFWqjvZvebBS1JkTXwArTr");
vi.stubEnv("RESEND_API_KEY", "");
vi.stubEnv("APP_URL", "http://localhost:3000");
vi.stubEnv("ADMIN_EMAILS", "boss@payfix.test");

const { openPglite } = await import("@/lib/db/client");
const { outbox } = await import("@/lib/db/schema");
const { deliverOutbox, queueEmail } = await import("./email");

describe("email without a provider in a production build", () => {
  let db: Db;
  beforeAll(async () => {
    db = await openPglite();
  });

  it("fails ordinary mail instead of printing codes to the log", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const id = await queueEmail(db, { to: "someone@x.test", subject: "123456 is your PayFix code", body: "Enter 123456", code: "123456" });
    await deliverOutbox(db);
    const [m] = await db.select().from(outbox).where(eq(outbox.id, id));
    expect(m.status).toBe("failed");
    expect(log.mock.calls.flat().join(" ")).not.toContain("123456");
    log.mockRestore();
  });

  it("prints an admin code on a localhost deployment, so local admins can sign in", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const id = await queueEmail(db, { to: "boss@payfix.test", subject: "654321 is your PayFix code", body: "Enter 654321", code: "654321" }, { deliver: "always" });
    await deliverOutbox(db);
    const [m] = await db.select().from(outbox).where(eq(outbox.id, id));
    expect(m.status).toBe("sent");
    expect(log.mock.calls.flat().join(" ")).toContain("654321");
    log.mockRestore();
  });
});

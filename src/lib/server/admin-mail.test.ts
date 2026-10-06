import { beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";

// A deployed production build with admins but no email provider. Set before env() is read.
vi.stubEnv("NODE_ENV", "production");
vi.stubEnv("SOLANA_CLUSTER", "devnet");
vi.stubEnv("DEMO_MODE", "false");
vi.stubEnv("PAYFIX_MINT", "Bqztnad4TJGihP3S7KCZvLyFWqjvZvebBS1JkTXwArTr");
vi.stubEnv("RESEND_API_KEY", "");
vi.stubEnv("APP_URL", "https://payfix.example");
vi.stubEnv("ADMIN_EMAILS", "boss@payfix.test");

const { openPglite } = await import("@/lib/db/client");
const { otpCodes } = await import("@/lib/db/schema");
const { requestAdminCode } = await import("./admin/access");

describe("admin sign-in without a way to send email", () => {
  let db: Db;
  beforeAll(async () => {
    db = await openPglite();
  });

  it("refuses every address the same way, before creating any code", async () => {
    await expect(requestAdminCode(db, "intruder@payfix.test")).rejects.toThrow(/real email/i);
    await expect(requestAdminCode(db, "boss@payfix.test")).rejects.toThrow(/real email/i);
    expect(await db.select().from(otpCodes).where(eq(otpCodes.purpose, "admin"))).toHaveLength(0);
  });
});

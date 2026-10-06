import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { openPglite, type Db } from "@/lib/db/client";
import { feedbackResponses } from "@/lib/db/schema";
import { feedbackSummary, listFeedback, saveFeedback } from "./feedback";
import { runDemoScenario } from "./test-scenario";

const valid = {
  completed: "unaided",
  minutes: 12,
  ease: 4,
  nps: 9,
  answers: { happened: "  $60 went to B and $40 came back. I decided.  ", hesitated: "" },
  about: "agency, 4 people",
  device: "phone",
  quoteOk: true,
  attachAccount: false,
  cohort: "Oct-Walkthroughs",
};

describe("tester feedback", () => {
  let db: Db;
  let userId: string;
  let ip = 0;
  const ctx = (userId: string | null = null) => ({ userId, locale: "en" as const, ip: `10.0.0.${++ip}` });

  beforeAll(async () => {
    db = await openPglite();
    userId = (await runDemoScenario(db)).ownerId;
  });

  it("stores a response anonymously unless the tester attaches their account", async () => {
    expect(await saveFeedback(db, valid, ctx(userId))).toEqual({ saved: true });
    expect(await saveFeedback(db, { ...valid, attachAccount: true }, ctx(userId))).toEqual({ saved: true });
    expect(await saveFeedback(db, { ...valid, attachAccount: true }, ctx(null))).toEqual({ saved: true });
    const rows = await db.select().from(feedbackResponses);
    expect(rows.map((r) => r.userId)).toEqual([null, userId, null]);
    expect(rows[0]).toMatchObject({ cohort: "oct-walkthroughs", completed: "unaided", minutes: 12, ease: 4, nps: 9, device: "phone", quoteOk: true, locale: "en" });
    expect(rows[0].answers).toEqual({ happened: "$60 went to B and $40 came back. I decided." });
  });

  it("drops honeypot submissions without storing them", async () => {
    const before = (await db.select().from(feedbackResponses)).length;
    expect(await saveFeedback(db, { ...valid, website: "http://spam.example" }, ctx())).toEqual({ saved: false });
    expect(await db.select().from(feedbackResponses)).toHaveLength(before);
  });

  it("rejects out-of-range scores and overlong answers", async () => {
    await expect(saveFeedback(db, { ...valid, nps: 11 }, ctx())).rejects.toThrow(/check your answers/i);
    await expect(saveFeedback(db, { ...valid, minutes: -1 }, ctx())).rejects.toThrow(/check your answers/i);
    await expect(saveFeedback(db, { ...valid, answers: { blockers: "x".repeat(2001) } }, ctx())).rejects.toThrow(/check your answers/i);
    await expect(saveFeedback(db, "nonsense", ctx())).rejects.toThrow(/check your answers/i);
    expect(await saveFeedback(db, { ...valid, answers: { blockers: "😀".repeat(1000) } }, ctx())).toEqual({ saved: true });
    expect(await saveFeedback(db, { ...valid, cohort: "../../etc" }, ctx())).toEqual({ saved: true });
    const [last] = (await db.select().from(feedbackResponses)).slice(-1);
    expect(last.cohort).toBeNull();
  });

  it("limits responses from one network", async () => {
    const same = { userId: null, locale: "en" as const, ip: "10.9.9.9" };
    for (let i = 0; i < 5; i++) await saveFeedback(db, valid, same);
    await expect(saveFeedback(db, valid, same)).rejects.toThrow(/too many/i);
  });

  it("summarises scores with sample sizes and NPS", async () => {
    const fresh = await openPglite();
    for (const nps of [10, 9, 8, 3]) await saveFeedback(fresh, { ...valid, nps, ease: nps > 5 ? 5 : 2, completed: nps === 3 ? "no" : "unaided" }, ctx());
    const s = await feedbackSummary(fresh, { range: "all" });
    expect(s.n).toBe(4);
    expect(s.nps).toEqual({ score: 25, promoters: 2, passives: 1, detractors: 1 });
    expect(s.completed).toEqual({ unaided: 3, aided: 0, no: 1 });
    expect(s.avgEase).toBe(4.3);
    expect(s.medianMinutes).toBe(12);
    expect(s.easeDist).toEqual([0, 1, 0, 0, 3]);
    expect(s.npsDist[10]).toBe(1);
    expect(s.cohorts).toEqual(["oct-walkthroughs"]);
    expect((await feedbackSummary(fresh, { range: "all", cohort: "other" })).n).toBe(0);
  });

  it("shows how far an attached account got", async () => {
    const rows = await listFeedback(db, { range: "all" });
    const attached = rows.find((r) => r.account);
    expect(attached?.account).toEqual({ email: "owner@lumen.test", furthest: "refunded" });
    expect(rows.filter((r) => !r.account).length).toBeGreaterThan(0);
    expect(rows[0].createdAt >= rows.at(-1)!.createdAt).toBe(true);
    const [row] = await db.select().from(feedbackResponses).where(eq(feedbackResponses.userId, userId));
    expect(row).toBeDefined();
  });
});

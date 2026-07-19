import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../index";
import { dateKey, getToday, incrementToday, computeStreak } from "./activity";

describe("activity queries", () => {
  beforeEach(async () => {
    await db.dailyActivity.clear();
  });

  it("starts at zero for an untouched day", async () => {
    const today = await getToday("it");
    expect(today.reviewsCount).toBe(0);
    expect(today.date).toBe(dateKey());
    expect(today.lang).toBe("it");
  });

  it("increments are additive and idempotent-per-call", async () => {
    await incrementToday("it", { reviewsCount: 3 });
    await incrementToday("it", { reviewsCount: 2, newCardsIntroduced: 1 });
    const today = await getToday("it");
    expect(today.reviewsCount).toBe(5);
    expect(today.newCardsIntroduced).toBe(1);
  });

  it("tracks each language's activity independently — the reason this got a lang dimension", async () => {
    await incrementToday("it", { reviewsCount: 5 });
    await incrementToday("fr", { reviewsCount: 2 });
    expect((await getToday("it")).reviewsCount).toBe(5);
    expect((await getToday("fr")).reviewsCount).toBe(2);
  });

  it("streak is 0 with no activity", async () => {
    expect(await computeStreak("it")).toBe(0);
  });

  it("streak counts today even without prior days", async () => {
    await incrementToday("it", { reviewsCount: 1 });
    expect(await computeStreak("it")).toBe(1);
  });

  it("streak breaks on a gap day", async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    await db.dailyActivity.put({
      date: dateKey(twoDaysAgo),
      lang: "it",
      reviewsCount: 1,
      newCardsIntroduced: 0,
      lessonsCompleted: 0,
      journalEntriesCompleted: 0,
    });
    await incrementToday("it", { reviewsCount: 1 }); // today active, yesterday is the gap
    expect(await computeStreak("it")).toBe(1);
  });

  it("streaks are independent per language", async () => {
    await incrementToday("it", { reviewsCount: 1 });
    expect(await computeStreak("it")).toBe(1);
    expect(await computeStreak("fr")).toBe(0);
  });
});

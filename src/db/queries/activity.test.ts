import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../index";
import { dateKey, getToday, incrementToday, computeStreak } from "./activity";

describe("activity queries", () => {
  beforeEach(async () => {
    await db.dailyActivity.clear();
  });

  it("starts at zero for an untouched day", async () => {
    const today = await getToday();
    expect(today.reviewsCount).toBe(0);
    expect(today.date).toBe(dateKey());
  });

  it("increments are additive and idempotent-per-call", async () => {
    await incrementToday({ reviewsCount: 3 });
    await incrementToday({ reviewsCount: 2, newCardsIntroduced: 1 });
    const today = await getToday();
    expect(today.reviewsCount).toBe(5);
    expect(today.newCardsIntroduced).toBe(1);
  });

  it("streak is 0 with no activity", async () => {
    expect(await computeStreak()).toBe(0);
  });

  it("streak counts today even without prior days", async () => {
    await incrementToday({ reviewsCount: 1 });
    expect(await computeStreak()).toBe(1);
  });

  it("streak breaks on a gap day", async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    await db.dailyActivity.put({
      date: dateKey(twoDaysAgo),
      reviewsCount: 1,
      newCardsIntroduced: 0,
      lessonsCompleted: 0,
      journalEntriesCompleted: 0,
    });
    await incrementToday({ reviewsCount: 1 }); // today active, yesterday is the gap
    expect(await computeStreak()).toBe(1);
  });
});

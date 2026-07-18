import { describe, it, expect } from "vitest";
import { newCardState, gradeCard, previewIntervals } from "./fsrs";

describe("newCardState", () => {
  it("creates a fresh card in 'new' state with zero history", () => {
    const card = newCardState("it-vocab-0001", "it");
    expect(card.state).toBe("new");
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.reviewHistory).toEqual([]);
  });
});

describe("gradeCard", () => {
  it("appends a review history entry", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const card = newCardState("it-vocab-0001", "it", now);
    const graded = gradeCard(card, 3, now);
    expect(graded.reviewHistory).toHaveLength(1);
    expect(graded.reviewHistory[0]).toEqual({ at: now.toISOString(), grade: 3 });
  });

  it("moves a new card into learning or review state after a first review", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const card = newCardState("it-vocab-0001", "it", now);
    const graded = gradeCard(card, 3, now); // Good
    expect(["learning", "review"]).toContain(graded.state);
    expect(graded.reps).toBe(1);
  });

  it("produces a short first interval (native short-term scheduling, not a hand-rolled step ladder)", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const card = newCardState("it-vocab-0001", "it", now);
    const graded = gradeCard(card, 3, now); // Good
    const due = new Date(graded.due);
    const minutesUntilDue = (due.getTime() - now.getTime()) / 60_000;
    // First "Good" on a brand-new card should be minutes-to-low-single-digit-days out,
    // never immediately due and never a multi-week jump.
    expect(minutesUntilDue).toBeGreaterThan(0);
    expect(minutesUntilDue).toBeLessThan(60 * 24 * 3); // < 3 days
  });

  it("a lapse (Again on a review-state card) drops it into relearning, not back to 'new'", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    let card = newCardState("it-vocab-0001", "it", now);
    // Grade it "Easy" a few times to push it into review state with real stability.
    let t = now;
    for (let i = 0; i < 3; i++) {
      card = gradeCard(card, 4, t);
      t = new Date(new Date(card.due).getTime() + 1000); // review right at/after due
    }
    expect(card.state).toBe("review");
    const stabilityBeforeLapse = card.stability;

    const lapsed = gradeCard(card, 1, t); // Again
    expect(lapsed.state).toBe("relearning");
    expect(lapsed.lapses).toBe(1);
    // Relearning should recover using accumulated memory, not reset to a
    // from-scratch first-ever-review stability.
    expect(lapsed.stability).toBeLessThan(stabilityBeforeLapse);
  });

  it("relearning recovers faster than a truly new card (stability retained, not discarded)", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    let card = newCardState("it-vocab-relearn", "it", now);
    let t = now;
    for (let i = 0; i < 4; i++) {
      card = gradeCard(card, 4, t);
      t = new Date(new Date(card.due).getTime() + 1000);
    }
    const lapsed = gradeCard(card, 1, t);

    // Re-graded "Good" right after lapsing...
    const recovered = gradeCard(lapsed, 3, t);
    // ...vs. a brand-new card graded "Good" once.
    const freshCard = newCardState("it-vocab-fresh", "it", t);
    const freshGraded = gradeCard(freshCard, 3, t);

    expect(recovered.stability).toBeGreaterThan(freshGraded.stability);
  });

  it("all four grades on a fresh card produce a valid CardState (state/rating mapping round-trips)", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    for (const grade of [1, 2, 3, 4] as const) {
      const card = newCardState(`it-vocab-grade-${grade}`, "it", now);
      const graded = gradeCard(card, grade, now);
      expect(["new", "learning", "review", "relearning"]).toContain(graded.state);
      expect(new Date(graded.due).getTime()).toBeGreaterThanOrEqual(now.getTime());
    }
  });
});

describe("previewIntervals", () => {
  it("returns a due date for all four grades, ordered Again <= Hard <= Good <= Easy", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const card = newCardState("it-vocab-0001", "it", now);
    const preview = previewIntervals(card, now);
    expect(preview[1].getTime()).toBeLessThanOrEqual(preview[2].getTime());
    expect(preview[2].getTime()).toBeLessThanOrEqual(preview[3].getTime());
    expect(preview[3].getTime()).toBeLessThanOrEqual(preview[4].getTime());
  });

  it("is pure — does not mutate the input card or advance its own state", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const card = newCardState("it-vocab-0001", "it", now);
    const before = JSON.stringify(card);
    previewIntervals(card, now);
    expect(JSON.stringify(card)).toBe(before);
  });
});

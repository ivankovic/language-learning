import { describe, it, expect } from "vitest";
import { buildQueue } from "./queue";

describe("buildQueue", () => {
  it("sorts due cards ascending by due date", () => {
    const queue = buildQueue({
      dueCardStates: [
        { itemId: "b", due: "2026-01-02T00:00:00.000Z" },
        { itemId: "a", due: "2026-01-01T00:00:00.000Z" },
      ],
      candidateNewItemIds: [],
      newCardsIntroducedToday: 0,
      dailyNewCardLimit: 10,
    });
    expect(queue.map((q) => q.itemId)).toEqual(["a", "b"]);
  });

  it("respects the daily new-card limit", () => {
    const queue = buildQueue({
      dueCardStates: [],
      candidateNewItemIds: ["n1", "n2", "n3", "n4", "n5"],
      newCardsIntroducedToday: 8,
      dailyNewCardLimit: 10,
    });
    expect(queue).toHaveLength(2); // only 2 slots left (10 - 8)
    expect(queue.every((q) => q.kind === "new")).toBe(true);
  });

  it("introduces zero new cards once the daily limit is reached", () => {
    const queue = buildQueue({
      dueCardStates: [],
      candidateNewItemIds: ["n1", "n2"],
      newCardsIntroducedToday: 10,
      dailyNewCardLimit: 10,
    });
    expect(queue).toHaveLength(0);
  });

  it("pins priority items to the front of the due segment", () => {
    const queue = buildQueue({
      dueCardStates: [
        { itemId: "a", due: "2026-01-01T00:00:00.000Z" },
        { itemId: "flagged", due: "2026-01-05T00:00:00.000Z" },
        { itemId: "b", due: "2026-01-02T00:00:00.000Z" },
      ],
      candidateNewItemIds: [],
      newCardsIntroducedToday: 0,
      dailyNewCardLimit: 10,
      priorityItemIds: ["flagged"],
    });
    expect(queue[0].itemId).toBe("flagged");
  });

  it("due cards come before new cards, and limit caps the combined result", () => {
    const queue = buildQueue({
      dueCardStates: [{ itemId: "due1", due: "2026-01-01T00:00:00.000Z" }],
      candidateNewItemIds: ["new1", "new2", "new3"],
      newCardsIntroducedToday: 0,
      dailyNewCardLimit: 10,
      limit: 2,
    });
    expect(queue).toHaveLength(2);
    expect(queue[0]).toEqual({ itemId: "due1", kind: "due" });
    expect(queue[1]).toEqual({ itemId: "new1", kind: "new" });
  });
});

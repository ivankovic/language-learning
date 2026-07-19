import { describe, it, expect } from "vitest";
import { buildDeckQueue } from "./assemble";
import type { Deck } from "../types/content";

function deck(itemIds: string[]): Deck {
  return { id: "test-deck", lang: "it", title: "Test Deck", itemIds };
}

describe("buildDeckQueue", () => {
  it("includes every item in the deck exactly once", () => {
    const ids = ["a", "b", "c", "d", "e"];
    const queue = buildDeckQueue(deck(ids));
    expect(queue).toHaveLength(5);
    expect(new Set(queue.map((q) => q.itemId))).toEqual(new Set(ids));
  });

  it("is not always in the original deck order (shuffled) across repeated calls", () => {
    const ids = Array.from({ length: 30 }, (_, i) => `item-${i}`);
    const orders = new Set(
      Array.from({ length: 5 }, () => buildDeckQueue(deck(ids)).map((q) => q.itemId).join(",")),
    );
    // With 30 items, 5 independent shuffles landing in the exact same order is
    // astronomically unlikely — this just guards against buildDeckQueue
    // secretly returning itemIds in fixed input order.
    expect(orders.size).toBeGreaterThan(1);
  });

  it("returns an empty queue for an empty deck", () => {
    expect(buildDeckQueue(deck([]))).toEqual([]);
  });
});

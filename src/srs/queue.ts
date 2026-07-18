export type QueueItem = { itemId: string; kind: "due" | "new" };

export type BuildQueueOptions = {
  /** Cards with state !== "new" and due <= now, sorted by due ascending. */
  dueCardStates: { itemId: string; due: string }[];
  /** Deck pool item IDs minus items already tracked in cardStates, in content order (e.g. frequencyRank). */
  candidateNewItemIds: string[];
  /** How many new cards have already been introduced today (from dailyActivity). */
  newCardsIntroducedToday: number;
  /** Daily cap on brand-new cards (default 10). */
  dailyNewCardLimit: number;
  /** Item IDs to sort to the front of the due segment, e.g. journal-flagged vocab. */
  priorityItemIds?: string[];
  /** Cap the total result size (used for warm-up's 5-8 vs. cool-down's remainder). */
  limit?: number;
};

export function buildQueue(opts: BuildQueueOptions): QueueItem[] {
  const priority = new Set(opts.priorityItemIds ?? []);

  const dueSorted = [...opts.dueCardStates].sort((a, b) => {
    const aPriority = priority.has(a.itemId) ? 0 : 1;
    const bPriority = priority.has(b.itemId) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.due.localeCompare(b.due);
  });

  const remainingNewSlots = Math.max(0, opts.dailyNewCardLimit - opts.newCardsIntroducedToday);
  const newItems = opts.candidateNewItemIds.slice(0, remainingNewSlots);

  const queue: QueueItem[] = [
    ...dueSorted.map((c): QueueItem => ({ itemId: c.itemId, kind: "due" })),
    ...newItems.map((itemId): QueueItem => ({ itemId, kind: "new" })),
  ];

  return opts.limit !== undefined ? queue.slice(0, opts.limit) : queue;
}

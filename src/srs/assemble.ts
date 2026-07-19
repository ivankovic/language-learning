import { getDueCardStates, getTrackedItemIds } from "../db/queries/cardStates";
import { getToday } from "../db/queries/activity";
import { buildQueue, type QueueItem } from "./queue";
import type { LoadedLanguageContent } from "../content/loader";
import type { Deck } from "../types/content";

/** DB-touching assembly around the pure buildQueue() — shared by Home's "extra review" and the Practice session's warm-up/cool-down steps. */
export async function assembleQueue(
  lang: string,
  content: LoadedLanguageContent,
  opts?: { limit?: number; priorityItemIds?: string[]; dailyNewCardLimit?: number },
): Promise<QueueItem[]> {
  const [due, tracked, today] = await Promise.all([getDueCardStates(lang), getTrackedItemIds(lang), getToday(lang)]);

  const candidateNewItemIds = [...content.vocabById.values()]
    .filter((v) => !tracked.has(v.id))
    .sort((a, b) => (a.frequencyRank ?? Infinity) - (b.frequencyRank ?? Infinity))
    .map((v) => v.id);

  return buildQueue({
    dueCardStates: due,
    candidateNewItemIds,
    newCardsIntroducedToday: today.newCardsIntroduced,
    dailyNewCardLimit: opts?.dailyNewCardLimit ?? 10,
    priorityItemIds: opts?.priorityItemIds,
    limit: opts?.limit,
  });
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Every word in a single deck, shuffled — for on-demand "quick vocabulary
 * training" on one topic. Deliberately bypasses the daily new-card limit and
 * due-date gating that assembleQueue() applies: this is an explicit,
 * user-initiated cram session (like Anki's manual deck browser), not the
 * auto-paced daily queue, so every word in the deck is fair game right away.
 */
export function buildDeckQueue(deck: Deck): QueueItem[] {
  return shuffle(deck.itemIds).map((itemId) => ({ itemId, kind: "due" }));
}

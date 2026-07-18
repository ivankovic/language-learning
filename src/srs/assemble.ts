import { getDueCardStates, getTrackedItemIds } from "../db/queries/cardStates";
import { getToday } from "../db/queries/activity";
import { buildQueue, type QueueItem } from "./queue";
import type { LoadedLanguageContent } from "../content/loader";

/** DB-touching assembly around the pure buildQueue() — shared by Home's "extra review" and the Practice session's warm-up/cool-down steps. */
export async function assembleQueue(
  lang: string,
  content: LoadedLanguageContent,
  opts?: { limit?: number; priorityItemIds?: string[]; dailyNewCardLimit?: number },
): Promise<QueueItem[]> {
  const [due, tracked, today] = await Promise.all([getDueCardStates(lang), getTrackedItemIds(lang), getToday()]);

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

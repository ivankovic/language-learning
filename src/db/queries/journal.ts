import { db } from "../index";
import type { JournalEntry } from "../../types/user";

export async function listCompleteEntries(targetLang: string): Promise<JournalEntry[]> {
  const rows = await db.journalEntries.where("targetLang").equals(targetLang).toArray();
  return rows.filter((e) => e.status === "complete").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getEntry(id: string): Promise<JournalEntry | undefined> {
  return db.journalEntries.get(id);
}

export async function saveDraft(entry: JournalEntry): Promise<void> {
  await db.journalEntries.put({ ...entry, status: "draft", updatedAt: new Date().toISOString() });
}

export async function completeEntry(
  entry: JournalEntry,
  patch: Pick<JournalEntry, "translationAttempt" | "aiFeedback" | "extractedVocabIds">,
): Promise<void> {
  // put(), not update() — the draft row may not exist yet if the user saves
  // before the debounced saveDraft() has fired even once, and update() is a
  // silent no-op against a nonexistent key.
  await db.journalEntries.put({
    ...entry,
    ...patch,
    status: "complete",
    updatedAt: new Date().toISOString(),
  });
}

export async function getMostRecentCompleteEntry(targetLang: string): Promise<JournalEntry | undefined> {
  const entries = await listCompleteEntries(targetLang);
  return entries[0];
}

/** Vocab flagged from journal entries in the last `withinDays` days, most recent first, deduped. */
export async function getRecentFlaggedVocabIds(targetLang: string, withinDays: number): Promise<string[]> {
  const entries = await listCompleteEntries(targetLang);
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const entry of entries) {
    if (new Date(entry.createdAt).getTime() < cutoff) break;
    for (const itemId of entry.extractedVocabIds ?? []) {
      if (!seen.has(itemId)) {
        seen.add(itemId);
        ids.push(itemId);
      }
    }
  }
  return ids;
}

import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../index";
import { completeEntry, listCompleteEntries, getEntry, deleteEntry, getRandomCompleteEntry } from "./journal";
import type { JournalEntry } from "../../types/user";

function draft(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "entry-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft",
    knownLang: "en",
    targetLang: "it",
    originalText: "I ate pizza",
    translationAttempt: "",
    ...overrides,
  };
}

describe("completeEntry", () => {
  beforeEach(async () => {
    await db.journalEntries.clear();
  });

  it("completes an entry even if no draft row was ever persisted (save before the debounce fires)", async () => {
    // Regression test: completeEntry used to call Dexie's update(), which is
    // a silent no-op against a nonexistent primary key — if the user hit
    // Save before the debounced saveDraft() ever wrote a row, the entry
    // vanished entirely. It must upsert instead.
    const entry = draft();
    await completeEntry(entry, { translationAttempt: "Ho mangiato la pizza", aiFeedback: undefined, extractedVocabIds: [] });

    const saved = await getEntry(entry.id);
    expect(saved).toBeDefined();
    expect(saved?.status).toBe("complete");
    expect(saved?.translationAttempt).toBe("Ho mangiato la pizza");

    const complete = await listCompleteEntries("it");
    expect(complete).toHaveLength(1);
  });

  it("completes an entry that does have an existing draft row, preserving its fields", async () => {
    const entry = draft();
    await db.journalEntries.put(entry);
    await completeEntry(entry, { translationAttempt: "Ho mangiato la pizza", aiFeedback: "Nice job!", extractedVocabIds: ["it-vocab-food-005"] });

    const saved = await getEntry(entry.id);
    expect(saved?.status).toBe("complete");
    expect(saved?.aiFeedback).toBe("Nice job!");
    expect(saved?.extractedVocabIds).toEqual(["it-vocab-food-005"]);
    expect(saved?.originalText).toBe("I ate pizza"); // untouched fields preserved
  });
});

describe("deleteEntry", () => {
  beforeEach(async () => {
    await db.journalEntries.clear();
  });

  it("removes the entry so it no longer appears in listCompleteEntries or getEntry", async () => {
    const entry = draft();
    await completeEntry(entry, { translationAttempt: "Ho mangiato la pizza", aiFeedback: undefined, extractedVocabIds: [] });
    expect(await listCompleteEntries("it")).toHaveLength(1);

    await deleteEntry(entry.id);

    expect(await getEntry(entry.id)).toBeUndefined();
    expect(await listCompleteEntries("it")).toHaveLength(0);
  });

  it("is a no-op for an id that doesn't exist", async () => {
    await expect(deleteEntry("nonexistent-id")).resolves.not.toThrow();
  });
});

describe("getRandomCompleteEntry", () => {
  beforeEach(async () => {
    await db.journalEntries.clear();
  });

  it("returns undefined when there are no complete entries", async () => {
    expect(await getRandomCompleteEntry("it")).toBeUndefined();
  });

  it("returns the only entry, even when it matches excludeId", async () => {
    const entry = draft();
    await completeEntry(entry, { translationAttempt: "x", aiFeedback: undefined, extractedVocabIds: [] });
    const result = await getRandomCompleteEntry("it", entry.id);
    expect(result?.id).toBe(entry.id);
  });

  it("never returns excludeId when other entries exist", async () => {
    const a = draft({ id: "entry-a" });
    const b = draft({ id: "entry-b" });
    await completeEntry(a, { translationAttempt: "x", aiFeedback: undefined, extractedVocabIds: [] });
    await completeEntry(b, { translationAttempt: "y", aiFeedback: undefined, extractedVocabIds: [] });
    for (let i = 0; i < 10; i++) {
      const result = await getRandomCompleteEntry("it", "entry-a");
      expect(result?.id).toBe("entry-b");
    }
  });

  it("ignores draft entries", async () => {
    const d = draft({ id: "draft-only" });
    await db.journalEntries.put(d);
    expect(await getRandomCompleteEntry("it")).toBeUndefined();
  });
});

import { describe, it, expect } from "vitest";
import { loadLanguageContent, validateContentBundle, hasContentBundle } from "./loader";

describe("content loader", () => {
  it("reports no bundle for an unregistered language", () => {
    expect(hasContentBundle("fr")).toBe(false);
    expect(hasContentBundle("it")).toBe(true);
  });

  it("resolves the Italian bundle with the expected shape", async () => {
    const content = await loadLanguageContent("it");
    expect(content.vocabById.size).toBeGreaterThanOrEqual(100);
    expect(content.decks.length).toBeGreaterThanOrEqual(4);
    expect(content.lessons.length).toBeGreaterThanOrEqual(5);
    expect(content.course.id).toBe("it-course-a1");
  });

  it("caches the bundle across repeated loads", async () => {
    const a = await loadLanguageContent("it");
    const b = await loadLanguageContent("it");
    expect(a).toBe(b);
  });

  it("rejects for an unregistered language", async () => {
    await expect(loadLanguageContent("fr")).rejects.toThrow(/No content bundle/);
  });

  it("the Italian seed content passes referential-integrity validation", async () => {
    const content = await loadLanguageContent("it");
    const issues = validateContentBundle(content);
    expect(issues).toEqual([]);
  });

  it("every lesson's prerequisite chain terminates (no cycles) and unit->course wiring is complete", async () => {
    const content = await loadLanguageContent("it");
    expect(content.units.every((u) => content.course.unitIds.includes(u.id))).toBe(true);
    const allLessonIdsInUnits = content.units.flatMap((u) => u.lessonIds);
    expect(new Set(allLessonIdsInUnits).size).toBe(content.lessons.length);
  });

  it("lessons are ordered globally by course -> unit -> lesson, not by each lesson's per-unit order field alone", async () => {
    const content = await loadLanguageContent("it");
    const order = content.lessons.map((l) => l.id);
    // it-lesson-essere has order:1 (first lesson of unit 2) and
    // it-lesson-greetings also has order:1 (first lesson of unit 1) — a naive
    // sort-by-order would tie or misorder these across units.
    expect(order.indexOf("it-lesson-essere")).toBeGreaterThan(order.indexOf("it-lesson-articles"));
    expect(order.indexOf("it-lesson-articles")).toBeGreaterThan(order.indexOf("it-lesson-greetings"));
    expect(order).toEqual([
      "it-lesson-greetings",
      "it-lesson-articles",
      "it-lesson-essere",
      "it-lesson-avere",
      "it-lesson-numbers",
      "it-lesson-are-verbs",
      "it-lesson-word-order",
      "it-lesson-food-travel",
      "it-lesson-ere-ire-verbs",
      "it-lesson-modal-verbs",
      "it-lesson-reflexive-verbs",
      "it-lesson-adjectives",
      "it-lesson-prepositions",
      "it-lesson-passato-prossimo-avere",
      "it-lesson-passato-prossimo-essere",
    ]);
  });
});

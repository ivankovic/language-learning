import { describe, it, expect } from "vitest";
import {
  localizedTitle,
  resolveVocabTranslation,
  resolveExplanationMarkdown,
  resolveExercise,
} from "./localize";
import type { VocabItem, Exercise } from "../types/content";

describe("localizedTitle", () => {
  it("uses the override for the known language when present", () => {
    expect(localizedTitle({ title: "Greetings", titleByLang: { hr: "Pozdravi" } }, "hr")).toBe("Pozdravi");
  });

  it("falls back to the base title when no override exists for that language", () => {
    expect(localizedTitle({ title: "Greetings", titleByLang: { hr: "Pozdravi" } }, "fr")).toBe("Greetings");
    expect(localizedTitle({ title: "Greetings" }, "hr")).toBe("Greetings");
  });
});

describe("resolveVocabTranslation", () => {
  const item: VocabItem = { id: "1", lang: "it", term: "ciao", translations: { en: ["hi", "bye"] } };

  it("uses the known language's translation when present", () => {
    const withHr: VocabItem = { ...item, translations: { en: ["hi"], hr: ["bok"] } };
    expect(resolveVocabTranslation(withHr, "hr")).toBe("bok");
  });

  it("falls back to English when the known language has no translation yet", () => {
    expect(resolveVocabTranslation(item, "hr")).toBe("hi, bye");
  });

  it("falls back to a placeholder when neither the known language nor English exist", () => {
    const bare: VocabItem = { id: "2", lang: "it", term: "x", translations: {} };
    expect(resolveVocabTranslation(bare, "hr")).toBe("(no translation)");
  });
});

describe("resolveExplanationMarkdown", () => {
  it("uses the known-language override when present, else the base markdown", () => {
    const block = { markdown: "Hello", i18n: { hr: "Pozdrav" } };
    expect(resolveExplanationMarkdown(block, "hr")).toBe("Pozdrav");
    expect(resolveExplanationMarkdown(block, "fr")).toBe("Hello");
  });
});

describe("resolveExercise", () => {
  const base: Exercise = {
    id: "ex1",
    type: "multiple-choice",
    prompt: "Which greeting?",
    answer: "buongiorno",
    distractors: ["buonasera", "buonanotte"],
  };

  it("returns the base exercise unchanged when no override exists for the language", () => {
    expect(resolveExercise(base, "hr")).toEqual(base);
  });

  it("merges only the overridden fields, leaving answer/distractors untouched when omitted", () => {
    const withOverride: Exercise = { ...base, i18n: { hr: { prompt: "Koji pozdrav?" } } };
    const resolved = resolveExercise(withOverride, "hr");
    expect(resolved.prompt).toBe("Koji pozdrav?");
    expect(resolved.answer).toBe("buongiorno");
    expect(resolved.distractors).toEqual(["buonasera", "buonanotte"]);
  });

  it("overrides answer/distractors too when the exercise tests known-language text", () => {
    const withOverride: Exercise = {
      ...base,
      i18n: { hr: { prompt: "Koji pozdrav?", answer: "dobro jutro", distractors: ["dobra večer"] } },
    };
    const resolved = resolveExercise(withOverride, "hr");
    expect(resolved.answer).toBe("dobro jutro");
    expect(resolved.distractors).toEqual(["dobra večer"]);
  });
});

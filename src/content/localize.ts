// Resolves content that's translated incrementally: every entity carries its
// original English text plus an optional per-known-language override, and
// every read goes through here so a partially-translated language always
// degrades to English rather than showing blanks or crashing.
import type { Deck, Course, Unit, GrammarLesson, VocabItem, Exercise } from "../types/content";

type TitledEntity = { title: string; titleByLang?: Record<string, string> };

export function localizedTitle(entity: TitledEntity, knownLang: string): string {
  return entity.titleByLang?.[knownLang] ?? entity.title;
}

export function localizedDeckTitle(deck: Deck, knownLang: string): string {
  return localizedTitle(deck, knownLang);
}

export function localizedCourseTitle(course: Course, knownLang: string): string {
  return localizedTitle(course, knownLang);
}

export function localizedUnitTitle(unit: Unit, knownLang: string): string {
  return localizedTitle(unit, knownLang);
}

export function localizedLessonTitle(lesson: GrammarLesson, knownLang: string): string {
  return localizedTitle(lesson, knownLang);
}

/** Vocab meaning shown to the learner, e.g. on a flashcard back. Falls back to English, then a placeholder. */
export function resolveVocabTranslation(item: VocabItem, knownLang: string): string {
  return item.translations[knownLang]?.join(", ") ?? item.translations.en?.join(", ") ?? "(no translation)";
}

export function resolveExplanationMarkdown(
  block: { markdown: string; i18n?: Record<string, string> },
  knownLang: string,
): string {
  return block.i18n?.[knownLang] ?? block.markdown;
}

/** Merges an exercise with its known-language override (if any) — the result is what should be rendered and checked against, never the base exercise directly once a known language is in play. */
export function resolveExercise(exercise: Exercise, knownLang: string): Exercise {
  const override = exercise.i18n?.[knownLang];
  if (!override) return exercise;
  return {
    ...exercise,
    prompt: override.prompt ?? exercise.prompt,
    answer: override.answer ?? exercise.answer,
    distractors: override.distractors ?? exercise.distractors,
  };
}

import type { VocabItem, Deck, Course, Unit, GrammarLesson } from "../types/content";
import type { LoadedLanguageContent } from "./loader";

/**
 * Shared by every per-language index.ts (it/, fr/, ...) — factored out once a
 * second language existed, to avoid the course->unit->lesson flattening logic
 * (see comment below) drifting out of sync across language bundles.
 */
export function buildLanguageContent(
  vocabData: unknown,
  decksData: unknown,
  courseData: unknown,
  unitsData: unknown,
  lessonModules: Record<string, { default: GrammarLesson }>,
): LoadedLanguageContent {
  const vocab = vocabData as VocabItem[];
  const course = courseData as Course;
  const units = unitsData as Unit[];
  const lessonsById = new Map(Object.values(lessonModules).map((m) => [m.default.id, m.default] as const));

  // GrammarLesson.order is only unique *within* its unit (1, 2, 3, repeating
  // per unit) — the actual global course order comes from flattening
  // course.unitIds -> unit.lessonIds, not from sorting lessons by that field
  // directly (which would produce ties/wrong interleaving across units).
  const unitsById = new Map(units.map((u) => [u.id, u]));
  const lessons = course.unitIds
    .flatMap((unitId) => unitsById.get(unitId)?.lessonIds ?? [])
    .map((lessonId) => lessonsById.get(lessonId))
    .filter((l): l is GrammarLesson => l !== undefined);

  return {
    vocabById: new Map(vocab.map((item) => [item.id, item])),
    decks: decksData as Deck[],
    course,
    units,
    lessons,
  };
}

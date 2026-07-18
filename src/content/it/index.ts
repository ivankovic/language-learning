import type { VocabItem, Deck, Course, Unit, GrammarLesson } from "../../types/content";
import vocabData from "./vocab.json";
import decksData from "./decks.json";
import courseData from "./course.json";
import unitsData from "./units.json";
import type { LoadedLanguageContent } from "../loader";

// Single file per content type is fine at this seed-content scale (~110
// words, 8 lessons). Once this grows toward the "Large tier" (~2000 words),
// split vocab/decks into per-topic files the same way lessons already are.
const lessonModules = import.meta.glob<{ default: GrammarLesson }>("./lessons/*.json", { eager: true });

export function loadItalianContent(): LoadedLanguageContent {
  const vocab = vocabData as VocabItem[];
  const course = courseData as Course;
  const units = unitsData as Unit[];
  const lessonsById = new Map(
    Object.values(lessonModules).map((m) => [m.default.id, m.default] as const),
  );

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

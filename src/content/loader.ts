import type { VocabItem, Deck, Course, Unit, GrammarLesson } from "../types/content";

export type LoadedLanguageContent = {
  vocabById: Map<string, VocabItem>;
  decks: Deck[];
  course: Course;
  units: Unit[];
  lessons: GrammarLesson[];
};

const registry: Record<string, () => Promise<LoadedLanguageContent>> = {
  it: () => import("./it/index").then((m) => m.loadItalianContent()),
  fr: () => import("./fr/index").then((m) => m.loadFrenchContent()),
  de: () => import("./de/index").then((m) => m.loadGermanContent()),
  hr: () => import("./hr/index").then((m) => m.loadCroatianContent()),
  es: () => import("./es/index").then((m) => m.loadSpanishContent()),
};

const cache = new Map<string, Promise<LoadedLanguageContent>>();

export function hasContentBundle(lang: string): boolean {
  return lang in registry;
}

export function loadLanguageContent(lang: string): Promise<LoadedLanguageContent> {
  if (!registry[lang]) {
    return Promise.reject(new Error(`No content bundle for language "${lang}"`));
  }
  if (!cache.has(lang)) {
    cache.set(lang, registry[lang]());
  }
  return cache.get(lang)!;
}

export type ContentValidationIssue = string;

/** Checks ID uniqueness and referential integrity within a loaded bundle. Used in tests and as a dev-server sanity check. */
export function validateContentBundle(content: LoadedLanguageContent): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  const lessonIds = new Set(content.lessons.map((l) => l.id));
  if (lessonIds.size !== content.lessons.length) issues.push("Duplicate GrammarLesson id detected");

  const exerciseIds = new Set<string>();
  for (const lesson of content.lessons) {
    for (const exercise of lesson.exercises) {
      if (exerciseIds.has(exercise.id)) issues.push(`Duplicate exercise id: ${exercise.id}`);
      exerciseIds.add(exercise.id);
      if (exercise.relatedItemId && !content.vocabById.has(exercise.relatedItemId)) {
        issues.push(`Exercise ${exercise.id} references unknown relatedItemId ${exercise.relatedItemId}`);
      }
    }
    for (const block of lesson.blocks) {
      if (block.type === "exercise" && !exerciseIds.has(block.exerciseId)) {
        // blocks are processed in file order, so an exercise block may
        // legitimately reference an id defined later in the same lesson's
        // exercises array — only flag if it's missing from the lesson entirely.
        const definedInLesson = lesson.exercises.some((e) => e.id === block.exerciseId);
        if (!definedInLesson) issues.push(`Lesson ${lesson.id} block references unknown exerciseId ${block.exerciseId}`);
      }
    }
    for (const prereqId of lesson.prerequisiteIds ?? []) {
      if (!lessonIds.has(prereqId)) issues.push(`Lesson ${lesson.id} has dangling prerequisiteId ${prereqId}`);
    }
  }

  for (const unit of content.units) {
    for (const lessonId of unit.lessonIds) {
      if (!lessonIds.has(lessonId)) issues.push(`Unit ${unit.id} references unknown lessonId ${lessonId}`);
    }
  }

  for (const unitId of content.course.unitIds) {
    if (!content.units.some((u) => u.id === unitId)) {
      issues.push(`Course ${content.course.id} references unknown unitId ${unitId}`);
    }
  }

  for (const deck of content.decks) {
    for (const itemId of deck.itemIds) {
      if (!content.vocabById.has(itemId)) issues.push(`Deck ${deck.id} references unknown itemId ${itemId}`);
    }
  }

  return issues;
}

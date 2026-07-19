// Static, shipped-with-the-app content. Never mutated at runtime; the only
// local-storage join point is a content item's `id`, which — once shipped —
// must never be reassigned (local CardState/LessonProgress key off it).

export type ScriptKind = "latin" | "cyrillic" | "cjk" | "arabic" | "other";

export type Language = {
  code: string; // ISO 639-1, e.g. "it"
  name: string;
  script: ScriptKind;
  direction: "ltr" | "rtl";
  ttsVoiceHint?: string; // hint for picking a Web Speech API voice
  flag?: string; // emoji shown next to the name in language pickers
};

export type VocabItem = {
  id: string; // stable forever — SRS join key
  lang: string; // target-language code
  term: string;
  translations: Record<string, string[]>; // keyed by known-language code, e.g. { en: ["dog"] }
  pos?: string; // part of speech
  examples?: { sentence: string; translations: Record<string, string> }[];
  tags?: string[];
  frequencyRank?: number;
};

export type Deck = {
  id: string;
  lang: string;
  title: string;
  courseId?: string;
  itemIds: string[];
};

// Referenced by Course.unitIds; not defined in the original design doc, added
// here to make the course -> unit -> lesson tree concrete.
export type Unit = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessonIds: string[];
};

export type ExerciseType = "multiple-choice" | "fill-blank" | "reorder" | "translate";

export type Exercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  answer: string | string[];
  distractors?: string[];
  // Links this exercise to a VocabItem so a wrong answer can surface/create
  // an SRS card for that word ("wrong exercises can spawn review cards").
  relatedItemId?: string;
};

export type LessonBlock =
  | { type: "explanation"; markdown: string }
  | { type: "exercise"; exerciseId: string };

export type GrammarLesson = {
  id: string;
  lang: string;
  courseId?: string;
  unitId?: string;
  order: number;
  title: string;
  prerequisiteIds?: string[];
  blocks: LessonBlock[];
  exercises: Exercise[]; // referenced by id from `blocks`
};

export type Course = {
  id: string;
  lang: string;
  title: string;
  unitIds: string[];
};

export type JournalPrompt = {
  id: string;
  text: string;
};

// Local-only user data (IndexedDB via Dexie). Never shipped, never touched by
// content updates. Joins to content solely via stable content `id`s.

export type UserProfile = {
  id: "singleton"; // single-row table; there is no multi-user/account system
  knownLangs: string[];
  targetLangs: string[];
  activeTargetLang: string;
  dailyGoal: number;
  dailyNewCardLimit: number; // default 10
  journalIntervalDays: 1 | 3 | 7 | null; // null = manual-only, default 3
  createdAt: string;
};

export type CardLifecycleState = "new" | "learning" | "review" | "relearning";

// A superset of the design doc's CardState: ts-fsrs's Card needs elapsedDays/
// scheduledDays/reps/lapses to round-trip scheduling correctly, which the
// original spec's field list omitted. Field names below are ours; `due` and
// `lastReview` are the spec's `dueAt`/`lastReviewedAt` renamed to match
// ts-fsrs's vocabulary directly (see src/srs/fsrs.ts mappers).
export type CardState = {
  itemId: string; // keyed to content VocabItem.id
  lang: string;
  state: CardLifecycleState;
  due: string; // ISO datetime
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string; // ISO datetime
  reviewHistory: { at: string; grade: 1 | 2 | 3 | 4 }[];
};

export type LessonProgress = {
  lessonId: string;
  lang: string;
  startedAt: string;
  completedAt?: string;
  exerciseResults: Record<string, boolean>;
};

export type JournalEntryStatus = "draft" | "complete";

export type JournalEntry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: JournalEntryStatus;
  knownLang: string;
  targetLang: string;
  promptId?: string;
  originalText: string;
  translationAttempt: string;
  aiFeedback?: string;
  extractedVocabIds?: string[];
};

// Not present in the original design doc: the single source of truth for
// streaks, the Progress calendar, session summaries, and "how many new cards
// were introduced today" (needed by the SRS daily limit).
export type DailyActivity = {
  date: string; // "YYYY-MM-DD", local time
  reviewsCount: number;
  newCardsIntroduced: number;
  lessonsCompleted: number;
  journalEntriesCompleted: number;
};

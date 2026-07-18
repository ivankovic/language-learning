import type { QueueItem } from "../../srs/queue";

export type PracticeStep = "warmup" | "lesson" | "journal" | "cooldown" | "summary";

export type PracticeSessionState = {
  lang: string;
  warmupQueue: QueueItem[];
  cooldownQueue: QueueItem[];
  lessonId: string | null;
  lessonTitle: string | null;
  includeJournal: boolean;
  reviewedCount: number;
  lessonCompleted: boolean;
  journalCompleted: boolean;
};

// Ephemeral, per-tab in-flight session state — deliberately not in Dexie.
// sessionStorage (not a React Context) because the Lesson/Journal steps hand
// off to LessonDetail/JournalEntryScreen's own full routes and back, which
// remounts this component; state needs to survive that round trip.
const KEY = "practice-session";

export function loadSession(): PracticeSessionState | null {
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as PracticeSessionState) : null;
}

export function saveSession(state: PracticeSessionState): void {
  sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function clearSession(): void {
  sessionStorage.removeItem(KEY);
}

const STEP_ORDER: PracticeStep[] = ["warmup", "lesson", "journal", "cooldown", "summary"];

function isStepDone(state: PracticeSessionState, step: PracticeStep): boolean {
  switch (step) {
    case "warmup":
      return state.warmupQueue.length === 0;
    case "lesson":
      return !state.lessonId || state.lessonCompleted;
    case "journal":
      return !state.includeJournal || state.journalCompleted;
    case "cooldown":
      return state.cooldownQueue.length === 0;
    case "summary":
      return false; // terminal — never auto-skipped
  }
}

/** Walks the fixed step order starting after `from`, returning the first step that isn't trivially empty/already-done. */
export function resolveNextStep(state: PracticeSessionState, from: PracticeStep | "start"): PracticeStep {
  const startIndex = from === "start" ? 0 : STEP_ORDER.indexOf(from) + 1;
  for (let i = startIndex; i < STEP_ORDER.length; i++) {
    const step = STEP_ORDER[i];
    if (!isStepDone(state, step)) return step;
  }
  return "summary";
}

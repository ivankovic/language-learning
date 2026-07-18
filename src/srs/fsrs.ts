import { fsrs, createEmptyCard, generatorParameters, State, type Card } from "ts-fsrs";
import type { CardState, CardLifecycleState } from "../types/user";
import type { Grade } from "./types";

// request_retention: 0.9 default matches the design's "target retention rate"
// setting (see SPECS.md's SRS Algorithm section). enable_short_term (default
// true) is what gives new/lapsed cards short native intervals instead of the
// hand-specified "1min -> 10min -> 1day" ladder the design doc sketched —
// ts-fsrs doesn't expose a literal step-ladder config, so we rely on this
// instead (verified against the installed ts-fsrs@4 .d.ts, not assumed).
const scheduler = fsrs(generatorParameters({ request_retention: 0.9 }));

const STATE_TO_LIFECYCLE: Record<State, CardLifecycleState> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

const LIFECYCLE_TO_STATE: Record<CardLifecycleState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

function toFsrsCard(card: CardState): Card {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: LIFECYCLE_TO_STATE[card.state],
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
  };
}

function fromFsrsCard(
  fsrsCard: Card,
  base: Pick<CardState, "itemId" | "lang" | "reviewHistory">,
): CardState {
  return {
    itemId: base.itemId,
    lang: base.lang,
    reviewHistory: base.reviewHistory,
    due: fsrsCard.due.toISOString(),
    stability: fsrsCard.stability,
    difficulty: fsrsCard.difficulty,
    elapsedDays: fsrsCard.elapsed_days,
    scheduledDays: fsrsCard.scheduled_days,
    reps: fsrsCard.reps,
    lapses: fsrsCard.lapses,
    state: STATE_TO_LIFECYCLE[fsrsCard.state],
    lastReview: fsrsCard.last_review?.toISOString(),
  };
}

export function newCardState(itemId: string, lang: string, now = new Date()): CardState {
  const empty = createEmptyCard(now);
  return fromFsrsCard(empty, { itemId, lang, reviewHistory: [] });
}

/** Pure: grades a card and returns its updated state. Caller persists the result. */
export function gradeCard(card: CardState, grade: Grade, now = new Date()): CardState {
  const { card: updated } = scheduler.next(toFsrsCard(card), now, grade);
  const graded = fromFsrsCard(updated, {
    itemId: card.itemId,
    lang: card.lang,
    reviewHistory: [...card.reviewHistory, { at: now.toISOString(), grade }],
  });
  return graded;
}

/** Next due date per possible grade — for showing e.g. "Good -> 3d" on grading buttons. */
export function previewIntervals(card: CardState, now = new Date()): Record<Grade, Date> {
  const recordLog = scheduler.repeat(toFsrsCard(card), now);
  return {
    1: recordLog[1].card.due,
    2: recordLog[2].card.due,
    3: recordLog[3].card.due,
    4: recordLog[4].card.due,
  };
}

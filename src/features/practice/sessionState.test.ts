import { describe, it, expect } from "vitest";
import { resolveNextStep, type PracticeSessionState } from "./sessionState";

function baseState(overrides: Partial<PracticeSessionState> = {}): PracticeSessionState {
  return {
    lang: "it",
    warmupQueue: [{ itemId: "a", kind: "due" }],
    cooldownQueue: [{ itemId: "b", kind: "due" }],
    lessonId: "lesson-1",
    lessonTitle: "Lesson 1",
    includeJournal: true,
    reviewedCount: 0,
    lessonCompleted: false,
    journalCompleted: false,
    ...overrides,
  };
}

describe("resolveNextStep", () => {
  it("starts at warmup when nothing is empty", () => {
    expect(resolveNextStep(baseState(), "start")).toBe("warmup");
  });

  it("advances warmup -> lesson -> journal -> cooldown -> summary in order", () => {
    const state = baseState();
    expect(resolveNextStep(state, "warmup")).toBe("lesson");
    expect(resolveNextStep(state, "lesson")).toBe("journal");
    expect(resolveNextStep(state, "journal")).toBe("cooldown");
    expect(resolveNextStep(state, "cooldown")).toBe("summary");
  });

  it("skips lesson step when there's no lesson in progress", () => {
    const state = baseState({ lessonId: null });
    expect(resolveNextStep(state, "warmup")).toBe("journal");
  });

  it("skips journal step when not due", () => {
    const state = baseState({ includeJournal: false });
    expect(resolveNextStep(state, "warmup")).toBe("lesson");
    expect(resolveNextStep(state, "lesson")).toBe("cooldown");
  });

  it("skips cooldown when the queue is empty", () => {
    const state = baseState({ cooldownQueue: [] });
    expect(resolveNextStep(state, "journal")).toBe("summary");
  });

  it("skips straight to summary when everything is empty/done", () => {
    const state = baseState({ warmupQueue: [], cooldownQueue: [], lessonId: null, includeJournal: false });
    expect(resolveNextStep(state, "start")).toBe("summary");
  });

  it("does not re-offer a step already marked complete", () => {
    const state = baseState({ lessonCompleted: true, journalCompleted: true });
    expect(resolveNextStep(state, "warmup")).toBe("cooldown");
  });
});

import type { Exercise } from "../../../types/content";

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.!?]+$/, "");
}

export type UserAnswer = string | string[];

export function checkAnswer(exercise: Exercise, userAnswer: UserAnswer): boolean {
  switch (exercise.type) {
    case "multiple-choice":
    case "fill-blank": {
      const answer = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
      const given = Array.isArray(userAnswer) ? userAnswer[0] ?? "" : userAnswer;
      return answer.some((a) => normalize(a) === normalize(given));
    }
    case "translate": {
      const answers = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
      const given = Array.isArray(userAnswer) ? userAnswer[0] ?? "" : userAnswer;
      return answers.some((a) => normalize(a) === normalize(given));
    }
    case "reorder": {
      const expected = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
      const given = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      return expected.length === given.length && expected.every((token, i) => normalize(token) === normalize(given[i] ?? ""));
    }
    default:
      return false;
  }
}

// Human-readable correct answer, shown to the user after an incorrect
// attempt so they always learn the right answer rather than being left to
// guess.
export function formatSolution(exercise: Exercise): string {
  switch (exercise.type) {
    case "multiple-choice":
      return Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer;
    case "fill-blank":
    case "translate": {
      const answers = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
      return answers.join(" / ");
    }
    case "reorder": {
      const tokens = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
      return tokens.join(" ");
    }
    default:
      return "";
  }
}

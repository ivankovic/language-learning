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

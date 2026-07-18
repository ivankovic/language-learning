import { describe, it, expect } from "vitest";
import { checkAnswer } from "./checkAnswer";
import type { Exercise } from "../../../types/content";

describe("checkAnswer", () => {
  it("multiple-choice: exact match", () => {
    const ex: Exercise = { id: "1", type: "multiple-choice", prompt: "", answer: "grazie", distractors: [] };
    expect(checkAnswer(ex, "grazie")).toBe(true);
    expect(checkAnswer(ex, "prego")).toBe(false);
  });

  it("fill-blank: case/whitespace insensitive", () => {
    const ex: Exercise = { id: "2", type: "fill-blank", prompt: "", answer: "Ciao" };
    expect(checkAnswer(ex, "  ciao  ")).toBe(true);
    expect(checkAnswer(ex, "CIAO")).toBe(true);
  });

  it("translate: accepts any of multiple valid answers, ignores trailing punctuation", () => {
    const ex: Exercise = { id: "3", type: "translate", prompt: "", answer: ["Lei è insegnante.", "Lei è un'insegnante."] };
    expect(checkAnswer(ex, "lei è insegnante")).toBe(true);
    expect(checkAnswer(ex, "Lei è un'insegnante")).toBe(true);
    expect(checkAnswer(ex, "Lui è insegnante")).toBe(false);
  });

  it("reorder: exact token sequence required", () => {
    const ex: Exercise = { id: "4", type: "reorder", prompt: "", answer: ["Sono", "le", "tre"] };
    expect(checkAnswer(ex, ["Sono", "le", "tre"])).toBe(true);
    expect(checkAnswer(ex, ["le", "Sono", "tre"])).toBe(false);
    expect(checkAnswer(ex, ["Sono", "le"])).toBe(false);
  });
});

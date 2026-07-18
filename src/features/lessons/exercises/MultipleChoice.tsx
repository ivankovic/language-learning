import { useMemo, useState } from "react";
import type { Exercise } from "../../../types/content";
import { checkAnswer } from "./checkAnswer";
import { Button } from "../../../components/Button";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MultipleChoice({
  exercise,
  onAnswer,
}: {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
}) {
  const options = useMemo(() => {
    const answer = Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer;
    return shuffle([answer, ...(exercise.distractors ?? [])]);
  }, [exercise]);
  const [selected, setSelected] = useState<string | null>(null);

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    onAnswer(checkAnswer(exercise, option));
  }

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isCorrectAnswer = checkAnswer(exercise, option);
        const showState = selected !== null;
        return (
          <Button
            key={option}
            variant={
              showState && option === selected ? (isCorrectAnswer ? "primary" : "secondary") : "secondary"
            }
            className={`w-full text-left ${showState && isCorrectAnswer ? "ring-2 ring-emerald-400" : ""}`}
            onClick={() => choose(option)}
            disabled={selected !== null}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}

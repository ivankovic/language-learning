import { useState } from "react";
import type { Exercise } from "../../../types/content";
import { checkAnswer } from "./checkAnswer";
import { Button } from "../../../components/Button";

export function TranslateExercise({
  exercise,
  onAnswer,
}: {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (submitted || !value.trim()) return;
    setSubmitted(true);
    onAnswer(checkAnswer(exercise, value));
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitted}
        placeholder="Write your translation…"
        rows={3}
        className="w-full rounded-xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-300 focus:ring-sky-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
      />
      <Button className="w-full" onClick={submit} disabled={submitted || !value.trim()}>
        Check
      </Button>
    </div>
  );
}

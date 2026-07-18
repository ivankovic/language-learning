import { useState } from "react";
import type { Exercise } from "../../../types/content";
import { checkAnswer } from "./checkAnswer";
import { Button } from "../../../components/Button";

export function FillBlank({
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
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        disabled={submitted}
        placeholder="Type your answer…"
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-slate-100 outline-none ring-1 ring-slate-800 focus:ring-sky-500"
      />
      <Button className="w-full" onClick={submit} disabled={submitted || !value.trim()}>
        Check
      </Button>
    </div>
  );
}

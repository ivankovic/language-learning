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

export function Reorder({
  exercise,
  onAnswer,
}: {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
}) {
  const tokens = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
  const bank = useMemo(() => shuffle(tokens.map((t, i) => ({ token: t, key: `${t}-${i}` }))), [exercise]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const selectedTokens = selectedKeys.map((key) => bank.find((b) => b.key === key)!.token);
  const remaining = bank.filter((b) => !selectedKeys.includes(b.key));

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    onAnswer(checkAnswer(exercise, selectedTokens));
  }

  return (
    <div className="space-y-4">
      <div className="flex min-h-12 flex-wrap gap-2 rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
        {selectedKeys.map((key) => (
          <button
            key={key}
            disabled={submitted}
            onClick={() => setSelectedKeys((keys) => keys.filter((k) => k !== key))}
            className="rounded-lg bg-sky-100 px-3 py-1.5 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200"
          >
            {bank.find((b) => b.key === key)!.token}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {remaining.map(({ token, key }) => (
          <button
            key={key}
            disabled={submitted}
            onClick={() => setSelectedKeys((keys) => [...keys, key])}
            className="rounded-lg bg-slate-200 px-3 py-1.5 dark:bg-slate-800"
          >
            {token}
          </button>
        ))}
      </div>
      <Button className="w-full" onClick={submit} disabled={submitted || selectedKeys.length !== tokens.length}>
        Check
      </Button>
    </div>
  );
}

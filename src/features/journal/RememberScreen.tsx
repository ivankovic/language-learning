import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { getRandomCompleteEntry } from "../../db/queries/journal";
import { getPromptById } from "../../content/journalPrompts";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import type { JournalEntry } from "../../types/user";

export function RememberScreen() {
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;

  const [entry, setEntry] = useState<JournalEntry | null | undefined>(undefined);

  useEffect(() => {
    if (!lang) return;
    getRandomCompleteEntry(lang).then((e) => setEntry(e ?? null));
  }, [lang]);

  function shuffle() {
    if (!lang) return;
    getRandomCompleteEntry(lang, entry?.id).then((e) => setEntry(e ?? null));
  }

  return (
    <Screen title="Remember">
      <button onClick={() => navigate("/journal")} className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        ← Back
      </button>

      {entry === undefined && <p className="text-slate-600 dark:text-slate-400">Loading…</p>}

      {entry === null && (
        <p className="text-slate-600 dark:text-slate-400">
          No journal entries yet — write one first, then come back here to revisit it at random.
        </p>
      )}

      {entry && (
        <div>
          <p className="mb-1 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
          <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {getPromptById(entry.promptId).text}
          </p>

          <label className="mb-1 block text-xs text-slate-500">{entry.knownLang.toUpperCase()}</label>
          <p className="mb-4 rounded-xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
            {entry.originalText}
          </p>

          <label className="mb-1 block text-xs text-slate-500">{entry.targetLang.toUpperCase()}</label>
          <p className="mb-4 rounded-xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
            {entry.translationAttempt}
          </p>

          {entry.aiFeedback && (
            <div className="mb-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:bg-sky-500/10 dark:text-sky-200">
              {entry.aiFeedback}
            </div>
          )}

          <Button className="w-full" onClick={shuffle}>
            Show another
          </Button>
        </div>
      )}
    </Screen>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { getEntry, saveDraft, completeEntry, deleteEntry } from "../../db/queries/journal";
import { incrementToday } from "../../db/queries/activity";
import { upsertCardState, getCardState } from "../../db/queries/cardStates";
import { newCardState } from "../../srs/fsrs";
import { detectAssistant, type JournalAssistant } from "../../ai/assistant";
import { buildDictionaryFallback } from "../../ai/dictionaryFallback";
import { pickRandomPrompt, getPromptById } from "../../content/journalPrompts";
import { loadSession, saveSession } from "../practice/sessionState";
import { generateId } from "../../lib/generateId";
import { buildDeepLUrl, buildGoogleTranslateUrl } from "../../lib/translateLinks";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import type { JournalEntry } from "../../types/user";
import type { VocabItem } from "../../types/content";

function newDraft(knownLang: string, targetLang: string): JournalEntry {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft",
    knownLang,
    targetLang,
    promptId: pickRandomPrompt().id,
    originalText: "",
    translationAttempt: "",
  };
}

export function JournalEntryScreen() {
  const { entryId } = useParams<{ entryId: string }>();
  const [searchParams] = useSearchParams();
  const fromPractice = searchParams.get("practice") === "1";
  const isNew = entryId === undefined;
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const knownLang = profile?.knownLangs[0] ?? "en";
  const content = useLanguageContent(lang);

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [assistant, setAssistant] = useState<JournalAssistant | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    detectAssistant().then(setAssistant);
  }, []);

  useEffect(() => {
    if (!lang) return;
    if (isNew) {
      setEntry(newDraft(knownLang, lang));
    } else if (entryId) {
      getEntry(entryId).then((e) => {
        if (e) {
          setEntry(e);
          setAiFeedback(e.aiFeedback ?? null);
          setFlagged(new Set(e.extractedVocabIds ?? []));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, entryId, lang]);

  // Word helper: recognized known-language words in the draft, tap to flag for SRS.
  // Reuses the same dictionary fallback module the non-Chrome degraded mode
  // relies on — one lookup implementation, not two.
  const recognizedWords = useMemo(() => {
    if (!content || !entry) return [];
    const dictionary = buildDictionaryFallback([...content.vocabById.values()], knownLang);
    const words = Array.from(new Set(entry.originalText.toLowerCase().match(/[a-zà-ÿ']+/g) ?? []));
    const matches: { word: string; item: VocabItem }[] = [];
    for (const word of words) {
      const match = dictionary.lookup(word);
      if (match) matches.push({ word, item: match.item });
    }
    return matches;
  }, [content, entry, knownLang]);

  function updateField(patch: Partial<Pick<JournalEntry, "originalText" | "translationAttempt">>) {
    setEntry((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => saveDraft(next), 500);
      return next;
    });
  }

  async function getFeedback() {
    if (!entry || !assistant || assistant.capability !== "chrome-builtin") return;
    setLoadingFeedback(true);
    const feedback = await assistant.correctTranslation({
      known: entry.knownLang,
      target: entry.targetLang,
      originalText: entry.originalText,
      translationAttempt: entry.translationAttempt,
    });
    setAiFeedback(feedback);
    setLoadingFeedback(false);
  }

  async function save() {
    if (!entry || !lang) return;
    // A pending debounced saveDraft() would otherwise fire after completeEntry()
    // and clobber status back to "draft" (saveDraft always forces that status),
    // silently discarding the save.
    if (draftTimer.current) {
      clearTimeout(draftTimer.current);
      draftTimer.current = null;
    }
    const extractedVocabIds = [...flagged];
    await completeEntry(entry, {
      translationAttempt: entry.translationAttempt,
      aiFeedback: aiFeedback ?? undefined,
      extractedVocabIds,
    });
    for (const itemId of extractedVocabIds) {
      const existing = await getCardState(itemId);
      if (!existing) await upsertCardState(newCardState(itemId, lang));
    }
    await incrementToday(lang, { journalEntriesCompleted: 1 });

    if (fromPractice) {
      const session = loadSession();
      if (session) saveSession({ ...session, journalCompleted: true });
      navigate("/practice");
    } else {
      navigate("/journal");
    }
  }

  async function remove() {
    if (!entry) return;
    if (!window.confirm("Delete this journal entry? This can't be undone.")) return;
    await deleteEntry(entry.id);
    navigate("/journal");
  }

  if (!entry || !content) {
    return (
      <Screen title="Journal">
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      </Screen>
    );
  }

  // Resolved once from the entry's stored promptId, not re-rolled — pickRandomPrompt()
  // in the render body would re-randomize on every keystroke/re-render.
  const prompt = getPromptById(entry.promptId);
  const isComplete = entry.status === "complete";

  return (
    <Screen title={isNew ? "New Entry" : "Journal Entry"}>
      <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">{prompt.text}</p>

      <label className="mb-1 block text-xs text-slate-500">Write in {entry.knownLang.toUpperCase()}</label>
      <textarea
        value={entry.originalText}
        onChange={(e) => updateField({ originalText: e.target.value })}
        disabled={isComplete}
        rows={4}
        className="mb-4 w-full rounded-xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-300 focus:ring-sky-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
      />

      {recognizedWords.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-slate-500">Tap a word to add it to your review deck:</p>
          <div className="flex flex-wrap gap-2">
            {recognizedWords.map(({ word, item }) => (
              <button
                key={item.id}
                onClick={() =>
                  setFlagged((prev) => {
                    const next = new Set(prev);
                    next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                    return next;
                  })
                }
                className={`rounded-lg px-3 py-1 text-sm ${
                  flagged.has(item.id) ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {word} → {item.term}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="mb-1 block text-xs text-slate-500">
        Your {entry.targetLang.toUpperCase()} translation attempt
      </label>
      <textarea
        value={entry.translationAttempt}
        onChange={(e) => updateField({ translationAttempt: e.target.value })}
        disabled={isComplete}
        rows={4}
        className="mb-4 w-full rounded-xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-300 focus:ring-sky-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
      />

      {assistant?.capability === "chrome-builtin" && !isComplete && (
        <Button variant="secondary" className="mb-4 w-full" onClick={getFeedback} disabled={loadingFeedback}>
          {loadingFeedback ? "Getting feedback…" : "Get AI feedback"}
        </Button>
      )}
      {assistant?.capability === "unavailable" && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-slate-500">
            On-device AI isn't available in this browser — use the word helper above, or check your attempt with:
          </p>
          <div className="flex gap-2">
            <a
              href={buildDeepLUrl(entry.knownLang, entry.targetLang, entry.originalText)}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!entry.originalText.trim()}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm text-slate-700 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-slate-900 dark:text-slate-300"
            >
              Open in DeepL
            </a>
            <a
              href={buildGoogleTranslateUrl(entry.knownLang, entry.targetLang, entry.originalText)}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!entry.originalText.trim()}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm text-slate-700 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-slate-900 dark:text-slate-300"
            >
              Open in Google Translate
            </a>
          </div>
        </div>
      )}

      {aiFeedback && (
        <div className="mb-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:bg-sky-500/10 dark:text-sky-200">{aiFeedback}</div>
      )}

      {!isComplete && (
        <Button className="w-full" onClick={save} disabled={!entry.originalText.trim() || !entry.translationAttempt.trim()}>
          Save Entry
        </Button>
      )}

      {!isNew && (
        <button
          onClick={remove}
          className="mt-4 w-full text-center text-sm text-rose-600 dark:text-rose-400"
        >
          Delete entry
        </button>
      )}
    </Screen>
  );
}

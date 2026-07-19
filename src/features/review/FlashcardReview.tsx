import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { assembleQueue } from "../../srs/assemble";
import { newCardState, gradeCard, previewIntervals } from "../../srs/fsrs";
import { formatInterval } from "../../srs/formatInterval";
import { getCardState, upsertCardState } from "../../db/queries/cardStates";
import { incrementToday } from "../../db/queries/activity";
import { getLanguage } from "../../content/languages";
import { speak, isTtsAvailable } from "../../speech/tts";
import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import type { QueueItem } from "../../srs/queue";
import type { CardState } from "../../types/user";
import type { Grade } from "../../srs/types";

type Props =
  | { mode: "extra" }
  | { mode: "embedded"; items: QueueItem[]; onComplete: (stats: { reviewed: number }) => void };

const GRADES: { grade: Grade; label: string; variant: "secondary" | "primary" }[] = [
  { grade: 1, label: "Again", variant: "secondary" },
  { grade: 2, label: "Hard", variant: "secondary" },
  { grade: 3, label: "Good", variant: "primary" },
  { grade: 4, label: "Easy", variant: "primary" },
];

export function FlashcardReview(props: Props) {
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const content = useLanguageContent(lang);

  const [queue, setQueue] = useState<QueueItem[] | null>(props.mode === "embedded" ? props.items : null);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<CardState | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    if (props.mode !== "extra" || !lang || !content) return;
    assembleQueue(lang, content, { limit: 50 }).then(setQueue);
  }, [props.mode, lang, content]);

  useEffect(() => {
    if (!queue || !lang) return;
    const item = queue[index];
    if (!item) {
      setCurrent(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const existing = item.kind === "new" ? undefined : await getCardState(item.itemId);
      if (cancelled) return;
      setCurrent(existing ?? newCardState(item.itemId, lang));
      setRevealed(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [queue, index, lang]);

  // Queue exhausted: hand control back to the caller (Practice orchestrator)
  // or navigate Home for standalone "extra review". Done as an effect, not
  // during render, since it's a side effect (navigation / parent callback).
  useEffect(() => {
    if (!queue) return;
    if (index < queue.length) return;
    if (props.mode === "embedded") {
      props.onComplete({ reviewed: reviewedCount });
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, index]);

  if (!lang || !content || !queue) {
    return (
      <Screen title="Review">
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      </Screen>
    );
  }

  const item = queue[index];
  if (!item || !current) {
    if (props.mode === "extra") {
      return (
        <Screen title="Review">
          <p className="mb-4 text-slate-600 dark:text-slate-400">Nothing left to review right now.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </Screen>
      );
    }
    return null; // embedded: the effect above will call onComplete
  }

  const vocabItem = content.vocabById.get(item.itemId);
  if (!vocabItem) {
    // Shouldn't happen for validated content, but skip rather than crash.
    setIndex((i) => i + 1);
    return null;
  }

  const language = getLanguage(lang);
  const knownLang = profile?.knownLangs[0] ?? "en";
  const back = vocabItem.translations[knownLang]?.join(", ") ?? "(no translation)";
  const intervals = revealed ? previewIntervals(current) : null;

  async function grade(g: Grade) {
    if (!current || !lang) return;
    const wasNew = current.state === "new" && current.reps === 0;
    const updated = gradeCard(current, g);
    await upsertCardState(updated);
    await incrementToday(lang, { reviewsCount: 1, newCardsIntroduced: wasNew ? 1 : 0 });
    setReviewedCount((c) => c + 1);
    setIndex((i) => i + 1);
  }

  return (
    <Screen title={props.mode === "extra" ? "Review" : "Warm-up"}>
      <div className="mb-4 text-sm text-slate-500">
        {index + 1} / {queue.length}
      </div>
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl bg-slate-100 p-8 dark:bg-slate-900 text-center">
        <p className="text-3xl font-semibold">{vocabItem.term}</p>
        {isTtsAvailable() && (
          <button
            onClick={() => speak(vocabItem.term, language?.ttsVoiceHint ?? lang)}
            className="mt-3 text-2xl"
            aria-label="Play pronunciation"
          >
            🔊
          </button>
        )}
        {revealed && <p className="mt-6 text-xl text-sky-700 dark:text-sky-300">{back}</p>}
      </div>

      <div className="mt-6">
        {!revealed ? (
          <Button className="w-full" onClick={() => setRevealed(true)}>
            Reveal
          </Button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map(({ grade: g, label, variant }) => (
              <Button key={g} variant={variant} onClick={() => grade(g)} className="flex flex-col gap-0.5">
                <span>{label}</span>
                {intervals && <span className="text-xs opacity-70">{formatInterval(intervals[g])}</span>}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}

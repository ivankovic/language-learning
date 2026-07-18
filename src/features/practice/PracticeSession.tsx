import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { assembleQueue } from "../../srs/assemble";
import { getRecentFlaggedVocabIds, getMostRecentCompleteEntry } from "../../db/queries/journal";
import { getLessonProgressByLang } from "../../db/queries/lessonProgress";
import { computeStreak } from "../../db/queries/activity";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { FlashcardReview } from "../review/FlashcardReview";
import {
  loadSession,
  saveSession,
  clearSession,
  resolveNextStep,
  type PracticeSessionState,
} from "./sessionState";

const WARMUP_SIZE = 6;

async function buildInitialSession(lang: string, content: import("../../content/loader").LoadedLanguageContent, journalIntervalDays: number | null): Promise<PracticeSessionState> {
  const priorityItemIds = await getRecentFlaggedVocabIds(lang, journalIntervalDays ?? 3);
  const full = await assembleQueue(lang, content, { priorityItemIds, limit: 30 });

  const lessonProgress = await getLessonProgressByLang(lang);
  const completedLessonIds = new Set(lessonProgress.filter((p) => p.completedAt).map((p) => p.lessonId));
  const nextLesson = content.lessons.find((lesson) => {
    if (completedLessonIds.has(lesson.id)) return false;
    return (lesson.prerequisiteIds ?? []).every((id) => completedLessonIds.has(id));
  });

  let includeJournal = journalIntervalDays !== null;
  if (includeJournal) {
    const lastEntry = await getMostRecentCompleteEntry(lang);
    if (lastEntry) {
      const daysSince = (Date.now() - new Date(lastEntry.createdAt).getTime()) / 86_400_000;
      includeJournal = daysSince >= (journalIntervalDays ?? 3);
    }
  }

  return {
    lang,
    warmupQueue: full.slice(0, WARMUP_SIZE),
    cooldownQueue: full.slice(WARMUP_SIZE),
    lessonId: nextLesson?.id ?? null,
    lessonTitle: nextLesson?.title ?? null,
    includeJournal,
    reviewedCount: 0,
    lessonCompleted: false,
    journalCompleted: false,
  };
}

export function PracticeSession() {
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const content = useLanguageContent(lang);

  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!lang || !content) return;
    const existing = loadSession();
    if (existing && existing.lang === lang) {
      setSession(existing);
      return;
    }
    buildInitialSession(lang, content, profile?.journalIntervalDays ?? 3).then((s) => {
      saveSession(s);
      setSession(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, content]);

  function commit(next: PracticeSessionState) {
    saveSession(next);
    setSession(next);
  }

  if (!session || !content) {
    return (
      <Screen title="Practice">
        <p className="text-slate-400">Preparing your session…</p>
      </Screen>
    );
  }

  const step = resolveNextStep(session, "start");

  if (step === "warmup") {
    return (
      <FlashcardReview
        mode="embedded"
        items={session.warmupQueue}
        onComplete={({ reviewed }) =>
          commit({ ...session, warmupQueue: [], reviewedCount: session.reviewedCount + reviewed })
        }
      />
    );
  }

  if (step === "lesson") {
    return (
      <Screen title="Practice">
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="mb-2 text-sm text-slate-500">Next up</p>
          <h2 className="mb-6 text-2xl font-semibold">{session.lessonTitle}</h2>
          <Button onClick={() => navigate(`/lessons/${session.lessonId}?practice=1`)}>Start Lesson</Button>
          <Button variant="ghost" className="mt-2" onClick={() => commit({ ...session, lessonCompleted: true })}>
            Skip for now
          </Button>
        </div>
      </Screen>
    );
  }

  if (step === "journal") {
    return (
      <Screen title="Practice">
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="mb-2 text-sm text-slate-500">Time to write</p>
          <h2 className="mb-6 text-2xl font-semibold">Journal Entry</h2>
          <Button onClick={() => navigate("/journal/new?practice=1")}>Write Entry</Button>
          <Button variant="ghost" className="mt-2" onClick={() => commit({ ...session, journalCompleted: true })}>
            Skip for now
          </Button>
        </div>
      </Screen>
    );
  }

  if (step === "cooldown") {
    return (
      <FlashcardReview
        mode="embedded"
        items={session.cooldownQueue}
        onComplete={({ reviewed }) =>
          commit({ ...session, cooldownQueue: [], reviewedCount: session.reviewedCount + reviewed })
        }
      />
    );
  }

  // step === "summary"
  return (
    <SessionSummary
      session={session}
      streak={streak}
      onLoadStreak={() => computeStreak().then(setStreak)}
      onDone={() => {
        clearSession();
        navigate("/");
      }}
    />
  );
}

function SessionSummary({
  session,
  streak,
  onLoadStreak,
  onDone,
}: {
  session: PracticeSessionState;
  streak: number | null;
  onLoadStreak: () => void;
  onDone: () => void;
}) {
  useEffect(() => {
    onLoadStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen title="Session Complete">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="mb-2 text-5xl">🎉</p>
        <p className="mb-6 text-lg text-slate-300">Nice work!</p>
        <div className="mb-8 grid w-full grid-cols-3 gap-3">
          <Stat label="Cards" value={session.reviewedCount} />
          <Stat label="Lesson" value={session.lessonCompleted ? "✅" : "—"} />
          <Stat label="Streak" value={streak !== null ? `🔥${streak}` : "…"} />
        </div>
        <Button className="w-full" onClick={onDone}>
          Done
        </Button>
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-900 py-4">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

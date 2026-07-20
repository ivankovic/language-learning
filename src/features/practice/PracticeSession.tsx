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
import { useT } from "../../i18n/useT";
import { localizedLessonTitle } from "../../content/localize";
import {
  loadSession,
  saveSession,
  clearSession,
  resolveNextStep,
  type PracticeSessionState,
} from "./sessionState";

const WARMUP_SIZE = 6;

// lessonTitle is stored as English here (session state has no known-lang
// context of its own) and localized where it's displayed, same as every
// other title in the app.
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
  const t = useT();
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const knownLang = profile?.knownLangs[0] ?? "en";
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
      <Screen title={t("practice.title")}>
        <p className="text-slate-600 dark:text-slate-400">{t("practice.preparing")}</p>
      </Screen>
    );
  }

  const step = resolveNextStep(session, "start");
  const sessionLesson = session.lessonId ? content.lessons.find((l) => l.id === session.lessonId) : undefined;
  const sessionLessonTitle = sessionLesson ? localizedLessonTitle(sessionLesson, knownLang) : session.lessonTitle;

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
      <Screen title={t("practice.title")}>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="mb-2 text-sm text-slate-500">{t("practice.nextUp")}</p>
          <h2 className="mb-6 text-2xl font-semibold">{sessionLessonTitle}</h2>
          <Button onClick={() => navigate(`/lessons/${session.lessonId}?practice=1`)}>{t("practice.startLesson")}</Button>
          <Button variant="ghost" className="mt-2" onClick={() => commit({ ...session, lessonCompleted: true })}>
            {t("practice.skipForNow")}
          </Button>
        </div>
      </Screen>
    );
  }

  if (step === "journal") {
    return (
      <Screen title={t("practice.title")}>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="mb-2 text-sm text-slate-500">{t("practice.timeToWrite")}</p>
          <h2 className="mb-6 text-2xl font-semibold">{t("practice.journalEntry")}</h2>
          <Button onClick={() => navigate("/journal/new?practice=1")}>{t("practice.writeEntry")}</Button>
          <Button variant="ghost" className="mt-2" onClick={() => commit({ ...session, journalCompleted: true })}>
            {t("practice.skipForNow")}
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
      onLoadStreak={() => computeStreak(session.lang).then(setStreak)}
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
  const t = useT();
  useEffect(() => {
    onLoadStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen title={t("practice.sessionComplete")}>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="mb-2 text-5xl">🎉</p>
        <p className="mb-6 text-lg text-slate-700 dark:text-slate-300">{t("practice.niceWork")}</p>
        <div className="mb-8 grid w-full grid-cols-3 gap-3">
          <Stat label={t("practice.cards")} value={session.reviewedCount} />
          <Stat label={t("practice.lesson")} value={session.lessonCompleted ? "✅" : "—"} />
          <Stat label={t("practice.streak")} value={streak !== null ? `🔥${streak}` : "…"} />
        </div>
        <Button className="w-full" onClick={onDone}>
          {t("practice.done")}
        </Button>
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-100 py-4 dark:bg-slate-900">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

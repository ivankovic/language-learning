import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { getToday, computeStreak } from "../../db/queries/activity";
import { getDueCardStates } from "../../db/queries/cardStates";
import { getLessonProgressByLang } from "../../db/queries/lessonProgress";
import { Screen, SettingsLink } from "../../components/Screen";
import { Button } from "../../components/Button";
import { ContentDisclaimerBanner } from "../../components/ContentDisclaimerBanner";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { Mascot } from "../../components/fun/Mascot";
import { useFunMode } from "../../theme/useFunMode";
import { useT } from "../../i18n/useT";
import { localizedCourseTitle, localizedDeckTitle, localizedLessonTitle } from "../../content/localize";

export function HomeScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [funMode] = useFunMode();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const content = useLanguageContent(lang);

  const today = useLiveQuery(() => (lang ? getToday(lang) : undefined), [lang], undefined);
  const [streak, setStreak] = useState<number | null>(null);
  const [dueCount, setDueCount] = useState<number | null>(null);
  const lessonProgress = useLiveQuery(() => (lang ? getLessonProgressByLang(lang) : undefined), [lang]);

  useEffect(() => {
    if (!lang) return;
    computeStreak(lang).then(setStreak);
  }, [lang, today]);

  useEffect(() => {
    if (!lang) return;
    getDueCardStates(lang).then((rows) => setDueCount(rows.length));
  }, [lang, today]);

  if (!profile || !content) {
    return (
      <Screen title={t("tabs.home")}>
        <p className="text-slate-600 dark:text-slate-400">{t("common.loading")}</p>
      </Screen>
    );
  }

  const knownLang = profile.knownLangs[0] ?? "en";
  const inProgressLesson = lessonProgress?.find((p) => !p.completedAt);
  const inProgressOrFirstLesson = inProgressLesson
    ? content.lessons.find((l) => l.id === inProgressLesson.lessonId)
    : content.lessons[0];
  const lessonTitle = inProgressOrFirstLesson ? localizedLessonTitle(inProgressOrFirstLesson, knownLang) : undefined;

  const goalProgress = today ? Math.min(100, Math.round((today.reviewsCount / profile.dailyGoal) * 100)) : 0;

  return (
    <Screen title={t("home.appTitle")} action={<SettingsLink />}>
      <ContentDisclaimerBanner />
      {funMode && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/60 p-3 shadow-sm dark:bg-slate-900/60">
          <Mascot className="h-16 w-16 shrink-0" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t("home.funGreeting")}</p>
        </div>
      )}
      <LanguageSwitcher />
      <div className="mb-6 flex items-center gap-6">
        <div>
          <p className="text-3xl font-semibold fun:text-4xl">🔥 {streak ?? "…"}</p>
          <p className="text-xs text-slate-500 fun:font-bold">{t("home.dayStreak")}</p>
        </div>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-sky-500 fun:bg-gradient-to-r fun:from-amber-400 fun:to-pink-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 fun:font-bold">
            {t("home.reviewsToday", { count: today?.reviewsCount ?? 0, goal: profile.dailyGoal })}
          </p>
        </div>
      </div>

      <Button className="w-full text-base" onClick={() => navigate("/practice")}>
        {t("home.learn")}
      </Button>

      <button
        onClick={() => navigate("/review")}
        disabled={dueCount === 0}
        className="mt-3 flex w-full items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 fun:rounded-2xl fun:bg-white/70 fun:font-bold fun:shadow-sm dark:fun:bg-slate-900/70"
      >
        <span>{t("home.review")}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {dueCount === null ? "…" : t("home.dueCount", { count: dueCount })}
        </span>
      </button>

      {lessonTitle && (
        <button
          onClick={() => navigate("/lessons")}
          className="mt-3 w-full rounded-xl bg-slate-100 px-4 py-3 text-left dark:bg-slate-900 fun:rounded-2xl fun:bg-white/70 fun:font-bold fun:shadow-sm dark:fun:bg-slate-900/70"
        >
          <p className="text-xs text-slate-500">{localizedCourseTitle(content.course, knownLang)}</p>
          <p>{lessonTitle}</p>
        </button>
      )}

      {content.decks.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("home.quickVocab")}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {content.decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => navigate(`/review?deck=${deck.id}`)}
                className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-left dark:bg-slate-900 fun:rounded-2xl fun:bg-white/70 fun:font-bold fun:shadow-sm dark:fun:bg-slate-900/70"
              >
                <p className="text-sm font-medium">{localizedDeckTitle(deck, knownLang)}</p>
                <p className="text-xs text-slate-500">{t("home.wordsCount", { count: deck.itemIds.length })}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </Screen>
  );
}

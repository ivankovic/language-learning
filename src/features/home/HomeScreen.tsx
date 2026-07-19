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

export function HomeScreen() {
  const navigate = useNavigate();
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
      <Screen title="Home">
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      </Screen>
    );
  }

  const inProgressLesson = lessonProgress?.find((p) => !p.completedAt);
  const lessonTitle = inProgressLesson
    ? content.lessons.find((l) => l.id === inProgressLesson.lessonId)?.title
    : content.lessons[0]?.title;

  const goalProgress = today ? Math.min(100, Math.round((today.reviewsCount / profile.dailyGoal) * 100)) : 0;

  return (
    <Screen title="Language Learning" action={<SettingsLink />}>
      <ContentDisclaimerBanner />
      <LanguageSwitcher />
      <div className="mb-6 flex items-center gap-6">
        <div>
          <p className="text-3xl font-semibold">🔥 {streak ?? "…"}</p>
          <p className="text-xs text-slate-500">day streak</p>
        </div>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-sky-500" style={{ width: `${goalProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {today?.reviewsCount ?? 0} / {profile.dailyGoal} reviews today
          </p>
        </div>
      </div>

      <Button className="w-full text-base" onClick={() => navigate("/practice")}>
        Start Practice
      </Button>

      <button
        onClick={() => navigate("/review")}
        className="mt-3 flex w-full items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-left dark:bg-slate-900"
      >
        <span>Extra review</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">{dueCount ?? "…"} due</span>
      </button>

      {lessonTitle && (
        <button
          onClick={() => navigate("/lessons")}
          className="mt-3 w-full rounded-xl bg-slate-100 px-4 py-3 text-left dark:bg-slate-900"
        >
          <p className="text-xs text-slate-500">{content.course.title}</p>
          <p>{lessonTitle}</p>
        </button>
      )}

      {content.decks.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Quick vocabulary practice</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {content.decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => navigate(`/review?deck=${deck.id}`)}
                className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-left dark:bg-slate-900"
              >
                <p className="text-sm font-medium">{deck.title}</p>
                <p className="text-xs text-slate-500">{deck.itemIds.length} words</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </Screen>
  );
}

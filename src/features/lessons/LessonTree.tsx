import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { getLessonProgressByLang } from "../../db/queries/lessonProgress";
import { Screen, SettingsLink } from "../../components/Screen";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useT } from "../../i18n/useT";
import { localizedCourseTitle, localizedUnitTitle, localizedLessonTitle } from "../../content/localize";

export function LessonTree() {
  const t = useT();
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const content = useLanguageContent(lang);
  const progress = useLiveQuery(() => (lang ? getLessonProgressByLang(lang) : undefined), [lang]);

  if (!content || !progress) {
    return (
      <Screen title={t("lessons.title")} action={<SettingsLink />}>
        <LanguageSwitcher />
        <p className="text-slate-600 dark:text-slate-400">{t("common.loading")}</p>
      </Screen>
    );
  }

  const knownLang = profile?.knownLangs[0] ?? "en";
  const completedIds = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
  const lessonsById = new Map(content.lessons.map((l) => [l.id, l]));

  return (
    <Screen title={t("lessons.title")} action={<SettingsLink />}>
      <LanguageSwitcher />
      <p className="mb-4 text-sm text-slate-500">{localizedCourseTitle(content.course, knownLang)}</p>

      <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("lessons.grammar")}</h2>
      <div className="space-y-6">
        {content.units.map((unit) => (
          <div key={unit.id}>
            <h3 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{localizedUnitTitle(unit, knownLang)}</h3>
            <div className="space-y-2">
              {unit.lessonIds.map((lessonId) => {
                const lesson = lessonsById.get(lessonId);
                if (!lesson) return null;
                const done = completedIds.has(lessonId);
                return (
                  <button
                    key={lessonId}
                    onClick={() => navigate(`/lessons/${lessonId}`)}
                    className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-left hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <span>{localizedLessonTitle(lesson, knownLang)}</span>
                    <span>{done ? "✅" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

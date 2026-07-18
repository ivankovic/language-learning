import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { getLessonProgressByLang } from "../../db/queries/lessonProgress";
import { Screen, SettingsLink } from "../../components/Screen";

export function LessonTree() {
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const content = useLanguageContent(lang);
  const progress = useLiveQuery(() => (lang ? getLessonProgressByLang(lang) : undefined), [lang]);

  if (!content || !progress) {
    return (
      <Screen title="Lessons" action={<SettingsLink />}>
        <p className="text-slate-400">Loading…</p>
      </Screen>
    );
  }

  const completedIds = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
  const lessonsById = new Map(content.lessons.map((l) => [l.id, l]));

  return (
    <Screen title="Lessons" action={<SettingsLink />}>
      <p className="mb-4 text-sm text-slate-500">{content.course.title} · {content.course.level}</p>
      <div className="space-y-6">
        {content.units.map((unit) => (
          <div key={unit.id}>
            <h2 className="mb-2 text-sm font-medium text-slate-400">{unit.title}</h2>
            <div className="space-y-2">
              {unit.lessonIds.map((lessonId) => {
                const lesson = lessonsById.get(lessonId);
                if (!lesson) return null;
                const done = completedIds.has(lessonId);
                return (
                  <button
                    key={lessonId}
                    onClick={() => navigate(`/lessons/${lessonId}`)}
                    className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-left hover:bg-slate-800"
                  >
                    <span>{lesson.title}</span>
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

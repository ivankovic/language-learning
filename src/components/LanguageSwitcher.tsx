import { useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { languages } from "../content/languages";
import { hasContentBundle, loadLanguageContent } from "../content/loader";
import { setActiveTargetLang, addTargetLang } from "../db/queries/profile";
import { startLesson } from "../db/queries/lessonProgress";

/** Chips for each language the user is learning in parallel, plus "+" to add another. Shown on Home/Lessons/Journal/Progress — not on sub-flow screens (Practice, lesson/journal detail), where switching mid-task would be disruptive. */
export function LanguageSwitcher() {
  const profile = useProfile();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!profile) return null;

  const addableLanguages = languages.filter(
    (l) => hasContentBundle(l.code) && !profile.targetLangs.includes(l.code) && !profile.knownLangs.includes(l.code),
  );

  async function addLanguage(code: string) {
    setBusy(true);
    const content = await loadLanguageContent(code);
    const firstUnit = content.units.find((u) => u.id === content.course.unitIds[0]);
    const firstLessonId = firstUnit?.lessonIds[0];
    await addTargetLang(code);
    if (firstLessonId) await startLesson(firstLessonId, code);
    setBusy(false);
    setAdding(false);
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {profile.targetLangs.map((code) => {
          const lang = languages.find((l) => l.code === code);
          const isActive = code === profile.activeTargetLang;
          return (
            <button
              key={code}
              onClick={() => setActiveTargetLang(code)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                isActive
                  ? "bg-sky-500 text-slate-950"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {lang?.flag ? `${lang.flag} ` : ""}
              {lang?.name ?? code}
            </button>
          );
        })}
        {addableLanguages.length > 0 && (
          <button
            onClick={() => setAdding((a) => !a)}
            aria-label="Add a language"
            className="rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            +
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-2 space-y-1.5">
          {addableLanguages.map((l) => (
            <button
              key={l.code}
              disabled={busy}
              onClick={() => addLanguage(l.code)}
              className="block w-full rounded-xl bg-slate-100 px-4 py-2.5 text-left text-sm dark:bg-slate-900"
            >
              {busy ? "Adding…" : `Learn ${l.flag ? `${l.flag} ` : ""}${l.name}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

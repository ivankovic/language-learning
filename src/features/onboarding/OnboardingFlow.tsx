import { useState } from "react";
import { languages } from "../../content/languages";
import { hasContentBundle, loadLanguageContent } from "../../content/loader";
import { createProfile } from "../../db/queries/profile";
import { startLesson } from "../../db/queries/lessonProgress";
import { Button } from "../../components/Button";

type Step = "known" | "target" | "course" | "explainer";

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("known");
  const [knownLangs, setKnownLangs] = useState<string[]>(["en"]);
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [startWithCourse, setStartWithCourse] = useState(true);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const targetOptions = languages.filter((l) => hasContentBundle(l.code) && !knownLangs.includes(l.code));

  async function selectTarget(code: string) {
    setTargetLang(code);
    const content = await loadLanguageContent(code);
    setCourseTitle(content.course.title);
    const firstUnit = content.units.find((u) => u.id === content.course.unitIds[0]);
    setFirstLessonId(firstUnit?.lessonIds[0] ?? null);
    setStep("course");
  }

  async function finish() {
    if (!targetLang) return;
    setSubmitting(true);
    await createProfile({
      knownLangs,
      targetLangs: [targetLang],
      activeTargetLang: targetLang,
    });
    if (startWithCourse && firstLessonId) {
      await startLesson(firstLessonId, targetLang);
    }
    // No further action needed — App.tsx's useProfile live-query will pick
    // up the new profile row and swap Onboarding out for the tabbed app.
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div>
        <p className="mb-8 text-sm text-slate-500">Step {["known", "target", "course", "explainer"].indexOf(step) + 1} of 4</p>

        {step === "known" && (
          <div>
            <h1 className="mb-2 text-2xl font-semibold">Which language(s) do you already know?</h1>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">This is what we'll translate into and explain grammar in.</p>
            <div className="space-y-2">
              {languages.map((lang) => (
                <label key={lang.code} className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={knownLangs.includes(lang.code)}
                    onChange={(e) =>
                      setKnownLangs((prev) =>
                        e.target.checked ? [...prev, lang.code] : prev.filter((c) => c !== lang.code),
                      )
                    }
                  />
                  {lang.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === "target" && (
          <div>
            <h1 className="mb-2 text-2xl font-semibold">Which language do you want to learn?</h1>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Content is available for the languages below.</p>
            <div className="space-y-2">
              {targetOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => selectTarget(lang.code)}
                  className="w-full rounded-xl bg-slate-100 px-4 py-3 text-left hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  {lang.name}
                </button>
              ))}
              {targetOptions.length === 0 && (
                <p className="text-sm text-slate-500">No target languages available for the language(s) you selected.</p>
              )}
            </div>
          </div>
        )}

        {step === "course" && (
          <div>
            <h1 className="mb-2 text-2xl font-semibold">Ready to start?</h1>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setStartWithCourse(true);
                  setStep("explainer");
                }}
                className="w-full rounded-xl bg-sky-50 border border-sky-500 px-4 py-3 text-left text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
              >
                Start with <strong>{courseTitle}</strong>
              </button>
              <button
                onClick={() => {
                  setStartWithCourse(false);
                  setStep("explainer");
                }}
                className="w-full rounded-xl bg-slate-100 px-4 py-3 text-left hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                Start from scratch (browse decks/lessons myself)
              </button>
            </div>
          </div>
        )}

        {step === "explainer" && (
          <div>
            <h1 className="mb-2 text-2xl font-semibold">Your data stays on this device</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              There's no account and no server — everything you do is stored locally in this browser. Back up
              your progress anytime from Settings by exporting it to a file, and restore it the same way on
              another device.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step !== "known" && (
          <Button
            variant="secondary"
            onClick={() => setStep((s) => (s === "target" ? "known" : s === "course" ? "target" : "course"))}
          >
            Back
          </Button>
        )}
        {step === "known" && (
          <Button className="flex-1" disabled={knownLangs.length === 0} onClick={() => setStep("target")}>
            Next
          </Button>
        )}
        {step === "explainer" && (
          <Button className="flex-1" disabled={submitting} onClick={finish}>
            {submitting ? "Setting up…" : "Get started"}
          </Button>
        )}
      </div>
    </div>
  );
}

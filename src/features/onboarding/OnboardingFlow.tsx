import { useState } from "react";
import { languages } from "../../content/languages";
import { hasContentBundle, loadLanguageContent } from "../../content/loader";
import { createProfile } from "../../db/queries/profile";
import { startLesson } from "../../db/queries/lessonProgress";
import { Button } from "../../components/Button";
import { translate, isUiLang, type TranslationKey } from "../../i18n/dictionary";
import { detectInitialUiLang } from "../../i18n/detectLang";
import { localizedLanguageName } from "../../i18n/languageNames";

type Step = "known" | "target" | "explainer";

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("known");
  const [knownLang, setKnownLang] = useState<string>(() => detectInitialUiLang());
  // Onboarding has no profile row yet, so useT()'s profile-driven language
  // can't see the learner's in-progress known-language selection — the UI
  // language here follows local state instead, switching live as they pick.
  const uiLang = isUiLang(knownLang) ? knownLang : detectInitialUiLang();
  const t = (key: TranslationKey, vars?: Record<string, string | number>) => translate(uiLang, key, vars);
  const [targetLangs, setTargetLangs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const targetOptions = languages.filter((l) => hasContentBundle(l.code) && l.code !== knownLang);

  function toggleTarget(code: string) {
    setTargetLangs((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function finish() {
    if (targetLangs.length === 0) return;
    setSubmitting(true);
    await createProfile({
      knownLangs: [knownLang],
      targetLangs,
      activeTargetLang: targetLangs[0],
    });
    // Seed lesson 1 as in-progress for every selected target language, so
    // Home/Practice have somewhere to pick up immediately after onboarding.
    await Promise.all(
      targetLangs.map(async (lang) => {
        const content = await loadLanguageContent(lang);
        const firstUnit = content.units.find((u) => u.id === content.course.unitIds[0]);
        const firstLessonId = firstUnit?.lessonIds[0];
        if (firstLessonId) await startLesson(firstLessonId, lang);
      }),
    );
    // No further action needed — App.tsx's useProfile live-query will pick
    // up the new profile row and swap Onboarding out for the tabbed app.
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div>
        <p className="mb-8 text-sm text-slate-500">
          {t("onboarding.stepOf", { n: ["known", "target", "explainer"].indexOf(step) + 1 })}
        </p>

        {step === "known" && (
          <div>
            <h1 className="mb-2 text-2xl font-semibold">{t("onboarding.knownTitle")}</h1>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{t("onboarding.knownDesc")}</p>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setKnownLang(lang.code)}
                  className={
                    knownLang === lang.code
                      ? "w-full rounded-xl border border-sky-500 bg-sky-50 px-4 py-3 text-left text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                      : "w-full rounded-xl bg-slate-100 px-4 py-3 text-left hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }
                >
                  {lang.flag ? `${lang.flag} ` : ""}
                  {localizedLanguageName(lang.code, uiLang)}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "target" && (
          <div>
            <h1 className="mb-2 text-2xl font-semibold">{t("onboarding.targetTitle")}</h1>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{t("onboarding.targetDesc")}</p>
            <div className="space-y-2">
              {targetOptions.map((lang) => (
                <label key={lang.code} className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={targetLangs.includes(lang.code)}
                    onChange={() => toggleTarget(lang.code)}
                  />
                  {lang.flag ? `${lang.flag} ` : ""}
                  {localizedLanguageName(lang.code, uiLang)}
                </label>
              ))}
              {targetOptions.length === 0 && (
                <p className="text-sm text-slate-500">{t("onboarding.noTargetAvailable")}</p>
              )}
            </div>
          </div>
        )}

        {step === "explainer" && (
          <div>
            <h1 className="mb-2 text-2xl font-semibold">{t("onboarding.dataStaysTitle")}</h1>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t("onboarding.dataStaysDesc")}</p>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{t("onboarding.dataStaysWarning")}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step !== "known" && (
          <Button variant="secondary" onClick={() => setStep((s) => (s === "target" ? "known" : "target"))}>
            {t("onboarding.back")}
          </Button>
        )}
        {step === "known" && (
          <Button className="flex-1" onClick={() => setStep("target")}>
            {t("onboarding.next")}
          </Button>
        )}
        {step === "target" && (
          <Button className="flex-1" disabled={targetLangs.length === 0} onClick={() => setStep("explainer")}>
            {t("onboarding.next")}
          </Button>
        )}
        {step === "explainer" && (
          <Button className="flex-1" disabled={submitting} onClick={finish}>
            {submitting ? t("onboarding.settingUp") : t("onboarding.getStarted")}
          </Button>
        )}
      </div>
    </div>
  );
}

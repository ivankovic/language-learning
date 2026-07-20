import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { updateProfile } from "../../db/queries/profile";
import { db } from "../../db";
import { detectAssistant } from "../../ai/assistant";
import { useTheme } from "../../theme/useTheme";
import type { ThemePreference } from "../../theme/theme";
import { languages } from "../../content/languages";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useT, useUiLang } from "../../i18n/useT";
import { localizedLanguageName } from "../../i18n/languageNames";
import type { TranslationKey } from "../../i18n/dictionary";

const INTERVAL_OPTIONS: { value: 1 | 3 | 7 | null; key: TranslationKey }[] = [
  { value: 1, key: "settings.everyDay" },
  { value: 3, key: "settings.every3Days" },
  { value: 7, key: "settings.everyWeek" },
  { value: null, key: "settings.manualOnly" },
];

const THEME_OPTIONS: { value: ThemePreference; key: TranslationKey }[] = [
  { value: "system", key: "settings.themeSystem" },
  { value: "light", key: "settings.themeLight" },
  { value: "dark", key: "settings.themeDark" },
];

type ExportBundle = {
  version: 1;
  exportedAt: string;
  profile: unknown[];
  cardStates: unknown[];
  lessonProgress: unknown[];
  journalEntries: unknown[];
  dailyActivity: unknown[];
};

type AiStatus = "checking" | "available" | "unavailable";
type ImportStatus = "invalidJson" | "invalidShape" | "complete" | null;

export function SettingsScreen() {
  const t = useT();
  const uiLang = useUiLang();
  const navigate = useNavigate();
  const profile = useProfile();
  const [theme, setTheme] = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus>("checking");

  useEffect(() => {
    detectAssistant().then((a) => setAiStatus(a.capability === "chrome-builtin" ? "available" : "unavailable"));
  }, []);

  // Moves `code` to the front of knownLangs (adding it if new) — index 0 is
  // what drives the UI language and vocab/lesson translation lookups.
  async function setPrimaryKnownLang(code: string) {
    if (!profile) return;
    const rest = profile.knownLangs.filter((c) => c !== code);
    await updateProfile({ knownLangs: [code, ...rest] });
  }

  async function exportData() {
    const bundle: ExportBundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: await db.profile.toArray(),
      cardStates: await db.cardStates.toArray(),
      lessonProgress: await db.lessonProgress.toArray(),
      journalEntries: await db.journalEntries.toArray(),
      dailyActivity: await db.dailyActivity.toArray(),
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `language-learning-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file: File) {
    const text = await file.text();
    let bundle: ExportBundle;
    try {
      bundle = JSON.parse(text);
    } catch {
      setImportStatus("invalidJson");
      return;
    }
    const requiredKeys: (keyof ExportBundle)[] = ["profile", "cardStates", "lessonProgress", "journalEntries", "dailyActivity"];
    if (!requiredKeys.every((k) => Array.isArray(bundle[k]))) {
      setImportStatus("invalidShape");
      return;
    }
    const confirmed = window.confirm(t("settings.importConfirm"));
    if (!confirmed) return;

    await db.transaction("rw", [db.profile, db.cardStates, db.lessonProgress, db.journalEntries, db.dailyActivity], async () => {
      await Promise.all([
        db.profile.clear(),
        db.cardStates.clear(),
        db.lessonProgress.clear(),
        db.journalEntries.clear(),
        db.dailyActivity.clear(),
      ]);
      await Promise.all([
        db.profile.bulkPut(bundle.profile as never[]),
        db.cardStates.bulkPut(bundle.cardStates as never[]),
        db.lessonProgress.bulkPut(bundle.lessonProgress as never[]),
        db.journalEntries.bulkPut(bundle.journalEntries as never[]),
        db.dailyActivity.bulkPut(bundle.dailyActivity as never[]),
      ]);
    });
    setImportStatus("complete");
  }

  if (!profile) {
    return (
      <Screen title={t("settings.title")}>
        <p className="text-slate-600 dark:text-slate-400">{t("common.loading")}</p>
      </Screen>
    );
  }

  const importStatusText =
    importStatus === "invalidJson"
      ? t("settings.importInvalidJson")
      : importStatus === "invalidShape"
        ? t("settings.importInvalidShape")
        : importStatus === "complete"
          ? t("settings.importComplete")
          : null;

  const aiStatusText =
    aiStatus === "checking" ? t("settings.aiChecking") : aiStatus === "available" ? t("settings.aiAvailable") : t("settings.aiUnavailable");

  return (
    <Screen title={t("settings.title")}>
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        {t("common.back")}
      </button>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("settings.languages")}</h2>
        <p className="mb-3 text-slate-700 dark:text-slate-300">
          {t("settings.learningFrom", {
            target: profile.targetLangs.map((code) => localizedLanguageName(code, uiLang)).join(", "),
            known: profile.knownLangs.map((code) => localizedLanguageName(code, uiLang)).join(", "),
          })}
        </p>
        <LanguageSwitcher />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("settings.knownLanguage")}</h2>
        <p className="mb-3 text-xs text-slate-500">{t("settings.knownLanguageDesc")}</p>
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setPrimaryKnownLang(l.code)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                profile.knownLangs[0] === l.code
                  ? "bg-sky-500 text-slate-950"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {l.flag ? `${l.flag} ` : ""}
              {localizedLanguageName(l.code, uiLang)}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("settings.theme")}</h2>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 rounded-xl px-4 py-3 text-center ${
                theme === opt.value
                  ? "bg-sky-50 ring-1 ring-sky-500 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                  : "bg-slate-100 dark:bg-slate-900"
              }`}
            >
              {t(opt.key)}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("settings.journalFrequency")}</h2>
        <div className="space-y-2">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => updateProfile({ journalIntervalDays: opt.value })}
              className={`w-full rounded-xl px-4 py-3 text-left ${
                profile.journalIntervalDays === opt.value
                  ? "bg-sky-50 ring-1 ring-sky-500 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                  : "bg-slate-100 dark:bg-slate-900"
              }`}
            >
              {t(opt.key)}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("settings.onDeviceAi")}</h2>
        <p className="text-slate-700 dark:text-slate-300">{aiStatusText}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{t("settings.backupRestore")}</h2>
        <p className="mb-3 text-xs text-slate-500">{t("settings.backupDesc")}</p>
        <Button variant="secondary" className="mb-2 w-full" onClick={exportData}>
          {t("settings.exportBackup")}
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()}>
          {t("settings.importBackup")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importData(file);
            e.target.value = "";
          }}
        />
        {importStatusText && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{importStatusText}</p>}
      </section>

      <section className="mt-8">
        <button
          onClick={() => navigate("/about")}
          className="w-full rounded-xl bg-slate-100 px-4 py-3 text-left dark:bg-slate-900"
        >
          {t("settings.aboutThisApp")}
        </button>
      </section>
    </Screen>
  );
}

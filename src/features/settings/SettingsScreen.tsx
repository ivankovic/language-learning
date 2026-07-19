import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { updateProfile } from "../../db/queries/profile";
import { db } from "../../db";
import { detectAssistant } from "../../ai/assistant";
import { useTheme } from "../../theme/useTheme";
import type { ThemePreference } from "../../theme/theme";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";

const INTERVAL_OPTIONS: { value: 1 | 3 | 7 | null; label: string }[] = [
  { value: 1, label: "Every day" },
  { value: 3, label: "Every 3 days" },
  { value: 7, label: "Every week" },
  { value: null, label: "Manual only" },
];

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
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

export function SettingsScreen() {
  const navigate = useNavigate();
  const profile = useProfile();
  const [theme, setTheme] = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string>("Checking…");

  useEffect(() => {
    detectAssistant().then((a) =>
      setAiStatus(a.capability === "chrome-builtin" ? "Available (on-device)" : "Not available in this browser"),
    );
  }, []);

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
      setImportStatus("That file isn't valid JSON.");
      return;
    }
    const requiredKeys: (keyof ExportBundle)[] = ["profile", "cardStates", "lessonProgress", "journalEntries", "dailyActivity"];
    if (!requiredKeys.every((k) => Array.isArray(bundle[k]))) {
      setImportStatus("That file doesn't look like a Language Learning backup.");
      return;
    }
    const confirmed = window.confirm(
      "Importing will replace all your current progress on this device with the contents of this file. Continue?",
    );
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
    setImportStatus("Import complete.");
  }

  if (!profile) {
    return (
      <Screen title="Settings">
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      </Screen>
    );
  }

  return (
    <Screen title="Settings">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        ← Back
      </button>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Languages</h2>
        <p className="text-slate-700 dark:text-slate-300">
          Learning <strong>{profile.activeTargetLang.toUpperCase()}</strong> from{" "}
          <strong>{profile.knownLangs.join(", ").toUpperCase()}</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Theme</h2>
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
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Journal prompt frequency</h2>
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
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">On-device AI (Journal feedback)</h2>
        <p className="text-slate-700 dark:text-slate-300">{aiStatus}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Backup & restore</h2>
        <p className="mb-3 text-xs text-slate-500">
          Your data lives only on this device. Export a backup regularly, and use it to restore your progress on
          another device or browser.
        </p>
        <Button variant="secondary" className="mb-2 w-full" onClick={exportData}>
          Export backup
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()}>
          Import backup
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
        {importStatus && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{importStatus}</p>}
      </section>
    </Screen>
  );
}

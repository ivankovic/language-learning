import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useProfile } from "../../hooks/useProfile";
import { listCompleteEntries, deleteEntry } from "../../db/queries/journal";
import { Screen, SettingsLink } from "../../components/Screen";
import { Button } from "../../components/Button";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useT } from "../../i18n/useT";

export function JournalList() {
  const t = useT();
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const entries = useLiveQuery(() => (lang ? listCompleteEntries(lang) : undefined), [lang]);

  async function remove(id: string) {
    if (!window.confirm(t("journal.deleteConfirm"))) return;
    await deleteEntry(id);
  }

  return (
    <Screen title={t("journal.title")} action={<SettingsLink />}>
      <LanguageSwitcher />
      <Button className="mb-3 w-full" onClick={() => navigate("/journal/new")}>
        {t("journal.write")}
      </Button>
      <Button variant="secondary" className="mb-6 w-full" onClick={() => navigate("/journal/remember")}>
        {t("journal.remember")}
      </Button>

      {entries?.length === 0 && <p className="text-slate-500">{t("journal.noEntries")}</p>}

      <div className="space-y-2">
        {entries?.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900">
            <button
              onClick={() => navigate(`/journal/${entry.id}`)}
              className="min-w-0 flex-1 px-4 py-3 text-left"
            >
              <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
              <p className="truncate">{entry.originalText}</p>
              {entry.aiFeedback && <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">{t("journal.hasAiFeedback")}</p>}
            </button>
            <button
              onClick={() => remove(entry.id)}
              aria-label={t("journal.deleteEntryAria")}
              className="mr-3 shrink-0 text-rose-600 dark:text-rose-400"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </Screen>
  );
}

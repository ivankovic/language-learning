import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useProfile } from "../../hooks/useProfile";
import { listCompleteEntries } from "../../db/queries/journal";
import { Screen, SettingsLink } from "../../components/Screen";
import { Button } from "../../components/Button";

export function JournalList() {
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const entries = useLiveQuery(() => (lang ? listCompleteEntries(lang) : undefined), [lang]);

  return (
    <Screen title="Journal" action={<SettingsLink />}>
      <Button className="mb-6 w-full" onClick={() => navigate("/journal/new")}>
        Write journal entry
      </Button>

      {entries?.length === 0 && <p className="text-slate-500">No entries yet — write your first one above.</p>}

      <div className="space-y-2">
        {entries?.map((entry) => (
          <button
            key={entry.id}
            onClick={() => navigate(`/journal/${entry.id}`)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left"
          >
            <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
            <p className="truncate">{entry.originalText}</p>
            {entry.aiFeedback && <p className="mt-1 text-xs text-sky-400">Has AI feedback</p>}
          </button>
        ))}
      </div>
    </Screen>
  );
}

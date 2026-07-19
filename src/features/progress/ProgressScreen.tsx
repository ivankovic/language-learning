import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { getActivityRange } from "../../db/queries/activity";
import { getCardStatesByLang } from "../../db/queries/cardStates";
import { listCompleteEntries } from "../../db/queries/journal";
import { Screen, SettingsLink } from "../../components/Screen";
import type { CardLifecycleState } from "../../types/user";

const STATE_COLORS: Record<CardLifecycleState, string> = {
  new: "bg-slate-300 dark:bg-slate-700",
  learning: "bg-amber-500",
  relearning: "bg-rose-500",
  review: "bg-emerald-500",
};

export function ProgressScreen() {
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const content = useLanguageContent(lang);

  const activity = useLiveQuery(() => getActivityRange(28), [], undefined);
  const cardStates = useLiveQuery(() => (lang ? getCardStatesByLang(lang) : undefined), [lang]);
  const journalEntries = useLiveQuery(() => (lang ? listCompleteEntries(lang) : undefined), [lang]);

  const deckStats = useMemo(() => {
    if (!content || !cardStates) return [];
    const stateByItemId = new Map(cardStates.map((c) => [c.itemId, c.state]));
    return content.decks.map((deck) => {
      const counts: Record<CardLifecycleState, number> = { new: 0, learning: 0, review: 0, relearning: 0 };
      for (const itemId of deck.itemIds) {
        const state = stateByItemId.get(itemId);
        if (state) counts[state]++;
        else counts.new++; // never reviewed = not yet tracked = still "new"
      }
      return { deck, counts, total: deck.itemIds.length };
    });
  }, [content, cardStates]);

  const forecast = useMemo(() => {
    if (!cardStates) return [];
    const days: { label: string; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() + i);
      const dayKey = day.toISOString().slice(0, 10);
      const count = cardStates.filter((c) => c.due.slice(0, 10) === dayKey).length;
      days.push({ label: i === 0 ? "Today" : day.toLocaleDateString(undefined, { weekday: "short" }), count });
    }
    return days;
  }, [cardStates]);

  const maxForecast = Math.max(1, ...forecast.map((d) => d.count));

  if (!content || !activity || !cardStates) {
    return (
      <Screen title="Progress" action={<SettingsLink />}>
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      </Screen>
    );
  }

  return (
    <Screen title="Progress" action={<SettingsLink />}>
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Last 28 days</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {activity.map((day) => {
            const active = day.reviewsCount + day.lessonsCompleted + day.journalEntriesCompleted > 0;
            return (
              <div
                key={day.date}
                title={day.date}
                className={`aspect-square rounded ${active ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-900"}`}
              />
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Review forecast</h2>
        <div className="flex items-end gap-2" style={{ height: 80 }}>
          {forecast.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-sky-500"
                style={{ height: `${(d.count / maxForecast) * 60}px`, minHeight: d.count > 0 ? 4 : 0 }}
              />
              <p className="text-[10px] text-slate-500">{d.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Deck mastery</h2>
        <div className="space-y-3">
          {deckStats.map(({ deck, counts, total }) => (
            <div key={deck.id}>
              <p className="mb-1 text-sm">{deck.title}</p>
              <div className="flex h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900">
                {(Object.keys(counts) as CardLifecycleState[]).map((state) => (
                  <div
                    key={state}
                    className={STATE_COLORS[state]}
                    style={{ width: `${(counts[state] / total) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Journal</h2>
        <p className="text-slate-700 dark:text-slate-300">{journalEntries?.length ?? 0} entries written</p>
      </section>
    </Screen>
  );
}

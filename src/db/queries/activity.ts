import { db } from "../index";
import type { DailyActivity } from "../../types/user";

/** Local-time "YYYY-MM-DD" key, not UTC — a day boundary should match the user's wall clock. */
export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyActivity(date: string): DailyActivity {
  return { date, reviewsCount: 0, newCardsIntroduced: 0, lessonsCompleted: 0, journalEntriesCompleted: 0 };
}

export async function getActivity(date: string): Promise<DailyActivity> {
  return (await db.dailyActivity.get(date)) ?? emptyActivity(date);
}

export function getToday(): Promise<DailyActivity> {
  return getActivity(dateKey());
}

export async function incrementToday(delta: Partial<Omit<DailyActivity, "date">>): Promise<DailyActivity> {
  const today = dateKey();
  const current = await getActivity(today);
  const updated: DailyActivity = {
    date: today,
    reviewsCount: current.reviewsCount + (delta.reviewsCount ?? 0),
    newCardsIntroduced: current.newCardsIntroduced + (delta.newCardsIntroduced ?? 0),
    lessonsCompleted: current.lessonsCompleted + (delta.lessonsCompleted ?? 0),
    journalEntriesCompleted: current.journalEntriesCompleted + (delta.journalEntriesCompleted ?? 0),
  };
  await db.dailyActivity.put(updated);
  return updated;
}

export async function getActivityRange(days: number, end = new Date()): Promise<DailyActivity[]> {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    keys.push(dateKey(d));
  }
  const rows = await db.dailyActivity.bulkGet(keys);
  return keys.map((key, i) => rows[i] ?? emptyActivity(key));
}

/** Consecutive days (ending today or yesterday) with at least one review/lesson/journal action. */
export async function computeStreak(): Promise<number> {
  const recent = await getActivityRange(365);
  const isActive = (a: DailyActivity) => a.reviewsCount + a.lessonsCompleted + a.journalEntriesCompleted > 0;
  let streak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (isActive(recent[i])) {
      streak++;
    } else if (i === recent.length - 1) {
      // today has no activity yet — that's fine, don't break the streak on today alone
      continue;
    } else {
      break;
    }
  }
  return streak;
}

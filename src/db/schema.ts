import Dexie, { type Table } from "dexie";
import type { UserProfile, CardState, LessonProgress, JournalEntry, DailyActivity } from "../types/user";

export class LanguageLearningDB extends Dexie {
  profile!: Table<UserProfile, string>;
  cardStates!: Table<CardState, string>;
  lessonProgress!: Table<LessonProgress, string>;
  journalEntries!: Table<JournalEntry, string>;
  dailyActivity!: Table<DailyActivity, [string, string]>;

  constructor() {
    super("language-learning");
    this.version(1).stores({
      profile: "id",
      cardStates: "itemId, lang, state, due",
      lessonProgress: "lessonId, lang, completedAt",
      journalEntries: "id, createdAt, status, targetLang",
      dailyActivity: "date",
    });

    // v2 -> v3: dailyActivity gains a compound [date+lang] primary key
    // (parallel multi-language support — a date-only key conflated two
    // languages studied on the same day into one counter). Dexie does not
    // support changing a table's primary key in place ("Not yet support for
    // changing primary key") — the documented workaround is this two-step
    // rename dance: v2 deletes the old table and stages a temp table with
    // the new key shape (copying data across, backfilled with the profile's
    // activeTargetLang since pre-v2 rows never recorded which language they
    // were for); v3 deletes the temp table and recreates the original name
    // fresh with the new shape. Both steps only ever add-or-delete a given
    // name in a single version, never both at once, which Dexie does support.
    this.version(2)
      .stores({
        profile: "id",
        cardStates: "itemId, lang, state, due",
        lessonProgress: "lessonId, lang, completedAt",
        journalEntries: "id, createdAt, status, targetLang",
        dailyActivity: null,
        dailyActivityTmp: "[date+lang], date, lang",
      })
      .upgrade(async (tx) => {
        const profile = await tx.table("profile").get("singleton");
        const lang = profile?.activeTargetLang;
        if (!lang) return; // no profile yet (fresh install) — nothing to migrate
        const oldRows = await tx.table("dailyActivity").toArray();
        await tx.table("dailyActivityTmp").bulkPut(oldRows.map((row) => ({ ...row, lang })));
      });

    this.version(3)
      .stores({
        profile: "id",
        cardStates: "itemId, lang, state, due",
        lessonProgress: "lessonId, lang, completedAt",
        journalEntries: "id, createdAt, status, targetLang",
        dailyActivityTmp: null,
        dailyActivity: "[date+lang], date, lang",
      })
      .upgrade(async (tx) => {
        const rows = await tx.table("dailyActivityTmp").toArray();
        await tx.table("dailyActivity").bulkPut(rows);
      });
  }
}

import Dexie, { type Table } from "dexie";
import type { UserProfile, CardState, LessonProgress, JournalEntry, DailyActivity } from "../types/user";

export class LanguageLearningDB extends Dexie {
  profile!: Table<UserProfile, string>;
  cardStates!: Table<CardState, string>;
  lessonProgress!: Table<LessonProgress, string>;
  journalEntries!: Table<JournalEntry, string>;
  dailyActivity!: Table<DailyActivity, string>;

  constructor() {
    super("language-learning");
    this.version(1).stores({
      profile: "id",
      cardStates: "itemId, lang, state, due",
      lessonProgress: "lessonId, lang, completedAt",
      journalEntries: "id, createdAt, status, targetLang",
      dailyActivity: "date",
    });
  }
}

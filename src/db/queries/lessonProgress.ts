import { db } from "../index";
import type { LessonProgress } from "../../types/user";

export function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
  return db.lessonProgress.get(lessonId);
}

export function getLessonProgressByLang(lang: string): Promise<LessonProgress[]> {
  return db.lessonProgress.where("lang").equals(lang).toArray();
}

export async function startLesson(lessonId: string, lang: string): Promise<LessonProgress> {
  const existing = await db.lessonProgress.get(lessonId);
  if (existing) return existing;
  const progress: LessonProgress = {
    lessonId,
    lang,
    startedAt: new Date().toISOString(),
    exerciseResults: {},
  };
  await db.lessonProgress.put(progress);
  return progress;
}

export async function recordExerciseResult(lessonId: string, exerciseId: string, correct: boolean): Promise<void> {
  const existing = await db.lessonProgress.get(lessonId);
  if (!existing) throw new Error(`No lesson progress row for "${lessonId}" — call startLesson first`);
  existing.exerciseResults[exerciseId] = correct;
  await db.lessonProgress.put(existing);
}

export async function completeLesson(lessonId: string): Promise<void> {
  await db.lessonProgress.update(lessonId, { completedAt: new Date().toISOString() });
}

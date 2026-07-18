import { db } from "../index";
import type { UserProfile } from "../../types/user";

export function getProfile(): Promise<UserProfile | undefined> {
  return db.profile.get("singleton");
}

export async function createProfile(input: {
  knownLangs: string[];
  targetLangs: string[];
  activeTargetLang: string;
  dailyGoal?: number;
  dailyNewCardLimit?: number;
  journalIntervalDays?: 1 | 3 | 7 | null;
}): Promise<UserProfile> {
  const profile: UserProfile = {
    id: "singleton",
    knownLangs: input.knownLangs,
    targetLangs: input.targetLangs,
    activeTargetLang: input.activeTargetLang,
    dailyGoal: input.dailyGoal ?? 20,
    dailyNewCardLimit: input.dailyNewCardLimit ?? 10,
    journalIntervalDays: input.journalIntervalDays ?? 3,
    createdAt: new Date().toISOString(),
  };
  await db.profile.put(profile);
  return profile;
}

export async function updateProfile(patch: Partial<Omit<UserProfile, "id" | "createdAt">>): Promise<void> {
  await db.profile.update("singleton", patch);
}

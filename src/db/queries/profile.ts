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

/** Switches which target language is currently active (drives Home/Lessons/Journal/Progress/Practice) — does not change the set of languages being learned. */
export async function setActiveTargetLang(lang: string): Promise<void> {
  await db.profile.update("singleton", { activeTargetLang: lang });
}

/** Adds a new language to the parallel set being learned, and switches to it. No-ops if already present. */
export async function addTargetLang(lang: string): Promise<void> {
  const profile = await getProfile();
  if (!profile) throw new Error("No profile to add a target language to");
  if (profile.targetLangs.includes(lang)) {
    await setActiveTargetLang(lang);
    return;
  }
  await db.profile.update("singleton", {
    targetLangs: [...profile.targetLangs, lang],
    activeTargetLang: lang,
  });
}

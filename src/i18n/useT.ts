import { useCallback } from "react";
import { useProfile } from "../hooks/useProfile";
import { translate, isUiLang, type TranslationKey } from "./dictionary";
import { detectInitialUiLang } from "./detectLang";

export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/** UI language follows the user's first known language once onboarding is done; before that (or while `profile` is still loading) it's guessed from the browser so the onboarding screens themselves aren't stuck in English for non-English speakers. */
export function useUiLang() {
  const profile = useProfile();
  const knownLang = profile?.knownLangs[0];
  return knownLang && isUiLang(knownLang) ? knownLang : detectInitialUiLang();
}

export function useT(): TFunction {
  const lang = useUiLang();
  return useCallback((key, vars) => translate(lang, key, vars), [lang]);
}

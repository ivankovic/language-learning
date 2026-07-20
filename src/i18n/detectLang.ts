import { UI_LANGS, isUiLang, type UiLang } from "./dictionary";

/** Best-guess UI language before onboarding has run and a profile (with `knownLangs`) exists yet — otherwise the very first screen a non-English speaker sees would be unreadable. */
export function detectInitialUiLang(): UiLang {
  const candidates = typeof navigator !== "undefined" ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const code = candidate.slice(0, 2).toLowerCase();
    if (isUiLang(code)) return code;
  }
  return "en";
}

export { UI_LANGS };
export type { UiLang };

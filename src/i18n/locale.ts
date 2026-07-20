import type { UiLang } from "./dictionary";

// BCP-47 locale for each supported UI language, used for Intl/toLocaleDateString
// calls so dates read naturally (weekday names, month order) in the user's
// known language rather than always falling back to the browser default.
const LOCALE_MAP: Record<UiLang, string> = {
  en: "en-US",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  hr: "hr-HR",
  es: "es-ES",
};

export function localeFor(lang: UiLang): string {
  return LOCALE_MAP[lang];
}

import type { UiLang } from "./dictionary";
import { getLanguage } from "../content/languages";

// Display name for each of the app's 6 supported languages, in each of the 6
// supported UI languages — e.g. "Italian" shown to an English speaker vs.
// "Talijanski" shown to a Croatian speaker. Bounded (6x6) so it's hand-written
// here rather than folded into the main UI dictionary.
const LANGUAGE_NAMES: Record<string, Record<UiLang, string>> = {
  en: { en: "English", it: "Inglese", fr: "Anglais", de: "Englisch", hr: "Engleski", es: "Inglés" },
  it: { en: "Italian", it: "Italiano", fr: "Italien", de: "Italienisch", hr: "Talijanski", es: "Italiano" },
  fr: { en: "French", it: "Francese", fr: "Français", de: "Französisch", hr: "Francuski", es: "Francés" },
  de: { en: "German", it: "Tedesco", fr: "Allemand", de: "Deutsch", hr: "Njemački", es: "Alemán" },
  hr: { en: "Croatian", it: "Croato", fr: "Croate", de: "Kroatisch", hr: "Hrvatski", es: "Croata" },
  es: { en: "Spanish", it: "Spagnolo", fr: "Espagnol", de: "Spanisch", hr: "Španjolski", es: "Español" },
  sv: { en: "Swedish", it: "Svedese", fr: "Suédois", de: "Schwedisch", hr: "Švedski", es: "Sueco" },
};

export function localizedLanguageName(code: string, uiLang: UiLang): string {
  return LANGUAGE_NAMES[code]?.[uiLang] ?? getLanguage(code)?.name ?? code;
}

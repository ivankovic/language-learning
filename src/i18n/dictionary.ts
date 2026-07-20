import { en, type TranslationKey } from "./dictionary.en";
import { it } from "./dictionary.it";
import { fr } from "./dictionary.fr";
import { de } from "./dictionary.de";
import { hr } from "./dictionary.hr";
import { es } from "./dictionary.es";

export type { TranslationKey };

export const UI_LANGS = ["en", "it", "fr", "de", "hr", "es"] as const;
export type UiLang = (typeof UI_LANGS)[number];

export function isUiLang(code: string): code is UiLang {
  return (UI_LANGS as readonly string[]).includes(code);
}

// English is always complete; other dictionaries are typed as complete too,
// but translate() below still falls back to English per-key in case a future
// key is added to en without every language being updated yet.
const dictionaries: Record<UiLang, Partial<Record<TranslationKey, string>>> = {
  en,
  it,
  fr,
  de,
  hr,
  es,
};

export function translate(lang: UiLang, key: TranslationKey, vars?: Record<string, string | number>): string {
  const template = dictionaries[lang]?.[key] ?? en[key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

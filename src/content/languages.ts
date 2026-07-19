import type { Language } from "../types/content";

// Always-loaded registry of supported languages (small, unlike vocab/lesson
// bundles which are lazy-loaded per language).
export const languages: Language[] = [
  { code: "en", name: "English", script: "latin", direction: "ltr", flag: "🇬🇧" },
  { code: "it", name: "Italian", script: "latin", direction: "ltr", ttsVoiceHint: "it-IT", flag: "🇮🇹" },
  { code: "fr", name: "French", script: "latin", direction: "ltr", ttsVoiceHint: "fr-FR", flag: "🇫🇷" },
  { code: "de", name: "German", script: "latin", direction: "ltr", ttsVoiceHint: "de-DE", flag: "🇩🇪" },
  { code: "hr", name: "Croatian", script: "latin", direction: "ltr", ttsVoiceHint: "hr-HR", flag: "🇭🇷" },
];

export function getLanguage(code: string): Language | undefined {
  return languages.find((l) => l.code === code);
}

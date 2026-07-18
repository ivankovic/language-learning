import type { VocabItem } from "../types/content";

export type DictionaryMatch = { translations: string[]; item: VocabItem };

export type DictionaryLookup = {
  lookup(word: string): DictionaryMatch | null;
};

/** Builds a case-insensitive term -> VocabItem lookup from already-loaded vocab, for the non-Chrome degraded Journal mode. Coverage is necessarily partial — only words that exist in shipped content resolve. Indexes both the target-language term and its known-language translations, so a lookup works in either direction. */
export function buildDictionaryFallback(vocab: VocabItem[], knownLang: string): DictionaryLookup {
  const map = new Map<string, DictionaryMatch>();
  for (const item of vocab) {
    const translations = item.translations[knownLang];
    if (!translations) continue;
    map.set(item.term.toLowerCase(), { translations, item });
    for (const translation of translations) {
      map.set(translation.toLowerCase(), { translations: [item.term], item });
    }
  }
  return {
    lookup(word: string) {
      return map.get(word.trim().toLowerCase()) ?? null;
    },
  };
}

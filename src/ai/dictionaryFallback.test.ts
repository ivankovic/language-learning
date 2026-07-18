import { describe, it, expect } from "vitest";
import { buildDictionaryFallback } from "./dictionaryFallback";
import type { VocabItem } from "../types/content";

const vocab: VocabItem[] = [
  { id: "1", lang: "it", term: "acqua", translations: { en: ["water"] } },
  { id: "2", lang: "it", term: "pane", translations: { en: ["bread"] } },
];

describe("buildDictionaryFallback", () => {
  it("looks up target-language term to known-language translations and the source item", () => {
    const dict = buildDictionaryFallback(vocab, "en");
    const match = dict.lookup("acqua");
    expect(match?.translations).toEqual(["water"]);
    expect(match?.item.id).toBe("1");
  });

  it("looks up known-language word back to the target term", () => {
    const dict = buildDictionaryFallback(vocab, "en");
    const match = dict.lookup("water");
    expect(match?.translations).toEqual(["acqua"]);
    expect(match?.item.id).toBe("1");
  });

  it("is case-insensitive", () => {
    const dict = buildDictionaryFallback(vocab, "en");
    expect(dict.lookup("Acqua")?.item.id).toBe("1");
    expect(dict.lookup("WATER")?.item.id).toBe("1");
  });

  it("returns null for out-of-vocab words rather than a fake translation", () => {
    const dict = buildDictionaryFallback(vocab, "en");
    expect(dict.lookup("automobile")).toBeNull();
  });
});

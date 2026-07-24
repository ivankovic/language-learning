import { describe, it, expect } from "vitest";
import { translate, UI_LANGS, isUiLang } from "./dictionary";
import { en } from "./dictionary.en";

describe("isUiLang", () => {
  it("accepts every supported code and rejects unsupported ones", () => {
    for (const lang of UI_LANGS) expect(isUiLang(lang)).toBe(true);
    expect(isUiLang("xx")).toBe(false);
  });
});

describe("translate", () => {
  it("returns the target language's string for a plain key", () => {
    expect(translate("hr", "home.learn")).toBe("Uči");
  });

  it("interpolates {var} placeholders from the vars map", () => {
    expect(translate("en", "home.reviewsToday", { count: 3, goal: 20 })).toBe("3 / 20 reviews today");
    expect(translate("de", "onboarding.stepOf", { n: 2 })).toBe("Schritt 2 von 3");
  });

  it("leaves unmatched placeholders untouched rather than throwing", () => {
    expect(translate("en", "home.reviewsToday", { count: 3 })).toBe("3 / {goal} reviews today");
  });

  it("every supported language has a non-empty translation for every English key", () => {
    for (const lang of UI_LANGS) {
      for (const key of Object.keys(en) as (keyof typeof en)[]) {
        expect(translate(lang, key), `${lang}.${key}`).toBeTruthy();
      }
    }
  });
});

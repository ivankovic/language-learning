import { describe, it, expect } from "vitest";
import { buildDeepLUrl, buildGoogleTranslateUrl } from "./translateLinks";

describe("buildDeepLUrl", () => {
  it("builds a hash-based URL with source/target/text segments", () => {
    expect(buildDeepLUrl("en", "it", "hello")).toBe("https://www.deepl.com/translator#en/it/hello");
  });

  it("URL-encodes special characters and spaces in the text", () => {
    const url = buildDeepLUrl("en", "fr", "I ate pizza & bread");
    expect(url).toBe("https://www.deepl.com/translator#en/fr/I%20ate%20pizza%20%26%20bread");
  });
});

describe("buildGoogleTranslateUrl", () => {
  it("builds a query-string URL with sl/tl/text params", () => {
    const url = buildGoogleTranslateUrl("en", "it", "hello");
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://translate.google.com/");
    expect(parsed.searchParams.get("sl")).toBe("en");
    expect(parsed.searchParams.get("tl")).toBe("it");
    expect(parsed.searchParams.get("text")).toBe("hello");
    expect(parsed.searchParams.get("op")).toBe("translate");
  });

  it("round-trips special characters through URLSearchParams encoding", () => {
    const url = buildGoogleTranslateUrl("en", "de", "I ate pizza & bread");
    const parsed = new URL(url);
    expect(parsed.searchParams.get("text")).toBe("I ate pizza & bread");
  });
});

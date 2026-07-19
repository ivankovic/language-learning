import { describe, it, expect, afterEach } from "vitest";
import { generateId } from "./generateId";

describe("generateId", () => {
  const originalRandomUUID = crypto.randomUUID;

  // randomUUID lives on Crypto.prototype in jsdom, so `delete crypto.randomUUID`
  // is a no-op (delete only removes own properties) — this failed silently
  // the first time around. Shadow it with an own property instead, matching
  // how it's actually missing in a real insecure-context browser.
  function simulateInsecureContext() {
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
  }

  afterEach(() => {
    Object.defineProperty(crypto, "randomUUID", { value: originalRandomUUID, configurable: true });
  });

  it("uses crypto.randomUUID when available", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/); // UUID v4 shape
  });

  it("falls back to a non-crypto id when crypto.randomUUID is unavailable", () => {
    // Regression test: crypto.randomUUID() is spec'd to only work in secure
    // contexts (HTTPS or localhost) — it's undefined when this app is
    // accessed over plain HTTP via a LAN IP, which crashed the Journal
    // "New Entry" screen with an uncaught TypeError and no error boundary,
    // rendering a blank page.
    simulateInsecureContext();
    expect(typeof crypto.randomUUID).toBe("undefined");

    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("fallback ids are unique across calls", () => {
    simulateInsecureContext();
    const ids = new Set(Array.from({ length: 20 }, () => generateId()));
    expect(ids.size).toBe(20);
  });
});

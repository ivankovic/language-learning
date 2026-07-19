/** Generates a local-only ID (Dexie primary key) — not a security token, so cryptographic strength doesn't matter. */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // crypto.randomUUID() is spec'd to only work in secure contexts (HTTPS or
  // localhost) — it's undefined when the app is accessed over plain HTTP via
  // a LAN IP, which this app explicitly supports (dev server on --host).
  // Falls back to a Math.random()-based id; collision risk is irrelevant for
  // a local-only primary key.
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

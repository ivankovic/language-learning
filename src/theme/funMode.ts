// Kept in sync by hand with the inline pre-paint script in index.html,
// which can't import this module (it must run before any bundle loads).
// Mirrors theme.ts's storage/apply pattern.
export const FUN_MODE_STORAGE_KEY = "fun-mode-preference";

export function getStoredFunMode(): boolean {
  return localStorage.getItem(FUN_MODE_STORAGE_KEY) === "on";
}

export function setStoredFunMode(enabled: boolean): void {
  localStorage.setItem(FUN_MODE_STORAGE_KEY, enabled ? "on" : "off");
}

/** Applies the resolved preference to the document — the `fun` class Tailwind's custom variant reads. */
export function applyFunMode(enabled: boolean): void {
  document.documentElement.classList.toggle("fun", enabled);
}

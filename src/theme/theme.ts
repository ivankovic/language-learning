// Kept in sync by hand with the inline pre-paint script in index.html,
// which can't import this module (it must run before any bundle loads).
export const THEME_STORAGE_KEY = "theme-preference";

export type ThemePreference = "light" | "dark" | "system";

const DARK_THEME_COLOR = "#0f172a"; // slate-950, matches existing dark bg
const LIGHT_THEME_COLOR = "#f8fafc"; // slate-50

export function getStoredPreference(): ThemePreference {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function setStoredPreference(pref: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, pref);
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveIsDark(pref: ThemePreference): boolean {
  return pref === "dark" || (pref === "system" && systemPrefersDark());
}

/** Applies the resolved theme to the document — the `dark` class Tailwind's custom variant reads, plus the browser-chrome theme-color meta. */
export function applyTheme(pref: ThemePreference): void {
  const isDark = resolveIsDark(pref);
  document.documentElement.classList.toggle("dark", isDark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
}

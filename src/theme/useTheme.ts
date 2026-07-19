import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredPreference,
  setStoredPreference,
  type ThemePreference,
} from "./theme";

/** Manages the Light/Dark/System preference: persists it, applies it, and stays in sync with OS changes while on "system". */
export function useTheme(): [ThemePreference, (pref: ThemePreference) => void] {
  const [preference, setPreference] = useState<ThemePreference>(() => getStoredPreference());

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const updatePreference = useCallback((pref: ThemePreference) => {
    setStoredPreference(pref);
    setPreference(pref);
  }, []);

  return [preference, updatePreference];
}

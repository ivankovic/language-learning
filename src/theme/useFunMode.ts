import { useCallback, useEffect, useState } from "react";
import { applyFunMode, getStoredFunMode, setStoredFunMode } from "./funMode";

/** Manages the Fun Mode on/off preference: persists it and applies the `fun` class to <html>. */
export function useFunMode(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(() => getStoredFunMode());

  useEffect(() => {
    applyFunMode(enabled);
  }, [enabled]);

  const updateEnabled = useCallback((value: boolean) => {
    setStoredFunMode(value);
    setEnabled(value);
  }, []);

  return [enabled, updateEnabled];
}

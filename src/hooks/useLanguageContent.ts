import { useEffect, useState } from "react";
import { loadLanguageContent, type LoadedLanguageContent } from "../content/loader";

/** `undefined` while loading, `null` on load failure. */
export function useLanguageContent(lang: string | undefined): LoadedLanguageContent | undefined | null {
  const [content, setContent] = useState<LoadedLanguageContent | undefined | null>(undefined);

  useEffect(() => {
    if (!lang) return;
    let cancelled = false;
    setContent(undefined);
    loadLanguageContent(lang)
      .then((c) => {
        if (!cancelled) setContent(c);
      })
      .catch(() => {
        if (!cancelled) setContent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return content;
}

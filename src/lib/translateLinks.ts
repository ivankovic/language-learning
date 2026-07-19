// Pre-populated deep links to external translators, offered as a fallback
// when on-device AI is unavailable (e.g. non-Chrome browsers). These are the
// only place in the app that ever sends user text off-device, and only if
// the user explicitly taps the link.

export function buildDeepLUrl(sourceLang: string, targetLang: string, text: string): string {
  const path = `${sourceLang}/${targetLang}/${encodeURIComponent(text)}`;
  return `https://www.deepl.com/translator#${path}`;
}

export function buildGoogleTranslateUrl(sourceLang: string, targetLang: string, text: string): string {
  const params = new URLSearchParams({ sl: sourceLang, tl: targetLang, text, op: "translate" });
  return `https://translate.google.com/?${params.toString()}`;
}

// Web Speech API TTS playback — browser-native, no backend. Support/voice
// availability varies by browser and OS; this degrades to a no-op if
// unavailable rather than throwing.

export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, langCode: string): void {
  if (!isTtsAvailable()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  window.speechSynthesis.cancel(); // avoid overlapping utterances from rapid taps
  window.speechSynthesis.speak(utterance);
}

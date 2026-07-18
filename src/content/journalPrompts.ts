import type { JournalPrompt } from "../types/content";

// App content, not per-language data — doesn't need the dynamic-import
// machinery the vocab/lesson content uses.
export const journalPrompts: JournalPrompt[] = [
  { id: "prompt-your-day", text: "What did you do today? Write 4-5 sentences." },
  { id: "prompt-yesterday", text: "What happened yesterday that stuck with you?" },
  { id: "prompt-weekend", text: "What are your plans for the weekend?" },
];

export function pickRandomPrompt(): JournalPrompt {
  return journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
}

export function getPromptById(id: string | undefined): JournalPrompt {
  return journalPrompts.find((p) => p.id === id) ?? journalPrompts[0];
}

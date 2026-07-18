// Chrome's built-in on-device AI surface (Prompt API / LanguageModel / Translator)
// has changed shape across Chrome versions and may change again. Rather than
// hardcode one global name, probe a few candidates and degrade gracefully —
// never let feature detection throw and break the Journal screen.

export type AssistantCapability = "chrome-builtin" | "unavailable";

export type CorrectTranslationInput = {
  known: string;
  target: string;
  originalText: string;
  translationAttempt: string;
};

export interface JournalAssistant {
  capability: AssistantCapability;
  correctTranslation(input: CorrectTranslationInput): Promise<string | null>;
}

type PromptSession = { prompt(input: string): Promise<string>; destroy?(): void };
type PromptModelGlobal = {
  availability?(): Promise<string>;
  create(opts?: Record<string, unknown>): Promise<PromptSession>;
};

function getCandidateLanguageModel(): PromptModelGlobal | undefined {
  const g = globalThis as unknown as Record<string, unknown>;
  if (typeof g.LanguageModel === "object" || typeof g.LanguageModel === "function") {
    return g.LanguageModel as PromptModelGlobal;
  }
  const ai = g.ai as { languageModel?: PromptModelGlobal } | undefined;
  if (ai?.languageModel) return ai.languageModel;
  return undefined;
}

const unavailableAssistant: JournalAssistant = {
  capability: "unavailable",
  async correctTranslation() {
    return null;
  },
};

export async function detectAssistant(): Promise<JournalAssistant> {
  try {
    const model = getCandidateLanguageModel();
    if (!model) return unavailableAssistant;

    if (model.availability) {
      const availability = await model.availability().catch(() => "unavailable");
      if (availability === "unavailable") return unavailableAssistant;
    }

    return {
      capability: "chrome-builtin",
      async correctTranslation(input) {
        try {
          const session = await model.create();
          const result = await session.prompt(buildCorrectionPrompt(input));
          session.destroy?.();
          return result.trim() || null;
        } catch {
          return null;
        }
      },
    };
  } catch {
    // Feature probing must never crash the Journal screen.
    return unavailableAssistant;
  }
}

function buildCorrectionPrompt(input: CorrectTranslationInput): string {
  return [
    `You are a ${input.target} language tutor. A learner wrote the following in ${input.known}:`,
    `"${input.originalText}"`,
    `They attempted to translate it into ${input.target} as:`,
    `"${input.translationAttempt}"`,
    `Give brief, encouraging corrections to their ${input.target} attempt. Point out specific mistakes and show the fix. Keep it concise.`,
  ].join("\n\n");
}

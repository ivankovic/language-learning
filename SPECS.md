# Language Learning App — Design Specs

Living design doc from initial brainstorming. Captures decisions made so far; not all details are final.

## Goals

A general-purpose, multi-language learning web app with **no server-side processing** — fully static, all user data stays on-device. Learner starts from a known language (e.g. English) and studies one or more target languages (initial MVP: **Italian, French, German**, from **English**), each targeting the "Large" content tier — see [MVP Content Sizing](#mvp-content-sizing).

## Technology Stack

- **Vite + React + TypeScript** — build tooling and UI framework
- **Tailwind CSS** — styling
- **Dexie.js (IndexedDB)** — local persistence for user data (SRS state, progress, journal entries)
- **ts-fsrs** — client-side FSRS spaced-repetition scheduling library
- **Static JSON content bundles**, loaded per-language on demand
- **Web Speech API** — TTS (playback) and speech recognition (pronunciation practice), browser-native, no backend
- **Chrome built-in AI (on-device Gemini Nano)** — powers translation assistance/feedback in Journal mode; on-device, no external calls. Falls back to a degraded word-lookup mode on non-Chrome browsers (see [Journal flow](#journal-flow)).
- **Service Worker + Web App Manifest** — installable PWA, offline-capable
- Hosting: any static host (GitHub Pages, Cloudflare Pages, Netlify, Vercel)

No custom backend, no database server, no accounts/login. Data portability is handled via manual **JSON export/import** for backup and device transfer.

## Core Features / Modes

1. **Flashcard review (SRS)** — spaced-repetition vocab review using FSRS (see [SRS Algorithm](#srs-algorithm) below).
2. **Grammar lessons** — structured course content: units → lessons → inline exercises (multiple-choice, fill-blank, reorder), with prerequisite/unlock relationships.
3. **Journal / day-recap translation practice** — user recalls their day and writes 4-5 sentences in a known language, then attempts translation into the target language, with on-device AI assistance giving corrections/feedback. Mistakes/new vocab can be added to an SRS deck, closing the loop between production and recognition practice.

### Daily practice structure

A single guided **"Practice"** session mixes all three modes rather than requiring the user to pick a mode each time:

1. Warm-up — 5–8 due flashcards
2. Lesson step — next unfinished grammar exercise in the active course (skipped if none in progress)
3. Journal prompt — not every session (writing 4-5 sentences is heavier); included when `journalIntervalDays` has elapsed since the last entry (default **3 days**), with a "Write journal entry" option always available independent of session cadence
4. Cool-down — a few more due flashcards, prioritizing vocab flagged from recent journal corrections
5. Session summary — cards reviewed, lesson progress, streak update

Journal cadence is user-configurable (`UserProfile.journalIntervalDays`: 1 / 3 / 7 / manual-only), defaulting to every 3 days.

## UX / Information Architecture

**Mobile-first, responsive.** Bottom tab bar with 4 tabs:

- **Home** — streak, today's progress, prominent "Start Practice" CTA (launches mixed session), "extra review" flashcards beyond the daily session, current course snippet
- **Lessons** — course/unit/lesson tree, locked/unlocked by prerequisites; also browsable directly outside the mixed session
- **Journal** — list of past entries (date, snippet, correction count) + "Write journal entry" CTA; entry screen autosaves drafts locally
- **Progress** — streak calendar, per-deck mastery heatmap, review forecast, journal history stats

Settings (languages, decks, on-device model status, **data export/import**) accessible from a corner of Home — export/import needs to be easy to find since it's the only backup mechanism (no accounts/server).

### Onboarding (no login)

1. Pick known language(s)
2. Pick target language(s)
3. Pick a starting course/deck (or start from scratch)
4. One-screen explainer: data stays on-device, back up progress from Settings

### Review (flashcard) session flow

Due-card queue (+ new cards up to daily limit) → card front with TTS playback → reveal/type answer → self-grade (Again/Hard/Good/Easy) → session summary (count, accuracy, next-due forecast).

### Lesson flow

Course → unit → lesson tree → explanation blocks interleaved with inline exercises → completion screen; wrong exercises can spawn review cards.

### Journal flow

Rotating prompt ("What did you do today?") → write 4-5 sentences in known language → per-sentence or block translation attempt into target language → save entry → offer to add flagged/corrected words to an SRS deck.

**On Chrome (on-device AI available):** the model gives diff-style corrections/feedback on the translation attempt, populating `JournalEntry.aiFeedback`.

**On other browsers (degraded mode):** Journal mode stays fully available rather than being hidden. Instead of AI correction, the user gets tap-to-translate word lookup against the same `VocabItem.translations` data already loaded for decks/flashcards (coverage is necessarily partial — only words that exist in shipped content resolve). No `aiFeedback` is generated (field stays empty, already optional in the schema); the entry still saves, still counts toward streak/history, and words can still be manually flagged into an SRS deck.

## Data Model

Two cleanly separated layers: **static shipped content** (versioned, rebuildable) vs. **local user data** (IndexedDB, never touched by content updates). The join key is a **stable `id`** on content items that must never be reassigned once shipped.

### Content (static JSON, per-language bundles)

```ts
type Language = {
  code: string;        // ISO 639-1, e.g. "it"
  name: string;
  script: "latin" | "cyrillic" | "cjk" | "arabic" | ...;
  direction: "ltr" | "rtl";
  ttsVoiceHint?: string;
};

type VocabItem = {
  id: string;              // stable forever — SRS join key
  lang: string;
  term: string;
  translations: Record<string, string[]>; // keyed by known-language code, e.g. { en: ["dog"] }
  pos?: string;
  examples?: { sentence: string; translations: Record<string, string> }[];
  tags?: string[];
  frequencyRank?: number;
};

type Deck = {
  id: string;
  lang: string;
  title: string;
  courseId?: string;
  itemIds: string[];
};

type GrammarLesson = {
  id: string;
  lang: string;
  courseId?: string;
  order: number;
  prerequisiteIds?: string[];
  blocks: LessonBlock[]; // explanation text + embedded exercises
};

type Exercise = {
  id: string;
  type: "multiple-choice" | "fill-blank" | "reorder" | "translate";
  prompt: string;
  answer: string | string[];
  distractors?: string[];
};

type Course = {
  id: string;
  lang: string;
  title: string;
  level: "A1" | "A2" | "B1" | ...;
  unitIds: string[];
};
```

### User data (local, IndexedDB)

```ts
type UserProfile = {
  knownLangs: string[];
  targetLangs: string[];
  dailyGoal: number;
  journalIntervalDays: 1 | 3 | 7 | null; // null = manual-only, default 3
};

type CardState = {           // keyed by content VocabItem.id
  itemId: string;
  lang: string;
  state: "new" | "learning" | "review" | "relearning";
  difficulty: number;        // FSRS difficulty
  stability: number;         // FSRS stability
  dueAt: string;
  lastReviewedAt?: string;
  reviewHistory: { at: string; grade: 1 | 2 | 3 | 4 }[]; // Again/Hard/Good/Easy
};

type LessonProgress = {
  lessonId: string;
  completedAt?: string;
  exerciseResults: Record<string, boolean>;
};

type JournalEntry = {
  id: string;
  createdAt: string;
  knownLang: string;
  targetLang: string;
  originalText: string;
  translationAttempt: string;
  aiFeedback?: string;
  extractedVocabIds?: string[];
};
```

Key design decisions baked into this model:
- `VocabItem.id` is permanent — content regeneration must never renumber IDs, since local `CardState` is keyed by it.
- `translations` is a map keyed by known-language code (not a fixed language pair), so adding a new known language later doesn't require re-authoring every deck.
- Content is loaded per-language on demand, not bundled all at once, to keep the app lean as more languages are added.

## SRS Algorithm

**FSRS (Free Spaced Repetition Scheduler)** via the `ts-fsrs` library — chosen over classic SM-2 because it models each card's forgetting curve explicitly (difficulty, stability, retrievability) rather than a flat ease factor, scheduling more efficiently (same retention for fewer reviews). It's a pure client-side algorithm — no network calls — and is what Anki itself defaults to as of 23.10+.

**Grading:** each review is graded **Again / Hard / Good / Easy** (4-button UI, matches FSRS's native rating scale 1-4). FSRS updates the card's `difficulty` and `stability` from the grade and recomputes `dueAt` to hit a configured **target retention rate** (default 90% — higher retention means more frequent reviews, lower means fewer but riskier).

**Card lifecycle:**
- **New** — never reviewed. Enters via new-card intro (see below) or via journal-flagged vocab.
- **Learning** — short graduation steps (e.g. 1min → 10min → 1day) before the card is trusted to long-interval scheduling.
- **Review** — steady-state FSRS scheduling, intervals grow as stability increases.
- **Relearning** — a lapse (graded Again on a review-state card) drops it back into short steps rather than resetting progress to zero; stability/difficulty carry over so relapsed cards recover faster than truly new ones.

**Daily new-card limit:** default **10 new cards/day**. Caps how many brand-new cards enter learning per day so the review queue doesn't outgrow what the user can actually retain; configurable later as a setting.

**Queue construction** (feeds Home's due-count and the Practice session's warm-up/cool-down steps): due cards (state = review/relearning, `dueAt` ≤ now) sorted by due date, interleaved with new cards up to the daily limit. The Progress tab's review forecast is a straightforward `dueAt` histogram over `CardState`.

**Deferred:** per-user FSRS weight optimization (the algorithm supports fitting its parameters to an individual's review history once enough data exists, ~1000+ reviews) — start with default weights, revisit as a later enhancement.

## Content Sourcing & Authoring Pipeline

Content authoring is a **dev-side workflow**, not bound by the app's own "no server-side processing" constraint — generation happens offline/at build time, only the finished static JSON ships.

- **Vocab & example sentences** — sourced from open datasets where useful: Tatoeba (example sentence pairs, CC-BY/CC-BY-SA), Wiktionary/Wiktextract (definitions, translations, CC-BY-SA), open frequency lists (for prioritizing common-word decks). Requires attribution/credits page; CC-BY-SA derivatives need compatible licensing.
- **Grammar lessons & curated decks** — no good open dataset exists for these; authored via LLM generation (Claude, using this working relationship) against a course outline, always **human-reviewed before shipping**.

### Generation → review → promotion pipeline

1. **Course outline** — per-language config: units, CEFR level, topics, grammar points in order.
2. **Generation** — content drafted against the schema above (lessons, exercises, vocab items, example sentences), optionally informed by open data.
3. **Staging** — generated output lands in `content-staging/`, never directly in the shipped `content/` folder.
4. **Review UI** — a dev-only screen (excluded from the production build) rendering staged content exactly as the end-user app would, allowing approve / inline edit / reject-and-regenerate.
5. **Promotion** — approval assigns a permanent stable ID and moves the item into `content/`, the real shipped data. IDs are never reassigned after this point.

### MVP Content Sizing

Target tier: **Large**, per target language (Italian, French, German):

- **~2000 core vocabulary words**, prioritized by frequency rank, organized into topic decks (~30-40 decks at ~50-60 words each)
- **30-40+ grammar lessons**, spanning A1 through A2 (vs. a bare-essentials A1-only set)
- Each lesson carries several inline exercises (multiple-choice, fill-blank, reorder) per the `GrammarLesson`/`Exercise` schema

This is a meaningfully larger generation/review workload than a minimal validation slice (~3x the vocab, ~3-4x the lessons of the smallest tier considered) — expect the content generation → staging → review → promotion pipeline to run over many batches per language rather than a single pass.

## Open Questions / Deferred Decisions

- **FSRS weight optimization** — using default parameters for MVP; per-user optimization deferred until enough review history accumulates.

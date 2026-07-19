# TODO

Implementation plan: [`~/.claude/plans/graceful-giggling-gizmo.md`](~/.claude/plans/graceful-giggling-gizmo.md) — full Phase 1 plan (context, stack decisions, data model, verification steps). Design rationale lives in `SPECS.md`.

## Phase 1 — App skeleton (complete)

Goal: a fully working app skeleton, every mode functional end-to-end, proven with a small hand-authored Italian (from English) seed dataset. All tasks below are done and verified (43 unit tests + full Playwright browser walkthrough, including an explicit export→wipe→import round-trip).

- [x] Install bun (package manager/script runner; this machine only had npm)
- [x] Scaffold Vite + React + TypeScript project (hand-scaffolded — `create-vite`'s CLI needs Node 20+, this machine runs 18.19.1)
- [x] Install dependencies (react-router-dom, dexie, dexie-react-hooks, ts-fsrs, Tailwind v4, vite-plugin-pwa, Vitest, Testing Library, fake-indexeddb)
- [x] Configure Tailwind, Vitest, PWA (manifest, service worker, Workbox caching)
- [x] Write content and user data types (`src/types/content.ts`, `src/types/user.ts`)
- [x] Build Dexie schema and query modules (`src/db/`)
- [x] Author Italian seed content (~110 vocab words, 5 decks, 1 course, 3 units, 8 grammar lessons with exercises)
- [x] Build content loader (per-language dynamic import + `validateContentBundle()`)
- [x] Build FSRS wrapper and queue logic (`src/srs/`), with tests confirming native short-term scheduling and relearning-recovers-faster-than-new
- [x] Build on-device AI assistant abstraction + dictionary fallback (`src/ai/`) + TTS wrapper (`src/speech/`)
- [x] Build app shell, routing (HashRouter), onboarding flow
- [x] Build Home + flashcard review screens
- [x] Build Lessons screens + 4 exercise types (multiple-choice, fill-blank, reorder, translate)
- [x] Build Journal screens (entry flow, AI/dictionary-fallback word helper, draft autosave)
- [x] Build Practice session orchestrator (warm-up → lesson → journal → cooldown → summary, with cross-route hand-off state)
- [x] Build Progress and Settings screens (streak calendar, mastery heatmap, forecast, JSON export/import)
- [x] Scaffold dev-only content-review stub (`src/dev/content-review/`, `content-staging/`)
- [x] Run full verification pass (unit tests, typecheck, production build, Playwright walkthrough)

### Bugs found and fixed during verification (not something typecheck catches)

- [x] `dexie-react-hooks@1.1.7` incompatible with React 19 ("Invalid hook call") — upgraded to `^4.4.0`
- [x] `completeEntry()` used Dexie's `update()`, a silent no-op against a nonexistent row — journal entries saved before their debounced draft ever wrote could vanish entirely. Fixed to `put()` (upsert); regression test added (`src/db/queries/journal.test.ts`)
- [x] Journal prompt was re-randomized on every keystroke (called in the render body) — fixed to resolve once from the stored `promptId` (`getPromptById`)
- [x] Lesson ordering bug: sorting lessons by a per-unit `order` field globally caused ties/misordering across units — fixed to derive order from course→unit→lesson structure; test locks in the correct sequence

## Phase 2 — Content scale-up (in progress)

Target: "Large" tier per language — ~2000 words / 30-40 lessons (see `SPECS.md`).

**Italian progress: 810/~2000 words (~41%), 25/~35 lessons (~71%), 27 decks, 10 units.**
**French progress: 160/~2000 words (~8%), 8/~35 lessons (~23%), 5 decks, 3 units.**
**German progress: 160/~2000 words (~8%), 8/~35 lessons (~23%), 5 decks, 3 units.**
**Croatian progress: 160/~2000 words (~8%), 8/~35 lessons (~23%), 5 decks, 3 units.**

- [x] Batch 1: expanded 5 original decks (greetings/food/travel/routine/numbers-time) and added 6 new decks (home, body & clothing, weather/colors/nature, work & education, common verbs, common adjectives) — 110 → 330 words
- [x] Batch 1: added 7 new grammar lessons (regular -ere/-ire verbs, modal verbs, reflexive verbs, adjective agreement, prepositions, passato prossimo with avere, passato prossimo with essere) across 3 new units — 8 → 15 lessons, 3 → 6 units
- [x] Batch 2: added 4 new decks (shopping & money, more common verbs, technology & communication, sports & hobbies) — 330 → 450 words
- [x] Batch 2: added 5 new grammar lessons (imperfetto, futuro semplice, comparatives, direct object pronouns, indirect object pronouns) across 2 new units — 15 → 20 lessons, 6 → 8 units
- [x] Batch 3: added 4 new decks (emotions & personality, city & transportation, holidays & celebrations, cooking & kitchen) — 450 → 570 words
- [x] Batch 3: added 5 new grammar lessons (ci/ne particles, relative pronouns che/cui, condizionale, superlatives, impersonal si) across 2 new units — 20 → 25 lessons, 8 → 10 units
- [x] Batch 4: vocab-only — added 4 new decks (animals, nature & outdoors, society & government, common expressions/idioms) — 570 → 690 words, 23 decks. No new lessons this batch; core beginner-to-intermediate grammar is now largely covered by the existing 25.
- [x] Batch 5: vocab-only — added 4 new decks (countries & nationalities, materials & shapes, business & finance, conjunctions & connectors) — 690 → 810 words, 27 decks.
- [ ] Continue growing Italian toward ~2000 words / ~35 lessons (many more batches needed — this is intentionally incremental, not a single pass). Remaining vocab breadth ideas: more specific food/cooking terms, more professions, formal register phrases, regional expressions, hobbies extended (art, gardening, collecting). Remaining grammar ideas (fewer needed): subjunctive mood intro, passive voice, gerund/progressive (stare + gerundio)
- [x] Added French: infrastructure (registered in `languages.ts` and `loader.ts`'s registry, appears automatically in onboarding since target-language options are derived from `hasContentBundle()`) + an initial content batch mirroring Italian's original scope — 160 words across the same 5 core decks (greetings, food, travel, daily routine, numbers & time), 8 grammar lessons across 3 units (greetings, articles, être, avoir, numbers, regular -er verbs, word order, food & travel). Verified end-to-end in a real browser: onboarding, lessons, flashcard review with FSRS, all 55 tests pass.
- [x] Factored out `src/content/buildLanguageContent.ts`, shared by every per-language `index.ts` — avoids the course→unit→lesson flattening logic drifting out of sync now that there are 3 languages.
- [ ] Continue growing French toward parity with Italian in future batches (same pattern: vocab decks first, grammar lessons interleaved)
- [x] Added German: same pattern as French — 160 words across the same 5 core decks, 8 grammar lessons across 3 units (greetings, articles [der/die/das — 3 genders, more than Italian/French], sein, haben, numbers, regular verbs, word order, food & travel). Handled real German-specific grammar accurately rather than mechanically mirroring Italian/French: age uses **sein**, not haben (`Ich bin ... Jahre alt`, unlike Italian/French which use avere/avoir); word-order lesson explains the V2 rule instead of claiming SVO-like-English; caught and fixed a bug where I'd used the irregular verb *essen* as a "regular verb" example. Also required a case-*sensitive* vocab dedup check specifically for German, since capitalization is grammatically load-bearing there (e.g. "Morgen" morning-noun vs "morgen" tomorrow-adverb are legitimately different words). Verified end-to-end in a real browser; all 58 tests pass.
- [ ] Continue growing German toward parity with Italian in future batches
- [x] Added Croatian: same pattern as French/German — 160 words across the same 5 core decks, 8 grammar lessons across 3 units (greetings, noun gender & plurals [no articles at all — replaces the German/French "articles" slot with the genuinely Croatian topic of gender-by-ending and plural formation], biti, imati, numbers, regular -ati verbs, word order & clitics, food & travel). Handled Croatian-specific grammar accurately: *imati* is used for age like Italian **avere**/French **avoir** (not like German's **sein**); negating *imati* fuses irregularly into **nemati** (nemam, not "ne imam") rather than a regular ne+verb negation; the word-order lesson teaches Croatian's genuinely distinctive rule — clitics (sam/si/je, the question particle li) must sit in second position (Wackernagel's Law) — instead of claiming flexible-SVO is the whole story; the food/travel lesson's "I would like" phrase (**htio bih** / **htjela bih**) correctly agrees with the speaker's gender, unlike Italian's *vorrei* or German's *ich möchte*. Verified end-to-end in a real browser across all 8 lessons (diacritics render correctly, no console errors); all 69 tests pass, typecheck clean.
- [ ] Continue growing Croatian toward parity with Italian in future batches
- [ ] Run the actual content generation → staging → review → promotion pipeline (currently just scaffolded/empty) — Phase 1-2 content has been hand-authored directly instead
- [ ] Flesh out the dev content-review UI beyond the placeholder (approve/edit/reject-and-regenerate staged content)
- [ ] Split `vocab.json`/`decks.json` into per-topic files once a single file becomes unwieldy to hand-edit (deferred again at 330 words — still a manageable file size; revisit past ~800-1000)

### Bugs found while expanding content

- [x] `MarkdownLite` only supported `**bold**`, not `*italic*` — but most lesson explanation text (including from Phase 1) used single-asterisk italics for Italian example sentences, which rendered as literal asterisks. Extended the renderer to support both; regression test added (`src/features/lessons/MarkdownLite.test.tsx`)

## Parallel multi-language support (complete)

Previously `activeTargetLang` was set once at onboarding with no way to change it. Now `targetLangs` is a genuinely growable, switchable set — users can learn Italian, French, and German in parallel and switch between them from a `LanguageSwitcher` chip row (Home, Lessons, Journal, Progress, Settings).

- [x] `LanguageSwitcher` component: chips for each `targetLangs` entry (tap to switch `activeTargetLang`) + "+" to add another language not yet being learned (loads its content, seeds the first lesson's progress, appends to `targetLangs`, switches to it)
- [x] `db/queries/profile.ts`: added `setActiveTargetLang()` and `addTargetLang()`
- [x] **Schema migration** (v1 → v2 → v3): `DailyActivity` was keyed by `date` alone, conflating two languages studied on the same day into one streak/counter. Changed to a compound `[date+lang]` primary key. Dexie does not support changing a primary key in place ("Not yet support for changing primary key") — used the documented two-version workaround (delete + stage under a temp name in v2, delete the temp + recreate under the original name in v3), backfilling existing rows with the profile's `activeTargetLang` since pre-migration data never recorded which language it was for.
- [x] `db/queries/activity.ts` (`getToday`, `incrementToday`, `getActivityRange`, `computeStreak`) and every caller (Home, Progress, FlashcardReview, LessonDetail, JournalEntryScreen, PracticeSession) updated to take `lang`
- [x] Verified the schema migration explicitly: seeded a raw IndexedDB v1 database (simulating a real returning user, since this machine's own browser had accumulated real v1 data from earlier testing this session), reloaded the app, confirmed the profile survived, `dailyActivity` rows were backfilled with the correct `lang`, counts were preserved, and unrelated tables (`cardStates`) were untouched
- [x] Verified the full flow in a real browser: onboard with Italian → add French via the switcher → French streak starts independently at 0 → grade cards in French → switch back to Italian → Italian's daily count is unaffected by French activity → Settings lists both languages
- [x] All 60 tests pass, typecheck clean, production build succeeds

## About page (complete)

- [x] New `/about` route, reachable from Settings — explains the app is free (no cost/account, AGPLv3), private (no server, on-device only), and LLM-assisted (with a pointer to open an issue/PR for corrections), plus a link to the Codeberg repo

## Quick vocabulary practice by deck (complete)

Previously decks were only ever used for the Progress screen's mastery heatmap — there was no way to browse them or drill a specific topic on demand. "Extra review" existed but only pulls FSRS due+new cards across the whole language, so it could show "nothing to review" even when you just want to cram a specific deck.

- [x] Lessons screen gains a "Quick vocabulary practice" section: a horizontally-scrolling row of deck chips (title + word count) above the Grammar section
- [x] `srs/assemble.ts`: added `buildDeckQueue(deck)` — every word in the deck, shuffled, deliberately bypassing the daily new-card limit and due-date gating that `assembleQueue()` applies (an explicit, user-initiated cram session, not the auto-paced daily queue — like Anki's manual deck browser)
- [x] `FlashcardReview` (mode `"extra"`) now reads an optional `?deck=<deckId>` query param: when present, builds the queue from that one deck instead of the global due+new algorithm, and shows the deck's title as the screen title instead of generic "Review"
- [x] Verified in a real browser: deck chips render with correct word counts, tapping one navigates to a deck-scoped review with the right title and full word count queued, grading persists real `CardState`/FSRS rows, and the original due-based "Extra review" (no `deck` param) is unaffected
- [x] All 63 tests pass (3 new for `buildDeckQueue`), typecheck clean, production build succeeds

## Deferred / open items

- [ ] FSRS per-user weight optimization (using library defaults; needs ~1000+ reviews of real history to be worth fitting — noted in `SPECS.md`)
- [ ] Speech recognition / pronunciation practice (TTS is implemented; STT was explicitly deferred out of Phase 1 since no concrete UX flow specified it)
- [ ] Multi-known-language UI (data model supports multiple known languages; UI currently assumes `knownLangs[0]`)
- [ ] Real 192/512 PNG app icons (manifest currently uses a single scalable SVG placeholder — fine for most Android/desktop installs, but iOS and some launchers don't rasterize SVG manifest icons)
- [ ] Firefox/Safari manual pass (Chromium's non-`LanguageModel` fallback path is verified; no Chromium-only APIs are known to be in the critical path, but untested elsewhere)
- [ ] `NODE_OPTIONS=--experimental-global-webcrypto` baked into the `build` script works around this machine's Node 18 lacking a global `crypto` in a `vite-plugin-pwa` subprocess — confirm this flag is harmless (or unnecessary) on whatever Node version actually runs CI/deploys, since newer Node may not need or recognize it

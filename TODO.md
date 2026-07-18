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
- [x] Author Italian seed content (~110 vocab words, 5 decks, 1 A1 course, 3 units, 8 grammar lessons with exercises)
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

Target: "Large" tier per language — ~2000 words / 30-40 lessons (see `SPECS.md`). Growing Italian first before replicating for French/German (explicit choice — see `~/.claude/plans/graceful-giggling-gizmo.md`).

**Italian progress: 450/~2000 words (~23%), 20/~35 lessons (~57%), 15 decks, 8 units.**

- [x] Batch 1: expanded 5 original decks (greetings/food/travel/routine/numbers-time) and added 6 new decks (home, body & clothing, weather/colors/nature, work & education, common verbs, common adjectives) — 110 → 330 words
- [x] Batch 1: added 7 new grammar lessons (regular -ere/-ire verbs, modal verbs, reflexive verbs, adjective agreement, prepositions, passato prossimo with avere, passato prossimo with essere) across 3 new units — 8 → 15 lessons, 3 → 6 units
- [x] Batch 2: added 4 new decks (shopping & money, more common verbs, technology & communication, sports & hobbies) — 330 → 450 words
- [x] Batch 2: added 5 new grammar lessons (imperfetto, futuro semplice, comparatives, direct object pronouns, indirect object pronouns) across 2 new units — 15 → 20 lessons, 6 → 8 units
- [ ] Continue growing Italian toward ~2000 words / ~35 lessons (many more batches needed — this is intentionally incremental, not a single pass). Natural next batches: emotions/personality, transportation/city places, holidays/celebrations, cooking/kitchen, more A2 grammar (subjunctive intro, ci/ne particles, relative pronouns)
- [ ] Add French and German content bundles (currently only Italian has seed content) — deferred until Italian is more complete
- [ ] Run the actual content generation → staging → review → promotion pipeline (currently just scaffolded/empty) — Phase 1-2 content has been hand-authored directly instead
- [ ] Flesh out the dev content-review UI beyond the placeholder (approve/edit/reject-and-regenerate staged content)
- [ ] Split `vocab.json`/`decks.json` into per-topic files once a single file becomes unwieldy to hand-edit (deferred again at 330 words — still a manageable file size; revisit past ~800-1000)

### Bugs found while expanding content

- [x] `MarkdownLite` only supported `**bold**`, not `*italic*` — but most lesson explanation text (including from Phase 1) used single-asterisk italics for Italian example sentences, which rendered as literal asterisks. Extended the renderer to support both; regression test added (`src/features/lessons/MarkdownLite.test.tsx`)

## Deferred / open items

- [ ] FSRS per-user weight optimization (using library defaults; needs ~1000+ reviews of real history to be worth fitting — noted in `SPECS.md`)
- [ ] Speech recognition / pronunciation practice (TTS is implemented; STT was explicitly deferred out of Phase 1 since no concrete UX flow specified it)
- [ ] Multi-known-language UI (data model supports multiple known languages; UI currently assumes `knownLangs[0]`)
- [ ] Real 192/512 PNG app icons (manifest currently uses a single scalable SVG placeholder — fine for most Android/desktop installs, but iOS and some launchers don't rasterize SVG manifest icons)
- [ ] Firefox/Safari manual pass (Chromium's non-`LanguageModel` fallback path is verified; no Chromium-only APIs are known to be in the critical path, but untested elsewhere)
- [ ] `NODE_OPTIONS=--experimental-global-webcrypto` baked into the `build` script works around this machine's Node 18 lacking a global `crypto` in a `vite-plugin-pwa` subprocess — confirm this flag is harmless (or unnecessary) on whatever Node version actually runs CI/deploys, since newer Node may not need or recognize it

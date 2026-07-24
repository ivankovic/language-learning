# Language Learning

A free, private, no-account language-learning web app. Flashcards with spaced repetition, structured grammar lessons, and a daily journal-writing practice — all running entirely in your browser, with **no server and no tracking**.

**🔗 Live app: https://ivankovic.github.io/language-learning/**

## Why

Most language apps want an account, a subscription, and your data. This one doesn't. It's a static site — everything you do is stored locally in your browser's IndexedDB. There's nothing to sign up for and nothing to sync to a server, because there is no server. Back up your progress anytime as a JSON file from Settings, and restore it on another device the same way.

## Features

- **Spaced-repetition flashcards** powered by [FSRS](https://github.com/open-spaced-repetition/ts-fsrs), the modern successor to SM-2/Anki's algorithm
- **Grammar lessons** — units of structured explanations and exercises (multiple-choice, fill-in-the-blank, sentence reorder, translation), gated by prerequisites, with the correct answer always shown after a wrong attempt
- **Journal practice** — write a few sentences about your day, get corrections, and feed missed vocabulary straight back into your review deck
- **Quick vocabulary practice** — cram any single deck on demand, independent of the daily spaced-repetition queue
- **A guided daily "Practice" session** that mixes warm-up review, your next lesson, and journal writing into one flow
- **Parallel multi-language learning** — study several languages side by side and switch between them with one tap; each has its own independent streak and progress
- **Fully localized content** — the UI and every course's vocabulary, lesson explanations, and exercises are translated into all supported known languages, not just English
- **Installable PWA** with offline support
- **Light/dark theme**, auto-following your system setting
- **Streaks, mastery heatmaps, and a review forecast** on the Progress tab

## Languages

| Language | Vocabulary | Lessons |
|---|---|---|
| 🇮🇹 Italian | 1050 words | 25 lessons |
| 🇫🇷 French | 1000 words | 14 lessons |
| 🇩🇪 German | 1000 words | 14 lessons |
| 🇭🇷 Croatian | 1000 words | 14 lessons |
| 🇪🇸 Spanish | 1000 words | 8 lessons |

The UI is available in all five of these languages plus English, and every course's vocabulary, lesson explanations, and exercises are fully translated into each of the other known languages — so a Croatian speaker learning French gets French content explained in Croatian, a French speaker learning German gets it explained in French, and so on, for all 20 course/known-language combinations.

All content is generated with the help of LLMs and hand-reviewed for grammatical accuracy — but mistakes can slip through. **Found an error?** [Open an issue](https://github.com/ivankovic/language-learning/issues) or send a pull request; see [Contributing](#contributing) below.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Dexie.js](https://dexie.org/) (IndexedDB) for all local persistence, with [`dexie-react-hooks`](https://github.com/dexie/Dexie.js/tree/master/addons/dexie-react-hooks) for reactivity
- [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) for spaced-repetition scheduling
- `react-router-dom` (`HashRouter`) for routing that works on any static host with zero server config
- [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) for offline support and installability
- [Bun](https://bun.sh/) as the package manager and script runner
- [Vitest](https://vitest.dev/) + React Testing Library + `fake-indexeddb` for tests

No backend, no database server, no accounts, no analytics.

## Getting started

Requires [Bun](https://bun.sh/).

```sh
bun install
bun run dev
```

Open the printed local URL in your browser.

### Other commands

```sh
bun run build       # type-check + production build (dist/)
bun run preview     # preview the production build locally
bun run test         # run the test suite
bun run typecheck    # tsc --noEmit
bun run lint         # eslint
```

Or via `make`: `make dev`, `make build`, `make test`, `make typecheck`.

## Deployment

The app is a fully static site — the `dist/` folder from `bun run build` can be hosted anywhere (GitHub Pages, Cloudflare Pages, Netlify, Vercel, ...) with no server-side configuration. This repo deploys to [GitHub Pages](https://pages.github.com/) via:

```sh
make deploy
```

which builds the app and pushes `dist/` to the `gh-pages` branch (configured in the repo's Settings → Pages as the deploy source).

## Design notes

See [`SPECS.md`](SPECS.md) for the full design doc (data model, SRS algorithm details, content pipeline) and [`TODO.md`](TODO.md) for a running changelog of what's been built and what's next.

## Contributing

Corrections to vocabulary, translations, or grammar explanations are especially welcome, since the content is LLM-assisted and imperfect. Open an issue or send a pull request on [GitHub](https://github.com/ivankovic/language-learning).

## License

[GNU AGPLv3](LICENSE).

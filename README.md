# Swedish

**Live: [gray0072.github.io/swedish](https://gray0072.github.io/swedish/)**

Learn Swedish and build the city of Stockholm — from a prehistoric settlement to the modern
metro. A static, backend-free web app: every lesson is short (5 minutes), every test is drawn
from a large question pool, and every reward is spendable in a city-building game layered on
top. Full product spec: [SPEC.md](SPEC.md) (English) / [SPEC_ru.md](SPEC_ru.md)
(Russian) — those two files are the authoritative design spec for this project.
Development log: [CHANGELOG.md](CHANGELOG.md) (Russian).

## Features

| Feature | Description |
|---|---|
| Lessons by level | Tracks for CEFR (A1–B1), SFI (Kurs A–D) and Grund (1–4); one lesson can belong to several |
| Theory + vocabulary | Short Markdown theory and a word list per lesson, with `sv-SE` text-to-speech on every Swedish word |
| Quiz engine | 10 questions per run, weighted-sampled from a pool of 100+ generated from the vocabulary list, plus hand-written questions for word order, idioms and grammar traps |
| Spaced repetition | A global Leitner-box review deck (`/review`) across every lesson you've studied |
| Gamification | XP and coins from passing quizzes, spent building Stockholm through six historical eras |
| History cards | Short, sourced history notes (Birka, the 1252 mention, the Vasa, the metro) unlocked by buildings |
| RU/EN toggle | One header switch changes both the interface language and every translation shown |
| Local-only progress | Everything lives in `localStorage`; export/import a JSON save file, no account, no server |

## How it works

1. Pick a topic from a level (`/tracks`).
2. Read the short theory and vocabulary, with audio on every Swedish word.
3. Take the 10-question test — immediate feedback, one free retry per run, no lives, no losing progress.
4. Spend the XP and coins you earn building Stockholm; perks you unlock (extra review slots,
   XP/coin multipliers, bonus lesson packs) feed back into learning.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict)
- [Vite 6](https://vitejs.dev/) — dev server and build, content loaded via `import.meta.glob`
- [React Router](https://reactrouter.com/) (`HashRouter` — works on GitHub Pages with zero server config)
- [Zustand](https://zustand-demo.pmnd.rs/) — app state, persisted to `localStorage`
- [Zod](https://zod.dev/) — content schemas, validated at build time and in CI
- [Tailwind CSS](https://tailwindcss.com/) — a small Swedish-design-inspired palette (falu red, birch, gold; no MUI)
- [react-markdown](https://github.com/remarkjs/react-markdown) — lesson theory
- [Vitest](https://vitest.dev/) — unit tests for the quiz engine, grading, selection weighting and the SRS scheduler

## Getting started

```bash
git clone https://github.com/gray0072/swedish.git
cd swedish
npm install
npm run dev
```

Opens at `http://localhost:5173/swedish/`.

## Build & deploy

```bash
npm run build      # -> dist/
npm run preview    # serve the production build locally
```

Deployment is automatic: a push to `main` runs `.github/workflows/deploy.yml`, which validates
content, runs tests, builds, and publishes `dist/` via the official
`actions/upload-pages-artifact` + `actions/deploy-pages` flow (Settings → Pages → Source:
**GitHub Actions**). `vite.config.ts` sets `base: '/swedish/'` to match the repo name — update
it if the repo is ever renamed or moved to a custom domain.

A manual alternative (`npm run deploy`, via the `gh-pages` package) is also available if you'd
rather publish from a local build to a `gh-pages` branch instead of waiting on CI.

## Project structure

```
content/                # all learning content — lessons, vocab, questions, city, history
  lessons/<level>/<slug>/  lesson.json, theory.md, vocab.json, questions.json
  curricula/             ordered lesson-id playlists per track
  city/                  eras.json, buildings.json
  history/               short sourced history cards
src/
  content/               Zod schemas, the content loader/registry, vocab->quiz generators
  quiz/                  session creation, weighted selection, grading, reward math
  srs/                   Leitner-box review scheduler
  store/                 Zustand store (wallet, progress, city, settings) + save/export/import
  components/, pages/    UI
scripts/                 validate-content.ts (CI content validation), new-lesson.ts (scaffolder)
tests/                   Vitest unit tests
```

## Roadmap

- [ ] SFI and Grund curricula (structure exists, lessons not yet written)
- [x] Illustrated city map
- [x] `/grammar` reference articles
- [x] PWA / offline support
- [x] Wire history-card vocabulary into the SRS review deck
- [x] Achievements and a shareable result card
- [ ] Additional question types in more lessons (listening dictation, pronunciation practice)
- [ ] B1+ CEFR content
- [ ] Proper 192/512 PNG app icons (the manifest currently reuses the SVG favicon)

## License

MIT — see [LICENSE](LICENSE).

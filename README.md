# Swedish

**Live: [gray0072.github.io/swedish](https://gray0072.github.io/swedish/)**

Learn Swedish and build the city of Stockholm — from a prehistoric settlement to the modern
metro. A static, backend-free-by-default web app: every lesson is short (5 minutes), every
test is drawn from a large question pool, and every reward is spendable in a city-building
game layered on top. Progress lives in `localStorage`; an optional Google sign-in adds
cross-device sync on top, via Supabase (see [Cloud sync](#cloud-sync-optional) below) — the
app works fully offline either way. Full product spec: [SPEC.md](SPEC.md) — the authoritative design spec for this
project. Lesson-topic plan per level: [CURRICULUM.md](CURRICULUM.md) — start here when
picking what content to write next. Outstanding work: [TODO.md](TODO.md).
Development log: [CHANGELOG.md](CHANGELOG.md). Contributor conventions:
[AGENTS.md](AGENTS.md). Every one of these documents has a Russian translation next to it
under the `_ru` suffix ([SPEC_ru.md](SPEC_ru.md), [CURRICULUM_ru.md](CURRICULUM_ru.md),
[TODO_ru.md](TODO_ru.md), [CHANGELOG_ru.md](CHANGELOG_ru.md)); English is the primary
version.

## Screenshots

| Topics and levels | A quiz in progress | The city — Viking era |
|---|---|---|
| ![Tracks and levels list](docs/screenshots/tracks.png) | ![A quiz question with a typed answer](docs/screenshots/quiz.png) | ![The isometric city scene, Viking era](docs/screenshots/city.png) |

### The ten eras

One island, ten ages. Each shot is that era with every one of its buildings finished — what
the map looks like just before the next era opens. The first six are real history; the last
four are informed guesses ([SPEC.md](SPEC.md) §12.8).

| | | |
|---|---|---|
| ![The Settlement](docs/screenshots/city-tribe.png)<br>**1. The Settlement** | ![The Viking Age](docs/screenshots/city-viking.png)<br>**2. The Viking Age** | ![The Middle Ages](docs/screenshots/city-medieval.png)<br>**3. The Middle Ages** |
| ![The Age of Empire](docs/screenshots/city-empire.png)<br>**4. The Age of Empire** | ![The Industrial Age](docs/screenshots/city-industrial.png)<br>**5. The Industrial Age** | ![Modern Stockholm](docs/screenshots/city-modern.png)<br>**6. Modern Stockholm** |
| ![The Green City](docs/screenshots/city-green.png)<br>**7. The Green City** | ![The Connected City](docs/screenshots/city-connected.png)<br>**8. The Connected City** | ![The Floating City](docs/screenshots/city-floating.png)<br>**9. The Floating City** |
| ![The Star City](docs/screenshots/city-stellar.png)<br>**10. The Star City** | | |

All of these are generated from the running app by `npm run screenshots`
([scripts/screenshots.ts](scripts/screenshots.ts)) — it boots the dev server, seeds a
throwaway finished save, and drives your installed Chrome. Add `-- city` or `-- eras` to
redo only that half. Re-run it whenever the scene changes; never touch the PNGs by hand.

## Features

| Feature | Description |
|---|---|
| Lessons by level | Two sequential tracks: SFI (kurs A–D) and, after it, SVA grundläggande (delkurs 1–4); every lesson belongs to exactly one level |
| Theory + vocabulary | Short Markdown theory and a word list per lesson, with `sv-SE` text-to-speech on every Swedish word |
| Quiz engine | 10 questions per run, weighted-sampled from a pool of 100+ generated from the vocabulary list, plus hand-written questions for word order, idioms and grammar traps |
| Spaced repetition | A global Leitner-box review deck (`/review`) across every lesson you've studied |
| Gamification | XP and coins from passing quizzes, spent building Stockholm through six historical eras |
| History cards | Short, sourced history notes (Birka, the 1252 mention, the Vasa, the metro) unlocked by buildings |
| RU/EN toggle | One header switch changes both the interface language and every translation shown |
| Local-first progress | Everything lives in `localStorage`; export/import a JSON save file — no account or server required |
| Cloud sync (optional) | Sign in with Google to sync progress across devices, merged field-by-field so nothing is lost; see [Cloud sync](#cloud-sync-optional) |

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
- [Supabase](https://supabase.com/) — optional: Auth (Google, PKCE) + Postgres, for cross-device sync only

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

## Cloud sync (optional)

Progress works fully offline out of the box (`localStorage` + export/import). Signing in with
Google in Settings additionally syncs the same save file through a Supabase project — merged
field-by-field on sync (lessons, SRS items, buildings, wallet, streak, …) so progress made on
two devices between syncs is combined rather than one side clobbering the other. Full scheme:
[SPEC.md §7.1](SPEC.md#71-optional-cloud-sync--supabase).

To wire this up for your own fork:

1. Create a free [Supabase](https://supabase.com/) project.
2. Run [supabase/schema.sql](supabase/schema.sql) once in its SQL editor — one `saves` table
   with row-level security scoping every row to its own user.
3. In the Supabase dashboard, enable the Google auth provider (Authentication → Providers),
   which needs a Google Cloud OAuth client id/secret, and add your dev/prod URLs under
   Authentication → URL Configuration → Redirect URLs.
4. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` from Project Settings → API, for local `npm run dev` /
   `npm run deploy`. Neither value is secret — the anon/publishable key ships in the client
   bundle by design; RLS is what actually protects the data — but `.env.local` is gitignored
   anyway to keep per-fork keys out of the repo.
5. For the automatic CI deploy (`.github/workflows/deploy.yml`, triggered on every push to
   `main`), also add the same two values as **repository secrets** — Settings → Secrets and
   variables → Actions → New repository secret — named exactly `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`. The workflow's build step reads them from there; `.env.local`
   never reaches CI. Skipping this step is the most common way to end up with a deployed
   build that has no sign-in button — it's not broken, it just built without them.

Without those env vars set (locally or in CI), the app builds and runs exactly as before:
cloud sync silently compiles out and only the local-only path is used.

**Troubleshooting: Google sign-in redirects to `localhost` and errors out on the deployed
site.** This is a Supabase dashboard setting, not a code bug — the app always redirects back
to the page it was opened from (`src/store/cloudSync.ts`). Supabase falls back to its
**Site URL** (Authentication → URL Configuration), which defaults to
`http://localhost:3000`, whenever the actual redirect isn't in the **Redirect URLs** allow
list. Fix: set Site URL to your deployed URL (e.g. `https://<user>.github.io/swedish/`) and
add both that and `http://localhost:5173/swedish/` to Redirect URLs.

## Project structure

```
content/                # all learning content — lessons, vocab, questions, city, history
  lessons/<level>/<slug>/  lesson.json, theory.md, theory_ru.md, vocab.json, questions.json
  curricula/             ordered lesson-id playlists per track
  city/                  eras.json, buildings.json
  history/               short sourced history cards
src/
  content/               Zod schemas, the content loader/registry, vocab->quiz generators
  quiz/                  session creation, weighted selection, grading, reward math
  srs/                   Leitner-box review scheduler
  store/                 Zustand store (wallet, progress, city, settings) + save/export/import,
                         plus optional Supabase cloud sync (cloudSync.ts, useCloudSync.ts)
  components/, pages/    UI
scripts/                 validate-content.ts (CI content validation), new-lesson.ts (scaffolder)
supabase/                schema.sql — the `saves` table + RLS policies (see Cloud sync above)
tests/                   Vitest unit tests
```

## Roadmap

Moved to dedicated files so they don't drift out of sync with two copies: outstanding
work (features, content gaps, tech debt, known SPEC/code discrepancies) is tracked in
[TODO.md](TODO.md); the lesson-by-lesson content plan per level is in
[CURRICULUM.md](CURRICULUM.md).

## License

MIT — see [LICENSE](LICENSE).

# 2. Goals and non-goals

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [02-goals_ru.md](02-goals_ru.md) and must be kept in sync.

## Goals

- Fast local development: `npm install && npm run dev` and the app is live in under 10 seconds.
- Content is **data, not code** — adding a lesson never requires touching application source.
- Fully static build deployable to GitHub Pages via a single GitHub Actions workflow.
- All progress stored locally (localStorage) with **export/import** of a save file.
- Two sequential taxonomies, mirroring the Swedish system: **SFI** (kurs A, B, C, D) and,
  after it, **SVA grundläggande** (the komvux course, delkurs 1–4). A lesson belongs to
  exactly one level. See `CURRICULUM.md` for the full ladder.
- Multiple study modes per topic, not just quizzes.
- Typed, validated content: a broken lesson file fails CI, not the user's browser.

## Non-goals (for v1)

- No server, no user accounts, no database, no multiplayer.
- No paid TTS or audio asset hosting — use the browser's Web Speech API.
- No native mobile apps (a PWA is enough).
- No AI-generated content at runtime.

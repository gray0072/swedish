# 16. Implementation phases

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [16-phases_ru.md](16-phases_ru.md) and must be kept in sync.

**Phase 1 — Skeleton (day 1)**
Vite + React + TS + Tailwind + router + AppShell. The §11 palette and typography go into
`tailwind.config.ts` **now**, not later — retrofitting a visual identity onto finished screens
costs several times more than starting with it. Header with the `RU / EN` toggle. Empty pages,
deployment pipeline green, site live on GitHub Pages.

**Phase 2 — Content pipeline**
Zod schemas, `import.meta.glob` loader, registry, validation script, 3 sample A1 lessons.
Tracks/levels/lesson-list pages rendering real content.

**Phase 3 — Lesson page**
Theory renderer, vocabulary table, word cards, TTS.

**Phase 4 — Quiz engine**
PRNG, selection, generators, grading, the runner UI, `mc` / `type-answer` / `gap` types,
result screen. Unit tests for engine and grading.

**Phase 5 — Progress and rewards**
Zustand stores, persistence with migrations, XP/coins, streak, export/import, stats page.

**Phase 6 — Remaining question types**
`order`, `match`, `listen`, `article`, `plural`, `verb-form`, `multi`, `true-false`.

**Phase 7 — Spaced repetition**
Leitner scheduler, `/review` page, due counts on Home.

**Phase 8 — The city**
Eras, buildings, shop, perk selectors, city map, achievements, aurora celebration.
Era cards with their §12.3 historical anchors.

**Phase 8b — History layer**
History cards (`content/history/`), unlocking by building, coin reward, key vocabulary feeding
the SRS deck. Themed lesson packs from §12.5. Ornament set: dala horse loader, kurbits dividers,
Younger Futhark seals, serpent-band era frames.

**Phase 9 — Content scale-up**
SFI kurs A/B filled out, kurs C/D built up, first text-based lessons for SVA grund delkurs 1.

**Phase 9b — Reference section**
The summaries, the generated word bank and the everyday dialogues, behind one `/reference` entry
with three tabs. Full plan in [REFERENCE.md](REFERENCE.md) and [DIALOGUES.md](DIALOGUES.md).

**Phase 10 — Polish**
PWA, offline, i18n completion, accessibility audit, Lighthouse ≥ 95.

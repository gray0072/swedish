# 4. Repository structure

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [04-repository-structure_ru.md](04-repository-structure_ru.md) and must be kept in sync.

```
swedish/
├─ .github/
│  └─ workflows/
│     ├─ deploy.yml              # build + deploy to GitHub Pages
│     └─ validate.yml            # typecheck, lint, content validation, tests
├─ public/
│  ├─ .nojekyll                  # required so /_assets is served by Pages
│  ├─ favicon.svg
│  ├─ manifest.webmanifest       # PWA
│  └─ img/
│     ├─ ornament/               # dala horse, kurbits, runes, serpent band (see §11.4)
│     ├─ history/                # history card illustrations
│     └─ city/                   # building illustrations (SVG preferred)
│        ├─ tribe/
│        ├─ viking/
│        ├─ medieval/
│        ├─ empire/
│        ├─ industrial/
│        ├─ modern/
│        ├─ green/
│        ├─ connected/
│        ├─ floating/
│        └─ stellar/
├─ content/                      # ── ALL LEARNING CONTENT LIVES HERE ──
│  ├─ tracks.json                # track + level definitions (SFI, SVA grundläggande)
│  ├─ curricula/                 # ordered playlists of lesson ids
│  │  ├─ sfi-a.json
│  │  ├─ sfi-b.json
│  │  ├─ sfi-c.json
│  │  └─ sfi-d.json
│  ├─ lessons/
│  │  ├─ sfi-a/                  # folder name == level id == lesson id prefix
│  │  │  ├─ greetings/
│  │  │  │  ├─ lesson.json       # metadata
│  │  │  │  ├─ theory.md         # short theory, English (optional)
│  │  │  │  ├─ vocab.json        # word list (optional)
│  │  │  │  └─ questions.json    # handwritten pool + generator config
│  │  │  ├─ alphabet/
│  │  │  ├─ numbers-0-20/
│  │  │  └─ personal-info/
│  │  ├─ sfi-b/
│  │  ├─ sfi-c/
│  │  └─ ...
│  ├─ reference/                 # language summaries — not lessons (see REFERENCE.md)
│  │  ├─ index.json              # slug → group + order for the article list
│  │  ├─ verb-groups.md          # English is canonical …
│  │  ├─ verb-groups_ru.md       # … the _ru file is its translation
│  │  ├─ word-order.md
│  │  └─ noun-genders.md
│  ├─ dialogues/                 # everyday scenes (see DIALOGUES.md) — no quiz, no XP
│  │  ├─ laundry-room.json
│  │  ├─ cleaning-day.json
│  │  └─ developers-deadline.json
│  ├─ history/                   # history cards (see §12.4) — no quiz, unlocked by buildings
│  │  ├─ birka.json
│  │  ├─ runstenar.json
│  │  ├─ birger-jarl-1252.json
│  │  ├─ vasa-1628.json
│  │  └─ tunnelbanan.json
│  └─ city/
│     ├─ eras.json               # 10 eras of Stockholm (6 historical + 4 speculative)
│     └─ buildings.json          # buildings, perks, prerequisites, map positions
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ routes.tsx
│  ├─ content/                   # content loading & indexing layer
│  │  ├─ schema.ts               # Zod schemas + inferred TS types
│  │  ├─ loader.ts               # import.meta.glob → typed registry
│  │  ├─ registry.ts             # lookup helpers (byId, byLevel, byTrack, search)
│  │  └─ generators.ts           # vocab → auto-generated quiz items
│  ├─ quiz/
│  │  ├─ engine.ts               # question selection, scoring, session state machine
│  │  ├─ selection.ts            # weighted/SRS-aware picking from the pool
│  │  ├─ grading.ts              # per-question-type answer checking
│  │  └─ prng.ts                 # deterministic seeded RNG (mulberry32)
│  ├─ srs/
│  │  └─ scheduler.ts            # Leitner/SM-2-lite review scheduling
│  ├─ city/
│  │  └─ economy.ts              # ALL prices, level caps, era XP thresholds, reward rates
│  ├─ store/
│  │  ├─ progress.ts             # lessons completed, item history, streak
│  │  ├─ wallet.ts               # XP, coins, level
│  │  ├─ city.ts                 # owned buildings, current era, perks
│  │  ├─ settings.ts             # UI language, theme, TTS voice, sound
│  │  └─ persist.ts              # versioned save schema + migrations + export/import
│  ├─ components/
│  │  ├─ layout/                 # AppShell, Nav, Footer
│  │  ├─ lesson/                 # TheoryView, VocabTable, WordCard, AudioButton
│  │  ├─ quiz/                   # QuizRunner + one component per question type
│  │  ├─ city/                   # CityMap, BuildingCard, EraTimeline, ShopDialog
│  │  └─ ui/                     # Button, Card, Dialog, ProgressBar, Toast, Confetti
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  ├─ TracksPage.tsx
│  │  ├─ LevelPage.tsx
│  │  ├─ LessonPage.tsx
│  │  ├─ QuizPage.tsx
│  │  ├─ ResultPage.tsx
│  │  ├─ ReviewPage.tsx          # global SRS session across all lessons
│  │  ├─ CityPage.tsx
│  │  ├─ ReferencePage.tsx       # hub: summaries / word bank / dialogues
│  │  ├─ StatsPage.tsx
│  │  └─ SettingsPage.tsx
│  ├─ i18n/
│  │  ├─ index.ts
│  │  └─ locales/{ru,en}.json
│  ├─ lib/
│  │  ├─ tts.ts                  # speechSynthesis wrapper with sv-SE voice selection
│  │  ├─ format.ts
│  │  └─ shuffle.ts
│  └─ styles/index.css
├─ scripts/
│  ├─ validate-content.ts        # Zod-validate every content file; used in CI
│  ├─ new-lesson.ts              # scaffold a lesson folder from a template
│  └─ content-stats.ts           # report pool sizes, missing translations
├─ tests/
│  ├─ quiz-engine.test.ts
│  ├─ selection.test.ts
│  ├─ grading.test.ts
│  ├─ generators.test.ts
│  ├─ economy.test.ts            # the price/XP curve stays in its designed band
│  └─ content.test.ts            # every content file parses against its schema
├─ index.html
├─ vite.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
├─ package.json
├─ SPEC.md
├─ SPEC_ru.md
└─ README.md
```

## One lesson, one level — with playlists on top

A lesson is a **content unit** that belongs to exactly one level: its folder name, its `id`
(`sfi-a/greetings`) and the single entry in its `levels` array all say the same thing.
`scripts/validate-content.ts` enforces that, so a lesson can never drift away from its folder.

A curriculum is an **ordered playlist referencing lesson ids** — `content/curricula/sfi-a.json`
sets the teaching order inside a level. A playlist may reference any lesson id, so a future
revision pack can pull lessons from several levels without duplicating content.

## Reference material is not a course

`content/reference/` and `content/dialogues/` hold the material that a ladder of five-minute
lessons cannot carry: summaries of a whole system (the verb groups, every noun declension, the
parts of speech), a generated word bank of every vocabulary item in the app in all its forms,
and everyday dialogues. None of it is scored, gated or tied to a level. The plan for both lives
in [REFERENCE.md](REFERENCE.md) and [DIALOGUES.md](DIALOGUES.md); the whole section is reached
through a single navigation entry with three tabs, so it adds depth without adding chrome.

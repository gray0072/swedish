# Swedish Learning App — Implementation Brief

> This document is the single source of truth for building the app. It describes the vision,
> tech stack, folder structure, data model, quiz logic, gamification system, and delivery plan.
> A Russian version lives in [SPEC_ru.md](SPEC_ru.md) and must be kept in sync.

## 0. Locked decisions

These are settled — do not re-litigate them during implementation.

| Decision | Value |
|---|---|
| Repository name | `swedish` → Vite `base: '/swedish/'`, site at `https://<user>.github.io/swedish/` |
| Site title | **Swedish** (`<title>Swedish</title>`, PWA `name`, header wordmark) |
| Study languages | **Russian and English only.** A toggle in the page header switches both the UI and the translations shown; the choice is persisted in localStorage. Default: **English** |
| Swedish UI locale | Deferred past v1. Swedish appears as *content*, not as an interface language |
| Level structure | Course and delkurs **names** follow Skolverket; the topic breakdown inside them is a **pragmatic approximation**. Stated honestly in the UI |
| Lesson length | **≤ 5 minutes.** Anything longer is split into numbered parts. Enforced by content validation |
| Visual style | **Swedish national style** — Nordic functionalism for the learning UI, Dalarna folk for warmth, Viking-age carving for the city. Full spec in §11 |
| Narrative theme | **Vikings and the real history of Sweden and Stockholm.** Every era, building and history card is anchored to verified facts. Full spec in §12 |

---

## 1. Vision

A **static, offline-friendly web app for learning Swedish**, hosted on GitHub Pages, with **no backend**.

The core loop:

1. The learner picks a **topic** (a lesson) from a level track.
2. The lesson shows **short theory** and/or a **vocabulary list**, with audio.
3. The learner presses **"Take the test"** → 10 questions drawn from a pool of ~100.
4. Passing awards **XP** (measures learning) and **coins** (spendable currency).
5. Coins are spent on **building the city of Stockholm**, progressing from a prehistoric
   tribe through the Viking age to modern Stockholm.
6. Buildings grant **perks** that feed back into learning (XP bonuses, extra review slots,
   themed lesson packs), closing the loop.

The guiding principle: **many different ways to study Swedish, each with positive reinforcement**.
Never punish. No lives, no hard fails, no losing progress. Wrong answers simply mean the item
comes back sooner in review.

---

## 2. Goals and non-goals

### Goals

- Fast local development: `npm install && npm run dev` and the app is live in under 10 seconds.
- Content is **data, not code** — adding a lesson never requires touching application source.
- Fully static build deployable to GitHub Pages via a single GitHub Actions workflow.
- All progress stored locally (localStorage) with **export/import** of a save file.
- Two sequential taxonomies, mirroring the Swedish system: **SFI** (kurs A, B, C, D) and,
  after it, **SVA grundläggande** (the komvux course, delkurs 1–4). A lesson belongs to
  exactly one level. See `CURRICULUM.md` for the full ladder.
- Multiple study modes per topic, not just quizzes.
- Typed, validated content: a broken lesson file fails CI, not the user's browser.

### Non-goals (for v1)

- No server, no user accounts, no database, no multiplayer.
- No paid TTS or audio asset hosting — use the browser's Web Speech API.
- No native mobile apps (a PWA is enough).
- No AI-generated content at runtime.

---

## 3. Tech stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** (strict) | Content schemas + gamification state benefit enormously from types |
| Build tool | **Vite** | Instant HMR, trivial static output, first-class GitHub Pages support |
| UI | **React 18** | Largest ecosystem, easy for contributors |
| Routing | **React Router** with `HashRouter` | Hash routing works on GitHub Pages with zero server config |
| State | **Zustand** + `persist` middleware | Tiny, no boilerplate, localStorage persistence built in |
| Styling | **Tailwind CSS** | Fast iteration, consistent spacing/colour scale, dark mode out of the box |
| Content loading | `import.meta.glob` (eager) | Auto-discovers lesson files; no manual index to maintain |
| Validation | **Zod** | Same schemas used at build time (CI) and in dev-mode runtime checks |
| Markdown | `react-markdown` + `remark-gfm` | Theory is authored in Markdown |
| Tests | **Vitest** + **@testing-library/react** | Same config as Vite, zero extra setup |
| Audio | **Web Speech API** (`speechSynthesis`, `sv-SE`) | Free, offline, no assets to host |
| Icons | **lucide-react** | Consistent, tree-shakeable |

> **Alternative considered:** SvelteKit or Astro with static adapter. Both are excellent, but
> React + Vite has the lowest friction for contributors and the largest component ecosystem.
> If the app grows heavily content-first, Astro becomes the better choice — revisit at v2.

---

## 4. Repository structure

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
│        └─ modern/
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
│  ├─ grammar/                   # standalone reference articles (not lessons)
│  │  ├─ word-order.md
│  │  ├─ noun-genders.md
│  │  └─ verb-groups.md
│  ├─ history/                   # history cards (see §12.4) — no quiz, unlocked by buildings
│  │  ├─ birka.json
│  │  ├─ runstenar.json
│  │  ├─ birger-jarl-1252.json
│  │  ├─ vasa-1628.json
│  │  └─ tunnelbanan.json
│  └─ city/
│     ├─ eras.json               # 6 eras of Stockholm
│     └─ buildings.json          # buildings, costs, perks, prerequisites
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
│  │  ├─ GrammarPage.tsx
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

### One lesson, one level — with playlists on top

A lesson is a **content unit** that belongs to exactly one level: its folder name, its `id`
(`sfi-a/greetings`) and the single entry in its `levels` array all say the same thing.
`scripts/validate-content.ts` enforces that, so a lesson can never drift away from its folder.

A curriculum is an **ordered playlist referencing lesson ids** — `content/curricula/sfi-a.json`
sets the teaching order inside a level. A playlist may reference any lesson id, so a future
revision pack can pull lessons from several levels without duplicating content.

---

## 5. Content data model

All types are defined with Zod in `src/content/schema.ts` and exported as inferred TS types.

### 5.1 Tracks and levels — `content/tracks.json`

```jsonc
{
  "tracks": [
    {
      "id": "sfi",
      "title": { "en": "SFI (Swedish for immigrants)", "sv": "Utbildning i svenska för invandrare" },
      "note": { "en": "Courses A–D are the official SFI names, grouped into three study paths." },
      "levels": [
        { "id": "sfi-a", "title": { "en": "SFI kurs A (≈ pre-A1)" }, "order": 1 },
        { "id": "sfi-b", "title": { "en": "SFI kurs B (≈ A1)" }, "order": 2 },
        { "id": "sfi-c", "title": { "en": "SFI kurs C (≈ A1+)" }, "order": 3 },
        { "id": "sfi-d", "title": { "en": "SFI kurs D (≈ A2)" }, "order": 4 }
      ]
    },
    {
      "id": "sva-grund",
      "title": { "en": "SVA — basic level (komvux)", "sv": "Svenska som andraspråk, grundläggande nivå" },
      "note": { "en": "A 700-point komvux course of four delkurser; it follows SFI kurs D." },
      "levels": [
        { "id": "sva-grund-1", "title": { "en": "SVA grund delkurs 1 (≈ A2+)" }, "order": 1 },
        { "id": "sva-grund-2", "title": { "en": "SVA grund delkurs 2 (≈ B1)" }, "order": 2 },
        { "id": "sva-grund-3", "title": { "en": "SVA grund delkurs 3 (≈ B1)" }, "order": 3 },
        { "id": "sva-grund-4", "title": { "en": "SVA grund delkurs 4 (≈ B1+)" }, "order": 4 }
      ]
    }
  ]
}
```

`LocalizedString` = `{ ru?: string; en?: string; sv?: string }`. Resolution order for display:
current study language (`ru` or `en`) → the other one → `sv` → first available key.

The `sv` key inside a `LocalizedString` is for *content* (Swedish titles, flavour text), not for
a Swedish interface — the UI itself only ships `ru` and `en`.

### 5.2 Lesson metadata — `content/lessons/<level>/<slug>/lesson.json`

```jsonc
{
  "id": "sfi-a/greetings",
  "slug": "greetings",
  "title": { "sv": "Hälsningar", "ru": "Приветствия", "en": "Greetings" },
  "summary": { "ru": "Как здороваться и прощаться по-шведски." },
  "kind": "vocab",                       // "vocab" | "grammar" | "phrases" | "mixed"
  "levels": ["sfi-a"],                   // exactly one level; must match the folder
  "tags": ["everyday", "speaking"],
  "estimatedMinutes": 5,                 // HARD CAP: 5. Longer topics must be split
  "part": null,                          // or { "series": "food", "index": 1, "of": 3 }
  "order": 10,                           // sort hint within its level
  "prerequisites": [],                   // lesson ids that should be done first (soft gate)
  "xp": { "base": 100 },                 // XP for a first-time pass
  "quiz": { "questionsPerRun": 10, "passScore": 7 },
  "cityUnlock": null                     // optional building id this lesson unlocks
}
```

**The 5-minute rule.** A lesson must be completable in about five minutes: roughly ≤ 400 words of
theory and ≤ 25 vocabulary items, plus a 10-question quiz. A topic that does not fit is split into
a series of parts, each a normal standalone lesson:

```
content/lessons/sfi-b/food-1/   → { "part": { "series": "food", "index": 1, "of": 3 } }
content/lessons/sfi-b/food-2/   → { "part": { "series": "food", "index": 2, "of": 3 } }
content/lessons/sfi-b/food-3/   → { "part": { "series": "food", "index": 3, "of": 3 } }
```

Parts render in the lesson list as a grouped card ("Food · 3 parts") with a shared progress ring,
and finishing one part offers the next directly on the result screen. Each part still has its own
pool, its own XP and its own completion state — a series is a display grouping, not a unit of work.

### 5.3 Theory — `theory.md`

Plain Markdown. Keep it under ~400 words. Supported extras:

- Tables (GFM) for conjugations and declensions.
- Fenced blocks with the `example` language for sentence pairs:

````markdown
```example
Hej! — Hi!
God morgon! — Good morning!
```
````

Every Swedish string rendered from theory gets a small speaker button injected automatically.

An optional `theory_ru.md` next to it carries the Russian translation. `LessonPage` picks
`theory_ru.md` when the study-language toggle is set to Russian, falling back to
`theory.md` when only one of the two files exists — so a lesson may ship English-only
theory (the default) or both languages.

### 5.4 Vocabulary — `vocab.json`

```jsonc
{
  "items": [
    {
      "id": "hej",
      "sv": "hej",
      "translations": { "ru": "привет", "en": "hi" },
      "pos": "interjection",              // noun | verb | adj | adv | pron | prep | phrase | ...
      "gender": null,                     // "en" | "ett" | null  (nouns only)
      "forms": null,                      // see below
      "example": {
        "sv": "Hej, hur mår du?",
        "ru": "Привет, как дела?"
      },
      "note": { "ru": "Универсальное приветствие, подходит в любой ситуации." }
    },
    {
      "id": "bok",
      "sv": "bok",
      "translations": { "ru": "книга", "en": "book" },
      "pos": "noun",
      "gender": "en",
      "forms": {
        "indefSg": "en bok", "defSg": "boken",
        "indefPl": "böcker", "defPl": "böckerna"
      }
    },
    {
      "id": "tala",
      "sv": "tala",
      "translations": { "ru": "говорить", "en": "to speak" },
      "pos": "verb",
      "verbGroup": 1,
      "forms": {
        "infinitive": "tala", "present": "talar",
        "past": "talade", "supine": "talat", "imperative": "tala"
      }
    }
  ]
}
```

### 5.5 Questions — `questions.json`

The pool is **handwritten items + auto-generated items**. A 25-word vocab list expands into
100+ questions automatically, which is what makes "100 questions per topic" realistic.

```jsonc
{
  "generators": [
    { "type": "sv-to-native-mc", "from": "vocab", "count": "all" },
    { "type": "native-to-sv-mc", "from": "vocab", "count": "all" },
    { "type": "type-answer",     "from": "vocab", "count": "all", "direction": "native-to-sv" },
    { "type": "listen-mc",       "from": "vocab", "count": "all" },
    { "type": "article",         "from": "vocab", "filter": { "pos": "noun" } },
    { "type": "plural",          "from": "vocab", "filter": { "pos": "noun" } },
    { "type": "verb-form",       "from": "vocab", "filter": { "pos": "verb" },
      "targets": ["present", "past", "supine"] }
  ],
  "items": [
    {
      "id": "q-greet-01",
      "type": "mc",
      "difficulty": 1,                    // 1..3, used for weighting
      "prompt": { "ru": "Как сказать «Доброе утро»?" },
      "choices": ["God morgon", "God natt", "Hej då", "Tack"],
      "answer": 0,
      "explanation": { "ru": "«God morgon» — до примерно 10 утра." },
      "tags": ["greetings"]
    },
    {
      "id": "q-greet-02",
      "type": "gap",
      "prompt": { "sv": "___ morgon! Hur mår du?" },
      "answer": ["God"],
      "acceptAlso": ["god"],
      "hint": { "ru": "Пожелание перед словом «утро»." }
    },
    {
      "id": "q-greet-03",
      "type": "order",
      "prompt": { "ru": "Собери предложение: «Меня зовут Анна.»" },
      "tokens": ["Jag", "heter", "Anna"],
      "answer": [0, 1, 2]
    },
    {
      "id": "q-greet-04",
      "type": "match",
      "prompt": { "ru": "Сопоставь приветствия с переводом." },
      "pairs": [
        ["Hej då", "Пока"],
        ["Vi ses", "Увидимся"],
        ["God natt", "Спокойной ночи"]
      ]
    },
    {
      "id": "q-greet-05",
      "type": "listen",
      "audioText": "God kväll",
      "prompt": { "ru": "Что ты услышал(а)?" },
      "choices": ["God kväll", "God morgon", "God natt", "Godis"],
      "answer": 0
    }
  ]
}
```

### 5.6 Question types (v1)

| Type | Interaction | Notes |
|---|---|---|
| `mc` | Single choice, 4 options | Keyboard `1`–`4` |
| `multi` | Multiple correct choices | Partial credit allowed |
| `type-answer` | Free text input | Normalised: trim, case-insensitive, `å ä ö` required, punctuation ignored; near-miss (Levenshtein ≤ 1) shows "almost — check the spelling" and counts as correct with reduced XP |
| `gap` | Fill the blank in a sentence | Supports multiple blanks |
| `order` | Drag/click word chips into order | Critical for Swedish V2 word order |
| `match` | Match pairs (3–5) | Counts as one question |
| `listen` | TTS plays Swedish, learner picks/types | Skipped gracefully if no `sv-SE` voice |
| `article` | Choose `en` / `ett` | Generated from nouns |
| `plural` | Type or pick the plural form | Generated from nouns |
| `verb-form` | Produce present/past/supine | Generated from verbs |
| `true-false` | Statement validity | Cheap to author |

Every type implements one interface so the runner stays generic:

```ts
interface QuestionRenderer<Q extends Question> {
  Component: React.FC<{ question: Q; onAnswer: (a: Answer) => void; disabled: boolean }>;
  grade(question: Q, answer: Answer): GradeResult;   // { correct, partial?: number, feedback? }
}
```

### 5.7 Distractor generation

For generated multiple-choice items, wrong options are picked from the **same lesson first**,
then the same level, preferring the same part of speech and similar word length. This produces
plausible distractors instead of absurd ones. Never allow a distractor whose translation equals
the correct answer's translation.

---

## 6. Quiz engine logic

### 6.1 Session creation

```
createSession(lessonId, opts) →
  pool = handwrittenItems ∪ generatedItems(vocab, generators)
  eligible = pool minus items shown in the immediately previous attempt
             (unless that would leave fewer than questionsPerRun items)
  weights:
     unseen item                     → 3.0
     answered wrong last time        → 2.5
     answered correct once           → 1.0
     answered correct 3+ times       → 0.4
     difficulty multiplier           → 0.9 / 1.0 / 1.15 for difficulty 1 / 2 / 3
  pick `questionsPerRun` items by weighted sampling without replacement
  shuffle choices inside each item using the session seed
```

- The **session seed** is `hash(lessonId + attemptNumber + Date)` and is stored with the
  session so a run can be replayed exactly (useful for bug reports and tests).
- The RNG is a deterministic `mulberry32` — no `Math.random()` in engine code, so tests are
  reproducible.
- Question type mix is balanced: never more than 40% of a run from a single generated type.

### 6.2 Running a session

State machine: `idle → question → feedback → (question | summary)`.

- Immediate feedback after each answer: correct/incorrect, correct answer, explanation, audio.
- A **"one free retry"** rule: the first wrong answer in a run may be retried once for half
  credit. This is positive reinforcement, not punishment.
- Progress bar with per-question dots; keyboard-first (`1`–`4`, `Enter`, `Esc`).
- The learner can quit anytime; partial progress is saved but no XP is awarded below the
  pass threshold.

### 6.3 Scoring

```
correctPoints    = 10 per fully correct answer
partialPoints    = 5 for a retry-correct or partially-correct answer
score            = correct + 0.5 * retryCorrect        // out of questionsPerRun
passed           = score >= passScore                   // default 7 of 10

xpAwarded  = lesson.xp.base * (score / total)
           * firstPassMultiplier        // 1.0 first pass, 0.3 for repeats
           * perfectBonus               // 1.25 if score == total
           * cityPerkXpMultiplier       // from owned buildings, e.g. 1.10
           * streakMultiplier           // 1.0 + min(streakDays, 10) * 0.02  → max 1.2

coinsAwarded = round(xpAwarded * 0.5) * cityPerkCoinMultiplier
```

**Anti-grinding:** repeats of an already-passed lesson give 30% XP, and a per-lesson daily cap
of 2 rewarded runs applies. Unrewarded runs still update SRS history — practice is always
allowed, just not farmable.

### 6.4 Spaced repetition

Every question item the learner has seen enters a global review deck, scheduled with a
Leitner-box scheduler (boxes 0–5 → intervals 0, 1, 3, 7, 16, 35 days).

- Correct → move up one box. Wrong → back to box 0.
- `/review` runs a mixed session of everything due today, across all lessons.
- Daily review completion grants a fixed coin bonus and protects the streak.
- The Home page shows "N items due today" as the primary call to action.

---

## 7. Progress, persistence and the save file

Everything is stored in localStorage under one versioned key: `swedish-app:v1`.

```ts
interface SaveFile {
  version: 1;
  createdAt: string;
  profile: { name?: string; language: 'ru' | 'en' };   // UI + translations, one setting
  wallet: { xp: number; coins: number; level: number };
  streak: { current: number; longest: number; lastActiveDate: string; freezesAvailable: number };
  lessons: Record<LessonId, {
    attempts: number;
    bestScore: number;
    passed: boolean;
    lastAttemptAt: string;
    rewardedRunsToday: number;
  }>;
  items: Record<ItemId, {
    box: 0|1|2|3|4|5;
    dueAt: string;
    seen: number; correct: number; wrong: number;
    lastSeenAt: string;
  }>;
  city: {
    era: EraId;
    buildings: Record<BuildingId, { level: number; builtAt: string }>;
  };
  achievements: AchievementId[];
  settings: { theme: 'system'|'light'|'dark'; tts: { voice?: string; rate: number }; sound: boolean };
}
```

Rules:

- `persist.ts` owns a `migrations` map keyed by version; a save from an older version is
  migrated forward, never dropped.
- **Export / Import** buttons in Settings download/upload this JSON. This is the backup story
  for a backend-free app and must exist in v1.
- A corrupted save must never crash the app: parse with Zod, fall back to a fresh save, and
  show a non-blocking toast.

---

## 8. Gamification — Building Stockholm

### 8.1 Currencies

- **XP** — never spent. Drives the learner level and unlocks eras. Pure progress metric.
- **Coins (kronor)** — spent on buildings. Earned from quizzes, reviews, streaks, achievements.
- **Streak** — consecutive active days. Grants an XP multiplier. A **streak freeze** (earned
  weekly, stored, max 2) auto-consumes on a missed day instead of resetting the streak.

### 8.2 Eras

The city advances through six eras. An era unlocks when the learner reaches its XP threshold
**and** has built the required number of buildings in the previous era.

| # | Era id | Name | Unlock XP | Theme |
|---|---|---|---|---|
| 1 | `tribe` | Bosättningen (The Settlement) | 0 | Huts, campfire, first tools |
| 2 | `viking` | Vikingatiden (~800–1050) | 1 500 | Birka, longhouse, harbour, rune stone |
| 3 | `medieval` | Medeltiden (from 1252) | 5 000 | Gamla Stan, Storkyrkan, city wall, Riddarholmen |
| 4 | `empire` | Stormaktstiden (1600s) | 12 000 | Vasa shipyard, Royal Palace, Riddarhuset |
| 5 | `industrial` | Industrialismen (1800s) | 25 000 | Central Station, Skansen, Stadshuset |
| 6 | `modern` | Moderna Stockholm | 45 000 | T-bana, Avicii Arena, Vasa Museum, ABBA Museum |

Each era has a distinct visual palette and material language; the shoreline underneath never
changes. Historical anchors, era cards and accuracy rules for all six eras are in §12.3 — the
eras are real history, not fantasy set dressing.

### 8.3 Buildings — `content/city/buildings.json`

```jsonc
{
  "buildings": [
    {
      "id": "campfire",
      "era": "tribe",
      "name": { "sv": "Lägerelden", "ru": "Костёр", "en": "Campfire" },
      "description": { "ru": "Первое место, где племя собирается и учит новые слова." },
      "cost": { "coins": 50 },
      "requires": [],
      "maxLevel": 3,
      "costGrowth": 1.8,                 // cost of level n = cost * growth^(n-1)
      "perk": { "type": "xpMultiplier", "valuePerLevel": 0.03 },
      "image": "/img/city/tribe/campfire.svg",
      "position": { "x": 42, "y": 61 },  // % coordinates on the city map
      "flavour": { "sv": "Elden brinner. Vi lär oss tillsammans." }
    },
    {
      "id": "runestone",
      "era": "viking",
      "name": { "sv": "Runstenen", "ru": "Рунный камень" },
      "cost": { "coins": 400 },
      "requires": ["longhouse"],
      "maxLevel": 1,
      "perk": { "type": "unlockLessonPack", "packId": "viking-words" },
      "position": { "x": 70, "y": 33 }
    },
    {
      "id": "library",
      "era": "medieval",
      "name": { "sv": "Biblioteket", "ru": "Библиотека" },
      "cost": { "coins": 1200 },
      "maxLevel": 5,
      "perk": { "type": "extraReviewSlots", "valuePerLevel": 5 }
    }
  ]
}
```

### 8.4 Perk types

| Perk | Effect |
|---|---|
| `xpMultiplier` | +N% XP from every quiz |
| `coinMultiplier` | +N% coins from every quiz |
| `dailyIncome` | +N coins granted on the first visit each day (Harbour, Market) |
| `extraReviewSlots` | Larger daily review session cap |
| `streakFreeze` | +1 stored streak freeze per week |
| `unlockLessonPack` | Unlocks a themed set of lessons (Viking words, Gamla Stan tour, Vasa ship) |
| `hintToken` | Grants free hints usable during a quiz |
| `cosmetic` | Visual only — decorations, seasonal skins |

Perks are computed by a pure selector `getActivePerks(city) → PerkTotals` so the quiz engine
never reaches into the city store directly.

### 8.5 The learning ↔ city loop

The connection must be **explicit and visible**:

- The result screen shows: `+180 XP · +90 kr` and, if a purchase is now affordable,
  "You can now build the Longhouse →".
- Every building's card names the perk in learning terms ("Library +25% review capacity").
- `unlockLessonPack` buildings gate *bonus* content only — never core curriculum. Progress in
  the language must never be blocked by the game.
- Achievements bridge both: "Ordförråd 500" (500 words seen), "Sju dagar i rad" (7-day streak),
  "Stockholms grundare" (complete the medieval era).

---

## 9. Routing (HashRouter)

| Path | Page |
|---|---|
| `/` | Home: due reviews, streak, continue-learning card, city snapshot |
| `/tracks` | Both tracks (SFI / SVA grundläggande) |
| `/tracks/:trackId/:levelId` | Lesson list for a level, with progress rings |
| `/lesson/:levelId/:slug` | Theory + vocabulary + "Take the test" |
| `/lesson/:levelId/:slug/quiz` | Quiz runner |
| `/lesson/:levelId/:slug/result` | Result + rewards + next step |
| `/review` | Global SRS session |
| `/city` | Stockholm map, shop, era timeline |
| `/grammar` and `/grammar/:slug` | Reference articles |
| `/stats` | Charts: words learned, accuracy, activity heatmap |
| `/settings` | Language, theme, TTS, export/import, reset |

---

## 10. UI/UX requirements

- **Mobile-first.** Most study happens on a phone. Quiz answer targets ≥ 44 px.
- **Dark mode** via Tailwind `class` strategy, defaulting to system preference.
- **Language toggle in the header.** A single `RU / EN` switch sits in the top bar on every page.
  It controls **both** the interface language and the translation shown next to Swedish — there is
  one language setting, not two. Default: `en`. Persisted to localStorage under
  `swedish-app:language` (written eagerly on change, also mirrored into the save file) and read
  before first paint so there is no flash of the wrong language.
  All UI strings go through `i18n`; no hardcoded text in components. Swedish is content only —
  there is no Swedish interface locale in v1.
- **Level labelling honesty:** every track carries a `note` rendered above its levels, saying that
  the topic breakdown inside the courses is a pragmatic approximation, not the official
  Skolverket syllabus.
- **Audio everywhere:** every Swedish word, example and question prompt has a speaker button.
  On first load, warn once if no `sv-SE` voice is installed, with a link to OS instructions.
- **Positive feedback:** an aurora sweep on a perfect run, a coin-count animation, subtle sounds
  (mutable), encouraging copy in Swedish. Full motion and voice spec in §11.6–11.7.
- **Accessibility:** full keyboard navigation, visible focus rings, `aria-live` for feedback,
  respect `prefers-reduced-motion`, contrast ≥ 4.5:1.
- **PWA:** installable, offline-capable via a service worker precaching the app shell and
  all content JSON.

---

## 11. Visual identity — Swedish national style

### 11.1 Three layers, never mixed at random

| Layer | Where it lives | Character |
|---|---|---|
| **Nordic functionalism (funkis)** | The whole learning surface: lessons, quizzes, stats, settings | Light, calm, generous whitespace, honest materials, no ornament that doesn't earn its place. ~90% of the interface |
| **Swedish folk (Dalarna)** | Warmth and celebration: dividers, empty states, achievements, rewards | Falu red, kurbits florals, the Dala horse |
| **Viking age / rune stone** | The city, eras, badges | Younger Futhark, serpent bands, carved granite |

**The rule:** the learning surface is funkis. The city surface may be folk and Viking.
**Never decorate a quiz** — the learner is thinking, and ornament there is noise.

### 11.2 Palette

Defined as Tailwind tokens in `tailwind.config.ts`.

| Token | Hex | Use |
|---|---|---|
| `blue-flag` | `#006AA7` | Flag blue. Brand mark, links, national-day event. Never a large surface |
| `yellow-flag` | `#FECC00` | Flag yellow. Accent strokes only; never text on white (fails contrast) |
| `falu` | `#7C3228` | Falu rödfärg — the red of every Swedish cottage. Primary warm accent |
| `birch` | `#F6F2EA` | Light theme background — birch and paper, not pure white |
| `midnight` | `#0E2438` | Dark theme base — *polarnatt*, never pure black |
| `midnight-surface` | `#16324B` | Dark theme cards |
| `granite` | `#4A5259` | Secondary text, stone, borders |
| `pine` | `#2F4A3C` | Forest green — success states |
| `gold` | `#C8A24A` | Coins and rewards. Warmer and calmer than flag yellow |
| `lingon` | `#C0392B` | Errors — kept clearly distinct in hue and lightness from `falu` |
| `aurora` / `aurora-violet` | `#3FBF9F` / `#7B6CD9` | Northern-lights gradient. **Celebration only**, never chrome |

Contrast ≥ 4.5:1 in both themes. The flag colours are a garnish, not the base — a UI painted
in full blue and yellow reads as a sports kit, not as Swedish design.

### 11.3 Typography

- **Body / UI: Inter** (variable). Covers Latin, Cyrillic and `å ä ö`.
- **Display / era headings: Cormorant Garamond** — has Cyrillic, carries the historical register.
  One display face maximum.
- **Hard rule:** a font is disqualified unless it renders **both** `å ä ö` **and** Cyrillic.
  Test string: `Skärgård fjäll Öland — Шведский язык`.
- **Do not use Sweden Sans** — it is Sweden's official national typeface with a restricted
  licence, not free for third-party products.
- **Do not use "viking" or blackletter novelty fonts.** No Cyrillic, unreadable at UI sizes,
  and historically wrong — Norse writing was carved runes, not gothic script.
- Swedish words inside running text are set one weight heavier (semibold) so the target
  language always leads the eye.

### 11.4 Ornament and iconography

- **Dala horse (dalahäst)** — the app mascot and loading spinner. Flat silhouette, falu red,
  kurbits saddle. Originates from 17th-century woodcarving in Dalarna.
- **Kurbits** — Dalarna folk floral painting. Section dividers, achievement frames, empty states.
- **Eight-petal Nordic star** — bullet glyph, streak icon, divider.
- **Younger Futhark** (16 runes — the alphabet actually used in Viking-Age Sweden) — era 2
  ornament and achievement seals. **Never Elder Futhark, never Tolkien runes.**
- **Serpent band (ormslinga)** — the inscription band from Uppland rune stones, used as a
  frame around era headers.
- Icons: `lucide-react` as the base, plus hand-made SVGs for the Swedish specifics —
  dalahäst, kanelbulle, midsommarstång, the `T` of tunnelbanan.
- **No horned helmets. Ever.** They are a 19th-century opera costume invention. One of them
  in this app quietly discredits everything in section 12.

### 11.5 City illustration style

- Flat vector SVG, consistent 2 px stroke, limited palette per era, no photorealism,
  no gradients except the aurora celebration.
- A deliberate hand-carved irregularity — lines with a slight wobble, like a woodcut print.
- Isometric-lite: buildings face front with one small offset side plane. Keeps authoring cheap.
- Materials shift by era: hide and timber → wood and iron → brick and lime plaster →
  baroque stone → red brick, iron and glass → concrete, glass and light.
- **The map background is constant:** the Mälaren shoreline and the island of Stadsholmen.
  Water and rock never change; only what stands on them does. This is what makes the six eras
  read as one place across time.

### 11.6 Motion

- Calm by default: 150–200 ms, ease-out. The app should feel like it is made of paper and wood,
  not like a slot machine.
- Perfect run → an aurora sweep and gold coins, 1.2 s maximum.
- Building completed → the building "carves" itself in, stroke first, then fill.
- Streak milestone → a kurbits vine grows around the streak counter.
- Everything above is disabled under `prefers-reduced-motion`.

### 11.7 Voice

- Feedback micro-copy is **in Swedish**: `Bra jobbat!` `Nästan!` `Perfekt!` `Heja!`
  `Lycka till!` `Vi ses!` — with a translation shown on first encounter and on hover.
- Tone is **lagom**: warm, understated, confident. No `AMAZING!!!`, no exclamation storms,
  no manipulative urgency. Swedish design does not shout, and neither does this app.

---

## 12. Historical theme — Vikings and the story of Sweden and Stockholm

### 12.1 Why history carries the game

The city builder is the reward loop, and it is built on **real** history — so the reward
teaches as well. Every era is anchored to actual events and every building to a real place.
A learner who finishes the game knows Stockholm, not just a fantasy town.

### 12.2 Honest framing

Stockholm is first mentioned in writing in **1252**. Eras 1–2 are therefore *not* Stockholm —
they are the Mälaren region that became it, with Birka roughly 30 km west on Björkö. Say this
plainly in the era intro instead of pretending there were Vikings in Gamla Stan. The shoreline
on the map stays the same throughout; the city itself arrives in era 3.

### 12.3 Era anchors (verified facts, used in era cards and content)

**Era 1 — Bosättningen (prehistory)**
- The first settlers follow the retreating ice, roughly 12 000 BC.
- Bronze Age rock carvings (*hällristningar*) at Tanum — UNESCO World Heritage.
- *Ales stenar* in Skåne — a stone ship of 59 boulders, roughly 600 AD.
- Buildings: hut, campfire, rock carving, stone ship, hunting ground.

**Era 2 — Vikingatiden, c. 750–1050**
- **Birka** on Björkö in Lake Mälaren, c. 750–975 — one of Scandinavia's earliest towns;
  UNESCO World Heritage together with Hovgården.
- Ansgar's Christian mission reaches Birka around 830.
- Uppland alone holds roughly **2 500 rune stones** — the densest concentration in the world.
- Swedes travelled **east**: the Baltic, the rivers of the Rus', and Miklagård (Constantinople).
  Ingvar the Far-Travelled's expedition, c. 1040, is commemorated on some 25 rune stones.
- The script is **Younger Futhark**, 16 runes.
- *"Viking" was something you did* — a raiding and trading voyage — not a people. The people
  were Norse, Svear and Götar. The era card says this explicitly.
- Buildings: longhouse, harbour with a *långskepp*, rune stone, Birka trading square, smithy,
  *ting* assembly place.

**Era 3 — Medeltiden, from 1252**
- Stockholm first appears in the written record in **1252**, in letters connected to Birger Jarl.
- **Storkyrkan**, 13th century — the city's cathedral.
- **Riddarholmskyrkan**, a Greyfriars monastery church from the 1270s–80s — royal burial church.
- *Mårten Trotzigs gränd* — 90 cm at its narrowest, the slimmest alley in Gamla Stan.
- *Stockholms blodbad* — the Stockholm Bloodbath, November 1520.
- Buildings: city wall, Storkyrkan, Stortorget market, harbour crane, guildhall, Riddarholmen.

**Era 4 — Stormaktstiden, 1611–1721**
- **Vasa** capsized on her maiden voyage on **10 August 1628**, barely 1 300 m from the shipyard.
  Salvaged in **1961**; Vasamuseet opened in **1990** and is the most visited museum in Scandinavia.
- The Tre Kronor castle burned in **1697**; the present **Kungliga slottet** was completed in 1754.
- **Riddarhuset**, the House of Nobility, 1660s.
- Buildings: shipyard, the Vasa herself, Riddarhuset, royal palace, observatory, tar harbour.

**Era 5 — Industrialismen, 1800s**
- **Stockholm Central Station**, 1871.
- **Skansen**, 1891, founded by Artur Hazelius on Djurgården — the world's first open-air museum.
- The **Nobel Prize** is first awarded in 1901.
- **Stadshuset**, 1923, by Ragnar Östberg — the Nobel banquet is held in *Blå hallen*,
  the Blue Hall, which is famously not blue.
- Buildings: central station, gasworks, Skansen, Stadshuset, tram line, Nobel hall.

**Era 6 — Moderna Stockholm**
- The **tunnelbana** opened in 1950; around 90 of its 100 stations are decorated, which is why
  it is called *the world's longest art gallery*.
- **Globen**, 1989, renamed **Avicii Arena** in 2021.
- **ABBA** won Eurovision in 1974 with *Waterloo*; ABBA The Museum opened in 2013.
- **Slussen** rebuilt; the Gold Bridge was lifted into place in 2020.
- Buildings: an art metro station, Avicii Arena, Vasa Museum, ABBA Museum, Slussen, Fotografiska.

### 12.4 History cards — `content/history/`

A new lightweight content type: **not a lesson** — no quiz, no XP gate, no pass score.
120–200 words, a date, an illustration, and 5–8 Swedish key words.

```jsonc
{
  "id": "birka",
  "era": "viking",
  "unlockedBy": "trading-square",       // building id
  "title": { "sv": "Birka", "ru": "Бирка", "en": "Birka" },
  "date": { "from": 750, "to": 975 },
  "body": { "ru": "…", "en": "…" },
  "vocab": ["handel", "skepp", "silver", "resa", "hamn"],
  "image": "/img/history/birka.svg",
  "sources": ["UNESCO World Heritage List, Birka and Hovgården", "Riksantikvarieämbetet"]
}
```

Reading a card grants a small one-time coin reward, and **its vocabulary enters the SRS deck** —
so the history the learner reads for fun quietly becomes language practice they will be
re-tested on. This is the cheapest, most elegant bridge between the game and the learning.

### 12.5 Themed lesson packs unlocked by buildings

`unlockLessonPack` perks open real, useful lessons:

| Building | Pack | Content |
|---|---|---|
| Rune stone | `viking-words` | `skepp`, `hamn`, `handel`, `resa`, `sten`, `rista`, `minne`, plus how rune stone inscriptions are phrased: *"X lät resa stenen efter Y"* |
| Storkyrkan | `gamla-stan` | Navigating the old town: `gränd`, `torg`, `kyrka`, `slott`, `bro`, directions |
| Vasa | `vasa-ship` | Ship and museum vocabulary, plus the wreck's story in simple Swedish |
| Metro station | `tunnelbanan` | Station names, directions, tickets, real announcements: *"Nästa station …"*, *"Dörrarna stängs"* — immediately useful to anyone living in Stockholm |
| Skansen | `svensk-kultur` | `fika`, `midsommar`, `lucia`, `allemansrätten`, `lagom` |

Packs are **bonus** content. The core curriculum is never gated behind the game.

### 12.6 Historical accuracy rules

- Every historical claim carries a date, and dates are checked before commit.
- `sources` is **required** on every history card.
- **Myths we explicitly refuse:** horned helmets; "Vikings" as a nation or race; Elder Futhark
  in a Viking-Age context; and "Birger Jarl founded Stockholm in 1252" — 1252 is the first
  written *mention*, the founding was gradual, and the attribution to Birger Jarl is
  traditional rather than documented. Write "first mentioned", not "founded".
- *Jantelagen* comes from Aksel Sandemose's 1933 novel and is Dano-Norwegian in origin, even
  though it is routinely applied to Sweden. If a culture card uses it, it says so.
- Uncertain claims get a hedge — "traditionally", "according to the sagas" — rather than
  deletion. The app should model honest history, not tidy history.
- Do not romanticise raiding. The era was trade, craft, travel and settlement as much as
  violence — which is both better taste and better history.

### 12.7 Seasonal skins tied to the real calendar

| Date | Event | Treatment |
|---|---|---|
| 13 December | **Lucia** | Candles across the city, deep blue night palette, `lussekatt` icon |
| June | **Midsommar** | A *midsommarstång* on the map, birch garlands, flower crowns |
| 4 October | **Kanelbullens dag** | Cinnamon bun icon, a fika coin bonus |
| 6 June | **Nationaldagen** | Flags — the one day of the year flag blue and yellow take over the UI |
| Advent | **Advent** | *Adventsstjärna* star lamps in the windows of every building |

Each event ships one small limited-time lesson. Cheap to author, strong reason to return.

---

## 13. Local development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # → dist/
npm run preview      # serve the production build locally
npm run typecheck
npm run lint
npm run test
npm run validate     # Zod-validate all content files
npm run new:lesson   # interactive scaffolder
```

`npm run validate` must be part of `npm run test` and of CI. It errors on:

- a missing `ru` or `en` translation on any vocabulary item or user-facing string;
- a duplicate question id or lesson id;
- an `answer` index out of range, or a pool smaller than `questionsPerRun`;
- `estimatedMinutes > 5`, more than 25 vocabulary items, or theory over ~400 words —
  the 5-minute rule, machine-enforced;
- an incomplete `part` series (gaps in `index`, or `of` not matching the number of lessons found);
- a curriculum referencing a lesson id that does not exist.

Add a **dev-only content panel** (`?dev=1`) that lists every lesson with pool size, generated
question count, and validation warnings.

---

## 14. Deployment to GitHub Pages

`vite.config.ts`:

```ts
export default defineConfig({
  base: '/swedish/',        // repository name is `swedish` — locked, see section 0
  plugins: [react()],
});
```

- Site URL: `https://<user>.github.io/swedish/`. `index.html` sets `<title>Swedish</title>` and
  `manifest.webmanifest` uses `"name": "Swedish"`, `"short_name": "Swedish"`,
  `"start_url": "/swedish/"`, `"scope": "/swedish/"`.
- Use `HashRouter` — no 404.html rewrite hack needed.
- `public/.nojekyll` must exist so asset folders starting with `_` are served.
- Workflow `.github/workflows/deploy.yml`: on push to `main` → `actions/checkout`,
  `actions/setup-node@v4` (node 20, npm cache), `npm ci`, `npm run validate && npm run build`,
  `actions/upload-pages-artifact@v3` with `path: dist`, `actions/deploy-pages@v4`.
  Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Workflow `validate.yml` runs on pull requests: typecheck, lint, tests, content validation.

---

## 15. Content authoring workflow

1. `npm run new:lesson` → asks for level, slug, title, kind → creates the folder with
   templated `lesson.json`, `theory.md`, `theory_ru.md`, `vocab.json`, `questions.json`.
2. Fill in 15–25 vocabulary items (25 is the hard cap — see the 5-minute rule). Generators
   expand these into 100+ questions.
3. Add 10–20 handwritten questions for the things generators cannot produce (word order,
   idioms, culture, grammar traps).
4. `npm run validate` → fix errors.
5. Register the lesson id in the relevant curriculum files.
6. Commit. CI validates and deploys.

**Content quality rules:**

- Every Swedish noun must have `gender` and all four `forms`.
- Every verb must have `verbGroup` and all four principal forms.
- Every vocabulary item should have an `example` sentence — that is what actually teaches usage.
- Every vocabulary item must have **both** `ru` and `en` translations — the header toggle can
  switch at any moment, so a missing language is a visible hole, and validation rejects it.
- A lesson must fit in 5 minutes. If it doesn't, split it into parts rather than trimming
  the explanation.
- Explanations are written for the learner, not for the author: say *why*, not just *what*.

---

## 16. Implementation phases

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
SFI kurs A/B filled out, kurs C/D built up, first text-based lessons for SVA grund delkurs 1. Grammar reference articles.

**Phase 10 — Polish**
PWA, offline, i18n completion, accessibility audit, Lighthouse ≥ 95.

---

## 17. Acceptance criteria for v1

- [ ] `npm run dev` works on a clean clone with no configuration.
- [ ] The site is live on GitHub Pages and every route works after a hard refresh.
- [ ] At least 15 lessons exist, each with a pool of ≥ 100 effective questions.
- [ ] A quiz run of 10 questions never repeats an item within the run.
- [ ] Two consecutive runs of the same lesson share no questions (when the pool allows).
- [ ] XP, coins, streak and SRS state survive a page reload and a browser restart.
- [ ] Export produces a JSON file that Import fully restores on another browser.
- [ ] At least 12 buildings across the first three eras are purchasable, with working perks.
- [ ] Perks measurably change reward numbers on the result screen.
- [ ] Full keyboard operation of a quiz, verified manually.
- [ ] The header `RU / EN` toggle switches the interface and all translations instantly,
      survives a reload, and no screen shows an untranslated string in either language.
- [ ] No lesson exceeds 5 minutes; every multi-part series is grouped correctly in the list.
- [ ] Content validation catches a deliberately broken lesson in CI (including an
      over-length lesson and a missing `en` translation).
- [ ] Unit tests cover selection weighting, grading of every question type, scoring maths,
      and the SRS scheduler.
- [ ] The §11 palette and fonts are the only ones in use — no stray default Tailwind colours,
      and every font renders `å ä ö` and Cyrillic.
- [ ] The quiz screen carries no ornament; the city screen does.
- [ ] At least 10 history cards exist, each with a date and a `sources` entry.
- [ ] Key vocabulary from a read history card appears in a later review session.
- [ ] No horned helmets, no Elder Futhark, and the word "founded" does not appear next to 1252.

---

## 18. Additional ideas worth building (proposals beyond the original scope)

These extend "many ways to learn with positive reinforcement". Ordered by value/effort.

1. **Daily challenge** — 5 mixed questions from everything the learner has seen, one attempt
   per day, generous coin reward. Strongest habit-forming mechanic available offline.
2. **Flashcard mode** — a swipe/keyboard deck per lesson, no scoring, pure exposure. Some days
   people don't want to be tested.
3. **Word of the day** — one card on Home, with audio and an example. Free coins for listening.
4. **Sentence workshop** — take known vocabulary and build sentences with the `order` type;
   teaches Swedish V2 word order, which is the real beginner wall.
5. **Listening dictation** — TTS reads a sentence, the learner types it. Very high value, and
   free thanks to `speechSynthesis`.
6. **Pronunciation practice** — Web Speech API *recognition* (`sv-SE`) scores the spoken word.
   Chrome-only; degrade gracefully. High delight factor.
7. **Mistake museum** — a page listing personal recurring errors ("you confuse `en`/`ett` on
   these 12 nouns"), each with a one-tap drill. Turns failure into a feature.
8. **Themed lesson packs tied to buildings** — building the Vasa shipyard unlocks a "Vasa ship"
   lesson (real vocabulary + culture). Makes the city feel meaningful rather than decorative.
9. **Swedish culture cards** — fika, allemansrätten, midsommar, lagom, jantelagen. Unlocked as
   era rewards; short, delightful, memorable.
10. **Activity heatmap** — a GitHub-style contribution grid on `/stats`. Cheap, very motivating.
11. **Achievement showcase** — badges displayed on the city map as monuments.
12. **Shareable result card** — render a canvas PNG of a perfect run for sharing. No backend needed.
13. **Seasonal events** — Lucia (13 Dec), Midsommar, Kanelbullens dag (4 Oct): limited-time
    lessons and city decorations. Cheap content, big retention.
14. **Local leaderboard vs. your past self** — "this week vs. last week". Avoids needing a server.
15. **Optional cloud sync (v2)** — GitHub Gist or Supabase, opt-in only, keeping v1 backend-free.

### Remaining open questions

All launch questions are answered in section 0. What is still open concerns v2 only:

- Custom domain via `CNAME` instead of the `/swedish/` sub-path — would change Vite `base`.
- Whether a Swedish interface locale is worth adding once the app is feature-complete.
- Whether opt-in cloud sync (idea 15) is worth the loss of the "zero backend" property.

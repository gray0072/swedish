# 5. Content data model

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [05-content-model_ru.md](05-content-model_ru.md) and must be kept in sync.

All types are defined with Zod in `src/content/schema.ts` and exported as inferred TS types.

## 5.1 Tracks and levels — `content/tracks.json`

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

## 5.2 Lesson metadata — `content/lessons/<level>/<slug>/lesson.json`

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

## 5.3 Theory — `theory.md`

Plain Markdown. Keep it under ~400 words. Supported extras:

- Tables (GFM) for conjugations and declensions.
- Fenced blocks with the `example` language for sentence pairs:

````markdown
```example
Hej! — Hi!
God morgon! — Good morning!
– Tack för hjälpen! – Varsågod!
skriva – skrev – skrivit — to write – wrote – written
```
````

  One line is one example, split at the **first** spaced em dash ` — `: Swedish on the left,
  translation on the right. That only works if the Swedish side never contains an em dash, so:
  - a dash inside Swedish is the **tankstreck `–`** (en dash), as Swedish typesetting uses it
    anyway — dialogue replies, asides, form series; a word-internal hyphen stays `-`;
  - the translation may contain anything, em dashes included (Russian needs them);
  - a line is **never hard-wrapped** — a wrapped tail would render as its own row with its
    own speaker button;
  - a line without ` — ` is Swedish only (a dialogue exchange, a list of forms).

  `npm run validate` rejects a line that starts with `—`, a line with no Swedish before the
  separator, and a translation-less line that continues a wrapped one
  (`src/content/exampleLine.ts`). The speaker reads the Swedish side with ✓/✗ marks, the
  leading dialogue dash, arrows and slashes turned into pauses (`speakableSwedish()`).

**Brackets in any Swedish field** — theory examples, vocab `sv` and `example.sv`, choices —
say whether the text is Swedish speech (`src/content/swedishText.ts`):

| Written | Means | Shown | Spoken | Typed answer |
|---|---|---|---|---|
| `anden [accent 1]`, `gå [om buss/tåg]` | a note | as a small muted label | no | not needed |
| `prata med [namn]` | a placeholder | as a small muted label | no | any 0–3 words |
| `tacka nej (till)`, `ARN (Allmänna …)` | optional or explanatory Swedish | as written | yes | with or without it |
| `bäste herr/fru` | a choice between words | as written | as a pause | either word |

So a note never goes in round brackets: it would be read aloud in a Swedish voice and would
have to be typed in a quiz. Generated questions never offer a distractor that looks or sounds
like the answer (homographs such as *man* / *man*), and `npm run validate` rejects any
multiple-choice or listening question with two identical options, and any typed answer the
lesson's own spelling would fail.

Every Swedish string rendered from theory gets a small speaker button injected automatically.

An optional `theory_ru.md` next to it carries the Russian translation. `LessonPage` picks
`theory_ru.md` when the study-language toggle is set to Russian, falling back to
`theory.md` when only one of the two files exists — so a lesson may ship English-only
theory (the default) or both languages.

## 5.4 Vocabulary — `vocab.json`

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

## 5.5 Questions — `questions.json`

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
      "id": "mc-1",
      "type": "mc",
      "difficulty": 1,                    // 1..3, used for weighting
      "prompt": { "ru": "Как сказать «Доброе утро»?" },
      "choices": ["God morgon", "God natt", "Hej då", "Tack"],
      "answer": 0,
      "explanation": { "ru": "«God morgon» — до примерно 10 утра." },
      "tags": ["greetings"]
    },
    {
      "id": "gap-1",
      "type": "gap",
      "prompt": { "sv": "___ morgon! Hur mår du?" },
      "answer": ["God"],
      "acceptAlso": ["god"],
      "hint": { "ru": "Пожелание перед словом «утро»." }
    },
    {
      "id": "order-1",
      "type": "order",
      "prompt": { "ru": "Собери предложение: «Меня зовут Анна.»" },
      "tokens": ["Jag", "heter", "Anna"],
      "answer": [0, 1, 2]
    },
    {
      "id": "match-1",
      "type": "match",
      "prompt": { "ru": "Сопоставь приветствия с переводом." },
      "pairs": [
        ["Hej då", "Пока"],
        ["Vi ses", "Увидимся"],
        ["God natt", "Спокойной ночи"]
      ]
    },
    {
      "id": "listen-1",
      "type": "listen",
      "audioText": "God kväll",
      "prompt": { "ru": "Что ты услышал(а)?" },
      "choices": ["God kväll", "God morgon", "God natt", "Godis"],
      "answer": 0
    }
  ]
}
```

**Ids.** A lesson id is always `<level>/<slug>` and matches the folder. A handwritten
question's `id` is local to its lesson — `<type>-<n>` (`mc-1`, `gap-3`, `tf-2`); the loader
namespaces it as `<level>/<slug>/<local>` (`sfi-a/greetings/mc-1`), and generated questions
get `<level>/<slug>/gen-<kind>-<vocab id>`. That full id is the only form the SRS deck and the
save file see, so two lessons can never share a question id.

## 5.6 Question types (v1)

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

## 5.7 Distractor generation

For generated multiple-choice items, wrong options are picked from the **same lesson first**,
then the same level, preferring the same part of speech and similar word length. This produces
plausible distractors instead of absurd ones. Never allow a distractor whose translation equals
the correct answer's translation.

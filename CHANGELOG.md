# Development log

What has already been done in the project, in chronological order. New entries are added
**at the end** of the file. This is a working log for the two of us, not a public,
versioned changelog — if one is ever needed, it can be assembled from this file later.

---

## 2026-09-04 — Concept and spec

- Discussed the concept: a site for learning Swedish on GitHub Pages, topics by level
  (SFI kurs A–D, then SVA grund delkurs 1–4), each topic with short theory/vocabulary
  plus a 10-question test drawn from a pool of ~100, and gamification on top — points are
  spent on building up Stockholm from a tribal settlement to the present day.
- Wrote **PROMPT.md** and **PROMPT_ru.md** (later renamed to **SPEC.md**/**SPEC_ru.md**,
  see the entry from the same day below) — a detailed spec: stack, folder structure,
  content data model, quiz engine logic, reward formulas, gamification, acceptance
  criteria, and 16 extra ideas beyond the original request.
- Settled the open questions:
  - repository name — `swedish`, site name — **Swedish**;
  - we teach **in Russian or English** — a single `RU/EN` switch in the header changes
    both the interface and the translations (not three languages, as first assumed);
  - SFI is a **pragmatic approximation** of the official Skolverket programme, labelled
    honestly in the interface;
  - a lesson is **no longer than 5 minutes**, otherwise it is split into numbered parts.
- Added two large sections on request ("Swedish national style + vikings/history"):
  - **visual style** — Nordic functionalism (funkis) across the whole learning surface,
    Dalarna folk art (the Dala horse, kurbits) and viking-age carving (Younger Futhark,
    the serpent band) only in the city; palette, typography, rules ("never decorate a
    quiz", "no horned helmets");
  - **historical theme** — the city's 6 eras rest on verified facts (Birka, ~2,500 rune
    stones in Uppland, the first mention of Stockholm in 1252, the sinking of the *Vasa*
    in 1628, the metro gallery), with explicit accuracy rules and a list of myths that are
    deliberately not used.

## 2026-09-04 — v1 implementation

- Built a working skeleton from scratch: **Vite + React 18 + TypeScript (strict) +
  Tailwind + Zustand + Zod + React Router (HashRouter) + Vitest**.
- **Content pipeline**: `content/` as data without code, auto-loaded through
  `import.meta.glob`, Zod schemas, question generators from vocabulary (15–20 words →
  70–100+ questions: sv↔ru/en, typing, listening, en/ett article, plural).
- **Quiz engine**: a deterministic PRNG (mulberry32) for reproducibility, weighted
  selection without repeating questions between runs, 7 question types (mc, type-answer,
  gap, order, match, listen, true-false), one retry per run, XP/coin formulas from
  SPEC.md §6.3.
- **Gamification**: 6 eras, 22 buildings with real historical facts, 5 history cards with
  sources, 8 bonus types, SRS review on Leitner boxes.
- **Other**: RU/EN switch, dark theme, save export/import, 3 demo lessons at the starting
  level (greetings, numbers 0–20, family).
- **Quality checks**: 32 unit tests (engine, grading, selection, generators, SRS), a
  content validation script (`npm run validate`), GitHub Actions (`validate.yml`,
  `deploy.yml`).
- An e2e check through headless Chromium (Playwright) exposed and let us fix a real bug:
  several Zustand selectors (`usePreviousRunQuestionIds`, `useCityBuildingLevels`)
  returned a new array/object on every call (`?? []`, an inline object literal), which
  triggered an infinite re-render through `useSyncExternalStore`. Fixed with stable
  references and `useMemo`.

## 2026-09-04 — GitHub Pages checklist and the rename to SPEC

- Ran the user's personal checklist (the `github-pages` skill). Some rules were applied
  (README rewritten in English with the live link on the first line, an MIT `LICENSE`
  added, `gh-pages` + `predeploy`/`deploy` as a manual alternative to the deployment),
  some were deliberately skipped with an explanation (no separate `SPEC.md` was created as
  a duplicate — `PROMPT.md` already played that role; the workflow was left on
  `actions/deploy-pages` rather than `peaceiris/gh-pages`, as the already tested and more
  modern option). The MUI rules were skipped as not applicable (the project uses Tailwind).
- On request, `PROMPT.md`/`PROMPT_ru.md` were renamed to **SPEC.md**/**SPEC_ru.md** — all
  cross-references and mentions in code comments were updated.

## 2026-09-04 — First deployment

- Found that the code had already been committed (two commits: "Spec", "A1") — pushed to
  `gray0072/swedish`.
- The `Validate` workflow passed right away; `Deploy to GitHub Pages` failed at the
  `actions/deploy-pages@v4` step because Pages had never been enabled for the repository.
  The user enabled **Settings → Pages → Source: GitHub Actions**; after that an empty
  commit restarted the deployment, which succeeded.
- The site is live: **https://gray0072.github.io/swedish/** — verified through headless
  Chromium (home, city, review, settings, RU/EN switching — no console errors).

## 2026-09-05 — More beginner lessons

- Added 5 new basic lessons: days of the week (plus the cultural link to the Norse gods —
  Tyr/Odin/Thor/Freya in the day names), colours (adjective agreement for en/ett/plural),
  present tense of verbs (14 verbs, including vara/kunna), food and drinks (countable vs
  uncountable nouns, fika culture), times of day (dygn, tied to the greetings lesson).
  That makes **8 basic lessons**; the level's curriculum playlist was updated.
- Found and fixed another real bug: navigating from one lesson's quiz to another's via
  client-side navigation (without a full reload), `QuizRunner` did not recreate the
  session — the questions stayed from the previous lesson, because a lazy `useState`
  initializer only runs when the component mounts. Fixed by adding
  `key={lesson.meta.id}` in `QuizPage` so React recreates the component when the lesson
  changes.
- Ran typecheck, 32 tests, content validation (8 lessons, 22 buildings), the build, and a
  visual e2e smoke test of all the new lessons and their quizzes — no errors. Committed in
  two commits (the bug fix separately from the content), pushed, CI green, deployment
  verified.

## 2026-09-05 — Everything except content

On the request "let's do the rest except content", the whole non-text roadmap was closed
in one go:

- **Illustrated city map** — instead of a grid of cards: a permanent Mälaren shoreline and
  the island of Stadsholmen (tinted to the era palette, the shape never changes — SPEC
  §11.5), buildings as flat SVG pictograms (15 icons) at the real coordinates from
  `buildings.json`, clicking a marker scrolls to the purchase card.
- **Ornament** — the Dala horse mascot (used as the loading spinner and in empty states),
  a kurbits divider, an era frame made of the "serpent band" around the heading — all only
  on the city screens; the quiz still has no decoration (SPEC §11.1).
- **Words from history cards feed the SRS.** `vocab` in `content/history/*.json` is now
  proper `{sv, ru, en}` translations instead of bare strings; when a card is read, its
  words turn into real questions (distractors come from the vocabulary of all cards) and
  go into the review deck with `dueAt` = now.
- **`/grammar`** — three reference articles (word order and the V2 rule, the en/ett
  articles, verb groups 1–4), without tests or XP — pure reference.
- **Achievements** — 9 of them; the conditions (words learned, day streak, all lessons
  completed, era reached, buildings built) are computed on the fly from statistics that
  already exist rather than stored separately, so they cannot drift from the real numbers.
  Shown on `/stats`.
- **Result sharing** — a canvas postcard (not an HTML/DOM screenshot) on a perfect run:
  the Web Share API on mobile, a PNG download as a fallback.
- **PWA/offline** — `vite-plugin-pwa`, a service worker caching the app and all content
  JSON; verified by hand — the site opens from the production build with networking fully
  disabled.
- **Code splitting** — every page on `React.lazy` + `Suspense` (with the same horse as the
  loading indicator). The main chunk dropped from 560 KB to 253 KB, and Vite's chunk-size
  warning is gone.
- **Two real bugs** were found and fixed during the e2e check:
  1. In `/review`, generated multiple-choice questions did not go through option
     shuffling — the correct answer was always item #1, which turned review into a
     guessing game. This had only worked correctly in a regular lesson test
     (`QuizRunner`), because that was the only place calling `prepareQuestion`.
  2. In markdown articles (lesson theory, `/grammar`), headings were the same size as the
     body text — the `prose` classes were used without `@tailwindcss/typography` being
     installed; that also surfaced a second layer of the same problem — the `example`
     fenced block rendered inside a standard `<pre>`, which the typography plugin gives a
     dark code-block background.
- Ran typecheck, 39 tests, content validation, the production build, e2e against the live
  built bundle (including offline mode). Committed in 7 commits by feature, pushed, CI and
  deployment green.

## 2026-09-05 — Voice selection for TTS, English by default, three more lessons

- **TTS voice selection in settings.** `lib/tts.ts` now filters the browser's voice list
  down to sv-SE and stores the user's choice (`voiceURI`) in the store; with no choice, or
  a mismatch on another device, it falls back to auto-selecting the first available
  Swedish voice as before. The UI has a dropdown plus a "Play" button with a test phrase;
  if no Swedish voices are installed at all, a hint explains how to add them (Windows
  Settings / restarting Chrome). Validated with Playwright using a stubbed
  `speechSynthesis.getVoices` (overriding the method, not the whole object —
  `speechSynthesis` is entirely read-only in a real browser) — the voice list filters
  correctly and the choice survives a page reload.
- **The default learning language is English** (it was Russian). Changed both in
  `freshSave()` and in SPEC.md/SPEC_ru.md (section 0 and §10) — the table of settled
  decisions was updated so it does not drift from the actual behaviour.
- **3 more lessons**: "Clothing" (kläder, with an explanation of why byxor/glasögon are
  always plural — like pants/glasses in English), "Weather" (väder, the impersonal "det
  regnar"/"det snöar"), and "Public transport" (kollektivtrafik — deliberately echoing the
  phrases from the metro history card, "Nästa station" / "Dörrarna stängs", added in the
  previous session). 16–18 words each, a full set of forms wherever I am confident they
  are right (where I was not, I left `forms: null` rather than guessing), generators plus
  6 hand-written questions per lesson (order/match/true-false/gap/mc). The levels'
  curriculum playlists were updated.
- The save migration was verified against a synthetic old save without
  `settings.ttsVoice` — `migrateSave` fills in `null` instead of falling back to
  `freshSave()`.
- Ran typecheck, 39 tests, content validation (11 lessons), a visual check with Playwright
  (level → lesson → quiz, settings → voice selection). Committed in 3 commits (voice,
  spec, content).

## 2026-09-05 — 15 lessons at once: 5 parallel agents

The session's context had grown large, so the content was written by 5 parallel background
agents — one per level, each with a self-contained brief (the exact Zod schema from
`schema.ts`, the reference lesson `sfi-c/transport` as a model, the specific topics, and
the rule "if you are not sure of a word form, do not write it"), with no access to this
session's history.

- Body (kroppen), Home (hemma, rooms and furniture), Animals (djur).
- Money and prices (numbers 20–100 — they did not exist anywhere before, only 0–20),
  Health/a visit to the doctor, Professions.
- Housing and renting, Government agencies and forms (personnummer, Skatteverket,
  Försäkringskassan), Emotions.
- The alphabet (with explicit emphasis on å/ä/ö as separate letters at the end of the
  alphabet, not "decorated" a/o), Personal details (a form), Telling the time
  (halv/kvart/över/i — including an explicit explanation that "halv nio" means 8:30, not
  9:30, a classic beginner trap).
- Family and relationships (deeper than `sfi-b/family`: marital status, in-laws, twins),
  Booking an appointment (boka tid), Cooking (verbs for boiling/frying/cutting/peeling
  plus kitchen utensils).

15 new lessons in total; every agent's files were isolated (its own level, its own
curriculum file) — there were no conflicts between agents, and `git status` after all five
showed only new files, with no overlap at all.

- Checked by hand: numbers 20–100, the halv/kvart explanation for telling the time, and
  word forms in a couple of lessons (bokstav→bokstäver, öga→ögon and so on — the agents
  themselves preferred not to guess where they were unsure and left `forms` empty).
- Final end-to-end check after all the agents: typecheck, 39 tests, content validation
  (26 lessons, 0 errors), a visual e2e run through one lesson from each level (lesson →
  quiz, no console errors), a review of `/tracks` — the lesson counters add up. Committed
  in 5 commits (one per level).

---

## 2026-09-05 — Levels aligned with the Swedish system, grammar per level

The project's levels are now named and arranged the way Swedish education does it, in a
single ladder:

```
SFI kurs A → B → C → D  →  SVA grund delkurs 1 → 2 → 3 → 4  →  SVA 1 (upper secondary)
```

- **Two tracks instead of three.** `sfi` (kurs A–D) and `sva-grund` (delkurs 1–4, a komvux
  course of 700 poäng = 100/200/200/200 p, entered after SFI kurs D, exiting with
  behörighet for the upper-secondary `SVA 1`). There is no separate CEFR track any more:
  the CEFR reference point survives only as a parenthetical under the level name.
- **One lesson, one level.** No more cross-tagging: the folder name, the `id` and the
  single element of `levels` always match. `scripts/validate-content.ts` now checks this,
  and also checks that every `prerequisites` entry points at an existing lesson.
- **All 26 lessons were redistributed across SFI kurs A–D** — by format they are
  vocabulary and phrase lessons, which makes them SFI material: kurs A — 9 (alphabet,
  greetings, numbers, personal details, days of the week, colours, times of day, the
  clock, the body), kurs B — 9 (family and relationships, home, animals, clothing,
  weather, food, cooking, present tense), kurs C — 5 (transport, money, health, booking an
  appointment, professions), kurs D — 3 (housing, government agencies, emotions). `order`
  and `prerequisites` were renumbered for the new sequence.
- **The SVA levels are deliberately empty for now:** a lesson there is work with a text
  (referat, argumentation, källkritik), and the project has no such lesson format yet.
- **20 grammar points for each of the 8 levels** (160 entries in `CURRICULUM.md`), with a
  progression running through them: at SFI, grammar is given as ready-made patterns
  without terminology; at SVA delkurs 1 it is systematised with metalanguage; by delkurs 4
  it reaches clause compression, hedging and language editing.
- `TracksPage` no longer hardcodes the note under the SFI track: it renders `track.note`
  from `tracks.json` for any track, so the SVA track now has its own note too. The unused
  `tracks.sfi.note` key was removed from both locales.
- A side effect of the move: lesson `id`s changed, so progress and the SRS deck in
  localStorage of existing saves will not match the old entries.
- Checks: typecheck, 39 tests, content validation (26 lessons, 0 errors), the build.

## 2026-09-05 — English as the primary language of the project

- **`AGENTS.md`** added: the repository's working agreements, with the language rule as
  the main entry — English is the primary language of every document and of the
  interface, a Russian translation lives next to the original under the `_ru` suffix, and
  the two must be updated in the same commit. `CLAUDE.md` is a short pointer to it.
- **The rule was applied to the existing documents.** `TODO.md`, `CHANGELOG.md` and
  `CURRICULUM.md` were Russian under suffix-less names: the Russian text moved to
  `TODO_ru.md`, `CHANGELOG_ru.md` and `CURRICULUM_ru.md` (through `git mv`, so the history
  follows), and English translations now hold the canonical names. `SPEC.md`/`SPEC_ru.md`
  were already a correct pair. Cross-references were rewired: English documents link to
  English ones, Russian to Russian.
- **Interface.** `src/i18n/index.ts` now derives the key type from `en.json`
  (`type Key = keyof typeof en`) instead of `ru.json`, so English is the source of truth
  for the key set; `ru.json` is a translation and must carry the same keys. Both locales
  already had the same 116 keys, and the default language in `persist.ts` was already
  `en`, so nothing changed at runtime.
- Checks: typecheck, 39 tests, content validation (26 lessons, 0 errors).

## 2026-09-05 — Bilingual theory and 20 grammar lessons for SVA grund delkurs 1

- **`theory_en.md`**: an optional English companion to `theory.md`. `LessonPage` now
  shows whichever of the two matches the study-language toggle, falling back to the other
  when only one exists — a lesson can still ship Russian-only theory (the historical
  default across all 26 SFI lessons) or carry both languages. Wired through the content
  loader, `LessonMeta`'s type (`LessonContent.theoryEn`), `scripts/validate-content.ts`
  (same ~400-word cap, checked independently per file) and `scripts/new-lesson.ts` (now
  scaffolds both files for every new lesson).
- **All 20 grammar points of SVA grund delkurs 1 got a dedicated lesson** — the first
  lessons in the project built with the new bilingual theory from the start:
  `parts-of-speech`, `sentence-elements`, `verb-groups`, `tense-overview`,
  `future-tense`, `modal-verbs-tenses`, `att-infinitive`, `main-clause-word-order`,
  `subordinate-clause-word-order`, `sentence-adverb-position`, `noun-declensions`,
  `double-definiteness`, `adjective-declension`, `adjective-comparison`,
  `pronouns-overview`, `sin-sitt-sina`, `indefinite-pronouns`, `particle-verbs`,
  `compound-words`, `punctuation-paragraphs`. Written by 4 parallel agents (5 lessons
  each), against pre-assigned ids/order/prerequisites so cross-references resolved
  regardless of completion order — the same parallel-agent approach used for the SFI kurs
  A–D content pass on 2026-09-05.
- `CURRICULUM.md`/`CURRICULUM_ru.md` updated: all 20 grammar-list checkboxes for delkurs 1
  marked done with their lesson slug, the 20 lessons also appended to the level's Topics
  list (so the Done count stays consistent with how every other level is tallied), and
  the level's Topics list still has 0 of its 25 thematic (text-based) topics — those
  remain a separate, unstarted piece of work. `content/curricula/sva-grund-1.json` added.
- Checks: typecheck, 39 tests, content validation (46 lessons, 0 errors).

## 2026-09-06 — All 25 thematic topics for SVA grund delkurs 1

- **SVA grund delkurs 1 is now complete**: its 25 thematic topics
  (`about-yourself`, `routine-present`, `past-narrative`, `future-plans`,
  `opinion-justification`, `describing-person`, `describing-place`,
  `health-symptoms-detailed`, `studying-komvux`, `reading-retelling`, `personal-letter`,
  `forms-questionnaires`, `instructions-recipes`, `dictionary-work`,
  `paraphrase-strategies`, `workday-colleagues`, `employer-talk`, `housing-contract`,
  `household-economy`, `digital-life`, `child-school-talk`, `holidays-traditions`,
  `free-time-culture`, `nature-allemansratten`, `retelling-news`) join yesterday's 20
  grammar lessons, all bilingual (`theory.md` + `theory_en.md`). Again written by 5
  parallel agents (5 lessons each) against pre-assigned ids/order/prerequisites.
- **A deliberate simplification**: a proper text-based lesson format (a reading passage
  plus comprehension questions) still doesn't exist in the project — that was flagged as
  a real gap in `TODO.md`. Rather than build it, topics like "read a short story and
  retell it" and "retell what you heard" shipped through the existing vocab/phrases
  pipeline: they teach the vocabulary and connector phrases the skill needs (sequencing
  words, reporting verbs, reported-speech word order) rather than embedding an actual
  passage with its own comprehension quiz. `TODO.md` now tracks that gap as applying to
  SVA grund delkurs 2–4, not delkurs 1.
- `CURRICULUM.md`/`CURRICULUM_ru.md`: all 25 topic checkboxes for the level marked done
  with their lesson slug; the level's Done count is now 45/45 (20 grammar + 25 topics).
  `content/curricula/sva-grund-1.json` extended with the 25 new ids.
- Checks: typecheck, 39 tests, content validation (71 lessons, 0 errors).

## 2026-09-06 — SVA grund delkurs 2 complete (45 lessons)

- **All 20 grammar points and all 25 thematic topics for SVA grund delkurs 2** now have
  a dedicated bilingual lesson, mirroring yesterday's delkurs 1 pass: passive voice,
  conditionals (real, unreal-present, unreal-past), the subordinate-clause family
  (relative/temporal/concessive/causal), participles, nominalisation, word formation,
  verb-preposition government, discourse-level grammar (text connectors, cleft
  sentences, reported speech, long-sentence word order, spoken/written norms), plus
  topics on work, benefits, housing, tax, education, argumentative writing, referat,
  formal complaints, reviews, and more.
- **Written by 9 parallel agents** (4 covering grammar, 5 covering topics) against
  pre-assigned ids/order/prerequisites, the same approach as delkurs 1 — but this run
  hit the account's session rate limit partway through: all 9 agents were terminated by
  a 429 mid-write, leaving 19 of the 45 lesson folders missing or partially written (some
  0 bytes, some missing `vocab.json`/`questions.json`, one missing all 4 non-metadata
  files). Diagnosed by diffing the directory listing against the planned 45 ids and
  re-running `validate-content.ts`; the 6 partially-written lessons were completed from
  their existing files rather than overwritten, and the other 13 were written from
  scratch directly in the main session (not re-delegated to background agents, to avoid
  re-triggering the same burst-concurrency limit).
- `content/curricula/sva-grund-2.json` added; `CURRICULUM.md`/`CURRICULUM_ru.md` updated
  (all 45 checkboxes for the level marked done with their lesson slug — both under
  "Topics" and under "Grammar", following the same double-bookkeeping convention
  established for delkurs 1).
- Checks: typecheck, 39 tests, content validation (116 lessons, 0 errors).

## 2026-09-06 — SVA grund delkurs 3 complete (45 lessons)

- **All 20 grammar points and all 25 thematic topics for SVA grund delkurs 3** now have
  a dedicated bilingual lesson — the most advanced content in the project so far, since
  this level is where the course shifts from sentence-level grammar to text-level and
  register-level phenomena: complex/nested subordinate clauses, extended noun-phrase
  agreement, impersonal constructions (`det`/`man`/the `-s` passive), modality and
  certainty (`måste/borde/lär/torde/kanske`), subjunctive remnants (`vore`, `må`),
  participial phrases, theme/rheme and fundament choice, nominal vs. verbal style,
  loanword morphology, advanced punctuation and quotation formatting, three-way register
  (formal/neutral/colloquial), and proofreading technique — plus topics on institutions
  (the Swedish model, elections, courts, ARN), media literacy and fact-vs-opinion,
  advanced argumentation/discussion/presentation, and literature/poetry vocabulary.
- **Written by 5 parallel agents** (2 handling 10 grammar lessons each, 2 handling 10
  topic lessons each, 1 handling the final 5 topics) — fewer, larger agents than the
  9-agent split used for delkurs 2, specifically to reduce the concurrent-request burst
  that had tripped the account's session rate limit partway through that run. Each agent
  was also instructed to finish one lesson's all 5 files before starting the next, so an
  interruption would leave clean partial progress rather than empty/1-file folders. No
  rate-limit interruption happened this time; all 5 agents completed cleanly.
- A couple of the agents caught and fixed problems in the task brief itself rather than
  reproducing them: one corrected a wrong prerequisite id
  (`sva-grund-2/instructions-recipes` doesn't exist; the real id is
  `sva-grund-1/instructions-recipes`), one corrected an inaccurate claim about `ju...
  desto` word order (only the `desto`-clause gets V2 inversion, not both halves), and one
  swapped out weak loanword-morphology examples for genuinely irregular ones (`museum →
  museer`, `faktum → fakta`, `drama → dramer`) after checking which loanwords actually
  resist the five native declension classes.
- `content/curricula/sva-grund-3.json` added; `CURRICULUM.md`/`CURRICULUM_ru.md` updated
  (all 45 checkboxes for the level marked done with their lesson slug, under both
  "Topics" and "Grammar", per the double-bookkeeping convention from delkurs 1-2).
- Checks: typecheck, 39 tests, content validation (161 lessons, 0 errors).

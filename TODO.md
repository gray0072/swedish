# TODO — what is still missing

A working checklist, not a history (unlike [CHANGELOG.md](CHANGELOG.md), which grows at
the end — this file is the opposite: cross out or delete an item once it is done, so the
list stays current and short). The per-lesson topic list lives separately, in
[CURRICULUM.md](CURRICULUM.md).

## Content

- [ ] **SFI kurs D** has only 3 lessons, **kurs C** has 5, **kurs B** has 9.
  `CURRICULUM.md` lists 25 topics under each level — the last remaining gap in the
  level-by-level content plan now that all of SVA grund (delkurs 1-4) and all of SFI
  kurs A are done. A good candidate for a run with parallel agents (the approach is
  described in the CHANGELOG entries for 2026-09-05 and 2026-09-07).
- [ ] `CURRICULUM.md`'s grammar lists: **110/200 points now have a dedicated lesson** —
  points 1-20 of SVA grund delkurs 1-3 plus all 25 of delkurs 4 (bilingual RU/EN
  theory via `theory_en.md`), and all 25 of SFI kurs A (19 with a lesson of their own,
  appended past item 25 of the Topics list the way SVA grund does; 6 marked done by
  reference to a topic lesson that already covered the point, no duplicate written).
  The other 90 points (SFI kurs B–D's 75, and points 21-25 of SVA grund delkurs 1-3)
  still rely on grammar being threaded through topic lessons' theory rather than a
  dedicated lesson. There are also three reference
  articles in `content/grammar/`.
- [ ] The "real text-lesson format" (a reading-passage field, comprehension question
  types, `LessonPage` UI — see `SPEC.md` §5) was never designed. Every SVA grund topic
  that would ideally use it (reading a short story and retelling it, a referat with a
  cited source, analysing a literary text, källkritik) shipped instead as an ordinary
  vocab/phrases lesson teaching the skill's vocabulary rather than embedding an actual
  text. This is a deliberate, repeated simplification across all 100 SVA grund topics,
  not a per-level gap anymore — worth revisiting as a real feature if the vocab/phrases
  version turns out to be too shallow in practice.
- [ ] None of the 246 lessons is grouped into a series (`part`/`series` from SPEC §5.2) —
  everything still fits the 5-minute limit on a single topic. If a broader topic shows
  up, split it into parts rather than trimming it.

## Features from the SPEC §18 ideas (not implemented yet)

- [ ] Daily challenge (5 mixed questions, one attempt a day, generous reward)
- [ ] Flashcard mode (flashcards without scoring, just flip through a lesson's vocabulary)
- [ ] "Word of the day" on the home page
- [ ] Sentence workshop (assembling sentences from known words, focused on V2)
- [ ] Listening dictation (TTS reads a sentence → the user types it)
- [ ] Pronunciation practice (Web Speech API *recognition* — most likely Chrome-only,
  degrade gracefully)
- [ ] "Museum of mistakes" — a page of the user's own recurring errors with one-tap drilling
- [ ] Separate Swedish culture cards (fika, lagom, jantelagen…) — partly covered today by
  `content/history/*.json`, but those focus on historical facts rather than on the
  cultural norms of everyday life
- [ ] Activity heatmap on `/stats` (in the spirit of GitHub contributions)
- [ ] Achievements as monuments on the city map (today they are just a list on `/stats`;
  SPEC §8.5 proposed showing them right on the `CityMap`)
- [ ] Seasonal skins driven by the calendar (Lucia on 13 December, midsommar,
  Kanelbullens dag on 4 October, Sweden's National Day on 6 June — styled per SPEC §12.7)
- [ ] Local leaderboard, "this week versus last week"
- [ ] Optional cloud sync (see SPEC §16, idea 15 — deliberately out of scope for v1, it
  breaks the "no backend" principle)

## Known SPEC ↔ code mismatches

- [ ] **The `multi` question type** is described in SPEC.md/SPEC_ru.md (§5.6 type table
  and §14 phase 6) but is not implemented: `questionSchema` in `src/content/schema.ts`
  only has `mc`, `type-answer`, `gap`, `order`, `match`, `listen`, `true-false`. Either
  implement it (multiple choice with partial credit) or strike it from the SPEC — right
  now the document promises something the code does not have.
- [ ] The rule "an era unlocks on XP **and** on the number of buildings from the previous
  era" (SPEC §8.2) is not implemented in code — `useCurrentEra()` only looks at the XP
  threshold (`src/store/city.ts`). A deliberate simplification, noted in SPEC §8.2, but
  it is worth either finishing it or dropping the "and" from the SPEC.

## Polish / tech debt

- [ ] Proper 192×192 and 512×512 PNG icons for `manifest.webmanifest` — `favicon.svg` is
  reused today, which makes PWA installation fail some strict checks (on iOS, for example).
- [ ] Building illustrations — today they are flat, reused SVG icons per category
  (`src/components/city/icons.tsx`, 15 of them for 22 buildings) rather than a unique
  illustration per building as intended in SPEC §11.5. Good enough for the MVP, but
  different buildings of the same era look alike.
- [ ] The main JS chunk is still 254 KB (after per-page code splitting), and
  `TheoryView` (the markdown renderer) is another 159 KB — both could be split further
  if it becomes noticeable on slow networks. (The `registry` chunk that used to be
  2.3 MB and broke the PWA precache step is now split one-per-course via
  `vite.config.ts`'s `manualChunks` — see the CHANGELOG entry for 2026-09-06.)
- [ ] No unit tests for `src/components/**` (React Testing Library is installed but
  unused) — all current UI checking happens through manual Playwright e2e runs during a
  conversation, and none of it is saved anywhere as a reproducible test.
- [ ] `scripts/validate-content.ts` does not check the consistency of word forms
  (`nounForms`/`verbForms`) — a conjugation can be wrong and nobody will notice except an
  attentive reader. There is no dedicated verification of Swedish grammar correctness and
  none is planned (an open risk, see `CURRICULUM.md`: agents wrote forms only when they
  were confident, but there is no 100% guarantee).
- [ ] `package.json` carries two deployment paths — the GitHub Actions workflow (the main,
  automatic one) and `npm run deploy` via `gh-pages` (manual, added alongside at some
  point). Worth settling on one to avoid confusion.

## Not started at all

- [ ] A full `/grammar` page — three articles today (word order, articles, verb groups);
  good candidates to add: adjectives and agreement, prepositions of place and time,
  subordinate clauses (once B1 arrives).
- [ ] Swedish as an interface language (deliberately postponed in SPEC §0 — not to be
  confused with Swedish as the language being studied, which already works fully).

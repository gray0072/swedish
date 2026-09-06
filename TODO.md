# TODO — what is still missing

A working checklist, not a history (unlike [CHANGELOG.md](CHANGELOG.md), which grows at
the end — this file is the opposite: cross out or delete an item once it is done, so the
list stays current and short). The per-lesson topic list lives separately, in
[CURRICULUM.md](CURRICULUM.md).

## Content

- [ ] **SVA grund delkurs 4 has no lessons at all** — all 25 topics and 20 grammar
  points at the level are still `[ ]`. If it gets the same "real text format" treatment
  delkurs 1-3's topics didn't get, that format still needs to be designed first (reading
  passage field, comprehension question types, `LessonPage` UI — see `SPEC.md` §5);
  otherwise it can reuse the same vocab/phrases pipeline as delkurs 1-3. This is the last
  remaining level, and finishing it completes SVA grund end to end.
- [ ] **SFI kurs D** has only 3 lessons, **kurs C** has 5. `CURRICULUM.md` lists roughly
  20 more topics under each level. A good candidate for a run with parallel agents
  (the approach is described in the CHANGELOG entry for 2026-09-05).
- [ ] `CURRICULUM.md`'s grammar lists: **60/160 points now have a dedicated lesson** — all
  of SVA grund delkurs 1, 2 and 3, each with bilingual (RU/EN) theory via the
  `theory_en.md` companion file. The other 100 points (SFI kurs A–D, SVA grund delkurs 4)
  still rely on grammar being threaded through topic lessons' theory rather than a
  dedicated lesson. There are also three reference articles in `content/grammar/`.
- [ ] None of the 161 lessons is grouped into a series (`part`/`series` from SPEC §5.2) —
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
- [ ] The main JS chunk is still 253 KB (after per-page code splitting) — the
  `TheoryView`/`registry` chunks can be split further if it becomes noticeable on slow
  networks.
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

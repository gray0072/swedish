# Reference — summaries, word bank and dialogues

This is a programme document, like [CURRICULUM.md](CURRICULUM.md), but for the half of the
app that is **not a course**. CURRICULUM.md lists 400 lessons: each teaches one point, in one
level, in five minutes. That is the right shape for learning and the wrong shape for *looking
something up*. This file describes the reference section that answers the questions a ladder
of lessons cannot, and it exists so that a new session can open it and start writing content
without rebuilding the context.

The dialogue catalogue is large enough to live on its own: see [DIALOGUES.md](DIALOGUES.md).
A Russian translation of this file is [REFERENCE_ru.md](REFERENCE_ru.md) and must be kept in
sync ([AGENTS.md](../AGENTS.md)).

## 1. What it replaces

`content/grammar/` holds three articles — word order, en/ett, verb groups 1–4 — written in
Russian only, which [AGENTS.md](../AGENTS.md) calls a bug. They are not deleted: they are the
seed of a much bigger section, rewritten in English with a `_ru` translation beside them, and
the folder is renamed to `content/reference/`, because the section is no longer only grammar.

The verb-groups article is the model for the whole set: one screen, one table that shows the
system whole, examples the learner can say out loud, and a closing paragraph on the real
exceptions. Every article below is written to that shape.

## 2. Three surfaces, one section

| Surface | Answers | Source | Authored? |
|---|---|---|---|
| **Summaries** | "How does this work in general?" | `content/reference/*.md` | Yes — 20 articles, §4 |
| **Word bank** | "What is the form of this word?" | every `vocab.json`, aggregated | **No — generated**, §5 |
| **Dialogues** | "What does this sound like between people?" | `content/dialogues/*.json` | Yes — 30 scenes, [DIALOGUES.md](DIALOGUES.md) |

## 3. Rules for the whole section

1. **Nothing here is scored.** No XP, no pass score, no locks, no progress rings, no
   prerequisites. A library that grades you is a test. The single bridge to the learning loop
   is the SRS one (§5.4, and `keyPhrases` in DIALOGUES.md §3) — it adds items to the review
   deck without adding a verdict.
2. **Summaries summarise; lessons teach.** An article that starts drilling should have been a
   lesson. A lesson that starts systematising the whole verb system across all eight levels
   should link to the article instead.
3. **Nothing is duplicated, everything is cross-linked** (§6.4). A fact lives in one place and
   is pointed at from the others.
4. **English is canonical.** `<slug>.md` is English; `<slug>_ru.md` is the translation, picked
   by the header language toggle exactly as `theory.md` / `theory_ru.md` already are.
5. **One entry in the navigation.** The section has depth; the chrome does not (§6).

## 4. Summaries — `content/reference/`

### 4.1 File format

```
content/reference/
├─ index.json              # slug → group + order. No titles: those come from the headings
├─ verb-groups.md          # English, starts with a single "# Title" heading
├─ verb-groups_ru.md       # Russian translation of the same article
└─ …
```

```jsonc
// content/reference/index.json
{
  "articles": [
    { "slug": "how-swedish-works", "group": "overview", "order": 10 },
    { "slug": "verb-groups",       "group": "verbs",    "order": 20 }
  ]
}
```

The loader already derives the slug from the filename and the title from the `# ` heading;
`index.json` adds only grouping and order, so an article is never described twice. A file
without an index entry, or an entry without a file, is a validation error.

### 4.2 Length and shape

Longer than a lesson's theory and still one sitting: **400–900 words**, at least one table,
`example` blocks for anything meant to be said aloud, and a closing paragraph on the
exceptions — the part a beginner actually trips on. An article may span every level of the
curriculum at once; that is the point of it.

### 4.3 The 20 articles

`[x]` — written, in both languages. `[ ]` — not started. The `→` line names the curriculum
lessons the article systematises, so the cross-links of §6.4 can be wired as it is written.

**Group `overview` — the shape of the language**

- [x] 1. `how-swedish-works` — the orientation article, written for someone arriving from
  Russian or English: no cases, two genders, the definite article glued to the end of the
  word, verbs that never change by person, and V2. What is easier than expected, and where the
  real wall is.
- [x] 2. `parts-of-speech` — substantiv, verb, adjektiv, adverb, pronomen, preposition,
  konjunktion, räkneord, interjektion: the Swedish metalanguage in one table, because SVA
  grundläggande teaches *in* it. → the SVA grund grammar lessons
- [x] 3. `sentence-types` — statement, question (v-word and yes/no), subordinate clause,
  imperative, and what changes in each. → `statement-word-order`, `simple-questions`,
  `wh-questions`
- [x] 4. `word-order` — **rewrite of the existing article.** V2, the fundament, inversion, the
  BIFF rule, and where `inte` sits in a main clause versus a subordinate one, laid out as a
  satsschema. → `statement-word-order`, `negation-inte`, the SVA clause lessons
- [x] 5. `pronunciation-and-spelling` — vowel length as a meaning-carrying feature, the sj-
  and tj-sounds, sentence melody, and the letters that do not say what a Russian or English
  reader expects. → `vowel-length`, `letter-sound-correspondence`, `word-stress-melody`,
  `connected-speech-reductions`

**Group `verbs` — the verb system**

- [x] 6. `verb-groups` — **rewrite of the existing article** (translated to English, the
  Russian kept as `_ru`). Groups 1–4, the table, the productive group, the strong verbs, and
  the true exceptions. → `present-tense-basics`, `imperative-four-groups`
- [x] 7. `verb-forms` — every form one Swedish verb has, in one place: infinitiv, presens,
  preteritum, supinum, perfekt and pluskvamperfekt, imperativ, presens- and perfektparticip,
  and the passive (`-s`, `bli`, `vara`). → `tense-system-overview`, `s-passive-bli-passive`,
  `pluperfect-narrative`
- [x] 8. `tense-system` — *which* tense to use and why: the perfekt-versus-preteritum trap, and
  how Swedish talks about the future with presens, `ska` and `kommer att`.
  → `tense-system-overview`
- [x] 9. `modal-verbs` — `ska`, `vill`, `kan`, `måste`, `får`, `bör`, `brukar`, `skulle`, each
  with the bare infinitive that follows it, and the politeness `skulle` buys.
  → `skulle-infinitive-politeness`, `infinitive-constructions`
- [x] 10. `strong-verbs` — the group-4 verbs arranged **by vowel pattern** (`i–e–i`:
  skriva/skrev/skrivit; `ju–ö–u`: bjuda/bjöd/bjudit; …), which is what makes a hundred
  irregular verbs memorisable instead of a flat list. Links into the word bank, filtered to
  group 4.

**Group `nouns` — the noun system**

- [x] 11. `noun-genders` — **rewrite of the existing article.** en/ett: what actually predicts
  it (endings, meaning groups), why it has to be learned with the word, and what getting it
  wrong costs. → `en-ett-basics`
- [x] 12. `noun-forms` — the four forms and the five plural declensions (`-or`, `-ar`, `-er`,
  `-n`, zero), the irregular plurals, the genitive `-s`, and the compounds where Swedish
  builds one long word out of three. → `definite-form-basics`, `plural-recognition`,
  `genitive-longer-phrase`

**Group `words` — adjectives, adverbs and the small words**

- [x] 13. `adjective-forms` — agreement in three shapes (`en stor bil`, `ett stort hus`,
  `stora hus`), the definite form after `den/det/de`, and the irregulars worth memorising:
  `liten/litet/lilla/små`, `gammal/gammalt/gamla`. → `liten-agreement`
- [x] 14. `comparison` — komparativ and superlativ: `-are/-ast`, `mer/mest`, and
  `bra/bättre/bäst`, `dålig/sämre/sämst`, `många/fler/flest`.
- [x] 15. `adverbs` — made from adjectives with `-t`, where they sit in the sentence, and the
  place adverbs that come in pairs (`hem/hemma`, `dit/där`, `ut/ute`) — a distinction neither
  Russian nor English marks this way.
- [x] 16. `pronouns` — personal, object, possessive, **reflexive** (`sin` versus `hans`, the
  classic error), demonstrative, relative `som`, and the impersonal `man`.
  → `personal-pronouns`, `min-mitt`, `det-har-dar`, `relative-clauses`, `impersonal-det`
- [x] 17. `prepositions` — `i`/`på`/`till`/`hos`/`vid`, time expressions, and the verb +
  preposition pairs that have to be learned as units (`tycka om`, `titta på`, `vänta på`).
  → `prepositions-i-pa`, `pa-with-days`, `abstract-prepositions`, `verb-preposition-pairs`
- [x] 18. `numbers-time-dates` — räkneord, ordinals, the clock (including `halv nio` = 8:30),
  dates, money and phone numbers. → `numbers-0-20`, `clock`, `writing-dates`, `phone-numbers`
- [x] 19. `conjunctions-and-connectors` — coordinating (`och`, `men`, `för`, `så`) versus
  subordinating (`att`, `om`, `när`, `eftersom`, `fastän`) and what the latter does to word
  order; then the connectors that hold a written text together.
  → `och-men-conjunctions`, `causal-clauses`, `concessive-clauses`, `text-connectors`
- [x] 20. `word-formation` — compounds, the prefixes `o-` and `miss-`, the suffixes `-are`,
  `-het`, `-ning`, and how loanwords are absorbed (`maila`, `deadline`). The article that lets
  a learner guess a word they have never seen. → `word-formation-o-miss`

## 5. Word bank — generated, never authored

"A big list of verbs in all forms, a big list of nouns in all forms" needs no new content:
**the content already exists**, spread across 400 `vocab.json` files, and validation already
forces every noun to carry a gender and all four forms and every verb a group and all four
principal forms (SPEC §15). The word bank is a **view over the existing vocabulary**, not a
second list to maintain — which is the only reason a list this size can stay correct.

### 5.1 What is there today

`adjFormsSchema` (§5.3) has been added and the backfill is mostly done — a fleet of agents
worked through all 400 lesson folders; two ran out of their rate-limit window before the very
last handful of files, so a small remainder is still open:

| Part of speech | Items | Still missing forms/group | Still missing an example |
|---|---|---|---|
| noun | 2 347 | 210 | — |
| phrase | 1 027 | — | — |
| verb | 986 | 21 without forms, 102 without a group | — |
| adj | 415 | 70 without forms | — |
| adv / pron / conjunction / numeral / prep / interjection | 642 combined | — | — |
| **any part of speech** | 5 417 | | **356** |

**5 417 items, 3 528 unique Swedish words.** Not every remaining "gap" above is really one:
some nouns are deliberately left without forms because they cannot take one honestly —
plural-only words (`pengar`, `sopor`), proper nouns and agency names (`Skatteverket`, `CSN`,
`Anna`), and a handful of fully invariant adjectives (`gratis`, `hela`, `samma`). The true
remaining work is smaller than the raw counts suggest, but real: run the counting script in
this section's history to see exactly which lesson folders still need a pass.

### 5.2 The tables

One table per part of speech — the same item, seen wide:

| View | Columns |
|---|---|
| Verbs | infinitiv · presens · preteritum · supinum · imperativ · group · translation · lesson |
| Nouns | en/ett · obestämd sg · bestämd sg · obestämd pl · bestämd pl · translation · lesson |
| Adjectives | positiv (en / ett / plural) · komparativ · superlativ · translation · lesson |
| Everything else | word · part of speech · translation · example · lesson |

Rows are deduplicated by the Swedish word; a word taught in several lessons keeps one row and
links to all of them. Every row carries the speaker button, like every other Swedish string in
the app.

### 5.3 Schema work — done, with one deliberate change from the original plan

- **Done.** `adjFormsSchema` — `{ positive, neuter, plural, comparative, superlative }` — is
  in `src/content/schema.ts`, added to the `forms` union.
- **Not required, on purpose.** The original plan said to make `forms` mandatory on every
  noun/verb/adj and have `scripts/validate-content.ts` fail on a missing one. Doing the actual
  backfill surfaced why that would be wrong: some nouns genuinely have no forms to give —
  plural-only words (`pengar`, `sopor`), proper nouns and agency names (`Skatteverket`, `CSN`,
  `Anna`), fully invariant adjectives (`gratis`, `hela`, `samma`). Requiring the field would
  have forced invented data onto exactly these words. `forms` stays optional; completeness is
  something to spot-check, not something the schema can enforce without lying about real
  Swedish.
- Backfilling the nouns/verbs/verb-groups/adjectives above is mostly done (§5.1's table shows
  what's left) — a fleet of parallel agents worked through all 400 lesson folders.
- Teaching `scripts/content-stats.ts` to print the table in §5.1 is still open — a small,
  independent follow-up.

### 5.4 Filters, not pages

A search box, a part-of-speech tab row, and three toggles that read the SRS state the app
already keeps: **all words** / **words I have seen** / **words due for review**. The last one
turns the word bank into a study tool without inventing a single new mechanic — it is the
review deck, sorted as a dictionary. The list is virtualised; 3 528 rows must not cost a
second of scrolling.

## 6. UI organisation — how not to overload it

This section roughly triples the material in the app. The whole design problem is keeping the
*interface* the same size.

### 6.1 One navigation entry

The desktop-only `Grammar` item becomes **`Reference`**, and nothing else is added. The mobile
bottom bar keeps its five primary destinations untouched: the reference section is somewhere
you go on purpose, not part of the daily loop.

### 6.2 A hub of three tabs, each a real route

| Path | Page |
|---|---|
| `/reference` | Hub; redirects to `/reference/summaries` |
| `/reference/summaries` | The 20 articles, grouped as in §4.3 |
| `/reference/summaries/:slug` | One article |
| `/reference/words` | The word bank — built, grouped by part of speech and frequency band (§5.4) |
| `/reference/dialogues` | The 30 scenes, grouped by situation — placeholder until DIALOGUES.md is written |
| `/reference/dialogues/:slug` | One dialogue |

Tabs are routes, not component state, so the back button and a shared link both behave. The
old `/grammar` paths are removed rather than aliased — the site is static, has no users to
break, and a redirect nobody needs is a shim that outlives its reason.

### 6.3 Rules that keep each tab light

- **Groups are collapsed by default**, except the first. Each tab opens as five or six
  headings on a phone, not as a wall of forty links.
- **No progress rings, no percentages, no badges** anywhere in the section (§3.1). The visual
  quiet *is* the signal that this is not a course.
- **One screen, one job.** The article page is text, the word bank is a table, the dialogue is
  a transcript. Nothing is embedded inside anything else.
- The word bank's table is the only horizontally scrollable element in the app, inside its own
  container, per the mobile rules in SPEC §10.

### 6.4 Cross-links instead of duplication

- **Done.** A lesson with `"kind": "grammar"` shows one link under its theory — *"See the whole
  system →"* — pointing at the article that covers it. This is the section's main discovery
  path: the learner meets it exactly when they want it. The mapping lives in
  `src/content/referenceLinks.ts`, transcribed from the `→` annotations in §4.3.
- **Done.** An article ends with the lessons that drill it, taken from the same `→`
  annotations — resolved across every level that repeats the point (`getLessonsBySlug`), since
  grammar recurs by design (CURRICULUM.md).
- **Done.** A word-bank row links to the lesson that teaches the word.
- **Not done.** A dialogue linking to the article for the grammar it leans on — depends on
  DIALOGUES.md, which is unwritten.

### 6.5 What is deliberately *not* added

No reference card on the home screen, no "article of the day", no app-wide search. The home
screen belongs to the daily loop — due reviews, streak, continue learning, the city — and
bolting a library onto it would cost exactly the thing this section is trying to protect.

## 7. Order of work

1. **Schema and folder.** `content/grammar/` → `content/reference/`, `index.json`, the loader
   and validation changes, the `/reference` routes (a layout with three tabs) and the nav swap.
   **Done** — the loader now also resolves an optional `<slug>_ru.md` beside each article,
   picked by the study-language toggle exactly like `theory.md`/`theory_ru.md`, so a
   translation can be dropped in without touching code. **Adjective forms** (the vocab-schema
   addition from §5.3) is *not* part of this step — it belongs to the word-bank backfill in
   step 4 below, and is still open.
2. **The three existing articles** — `word-order`, `noun-genders`, `verb-groups` — rewritten to
   the §4.2 shape and translated to English. **Done.**
3. **Groups `overview` and `verbs`** — articles 1–10. **Done.**
4. **The word bank**, once articles 6–10 exist to link into it, together with the content
   backfill of §5.3. **Mostly done.** `adjFormsSchema` was added to `src/content/schema.ts`
   (kept optional, not required — see the note below); `getWordBank()` in
   `src/content/registry.ts` deduplicates every lesson's vocabulary by (part of speech,
   Swedish word), buckets it into verbs/nouns/adjectives/other, and bands each bucket into
   groups of ~50 in curriculum order (the app's only real proxy for "most common first" — no
   frequency corpus exists); `ReferenceWordsPage.tsx` renders it as the wide tables §5.2
   specifies, with a search box and collapsible bands. The content backfill (§5.1) was run
   across all 400 lesson folders by a fleet of parallel agents; a small remainder (§5.1's
   table) is still open where agents ran out of their rate-limit window. **Forms were
   deliberately left optional in the schema, not made required**: real Swedish has nouns that
   cannot take a form honestly (plural-only words, proper nouns, agency names), and the
   backfill agents correctly declined to invent one for them — a hard requirement would have
   forced bad data onto exactly those words.
5. **Groups `nouns` and `words`** — articles 11–20. **Done.**
6. **Dialogues** — [DIALOGUES.md](DIALOGUES.md), independent of all of the above and writable
   in parallel by anyone who would rather write scenes than tables. **Not started**, by
   request — out of scope for this pass. `/reference/dialogues` exists today as a route with
   a "not written yet" placeholder.
7. **Bilingual translations.** **Done** — all 20 `<slug>_ru.md` files exist next to their
   English originals, translated by two parallel agents.

## 8. Done means

- [x] 20 articles exist, each under 900 words, each with at least one table and `example`
      blocks, each now with a `_ru` translation.
- [x] No article duplicates a lesson's theory; each links to the lessons it summarises, and
      back (§6.4).
- [~] The word bank lists every vocabulary item in the app; nearly every noun, verb and
      adjective shows a complete set of forms — a few hundred items (§5.1) still need a pass,
      and a handful more are deliberately form-less because the word itself doesn't inflect.
- [x] `/reference` is one navigation entry with three tabs, and the mobile bottom bar is
      unchanged.
- [x] Nothing in the section awards XP, gates anything, or shows a score.
- [x] The word bank scrolls without stutter — each band renders its rows only while expanded,
      so a closed band costs nothing.

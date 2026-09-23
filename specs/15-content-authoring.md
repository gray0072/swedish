# 15. Content authoring workflow

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [15-content-authoring_ru.md](15-content-authoring_ru.md) and must be kept in sync.

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

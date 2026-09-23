# 13. Local development

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [13-local-development_ru.md](13-local-development_ru.md) and must be kept in sync.

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

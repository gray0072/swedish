# AGENTS.md

Working agreements for anyone — human or agent — contributing to this repository.
Product spec: [SPEC.md](SPEC.md). Lesson plan: [CURRICULUM.md](CURRICULUM.md).

## Language

**English is the primary language of this project** — for every document and for the
app interface. Write in English first; a translation is optional and always secondary.

- **Documents.** The canonical file has no language suffix and is written in English:
  `SPEC.md`, `README.md`, `TODO.md`, `CHANGELOG.md`, `CURRICULUM.md`. A Russian
  translation of a document lives next to it with the **`_ru` suffix**:
  `SPEC_ru.md`, `TODO_ru.md`, `CHANGELOG_ru.md`, `CURRICULUM_ru.md`. No other
  language suffix is in use; there is no `_en` suffix, because English is the default.
- **Keeping pairs in sync.** When a document changes, update the English file and its
  `_ru` translation in the same commit. If a `_ru` file does not exist for a document,
  do not create one just to have it — only English is required.
- **A Russian-only document is a bug.** If content is written in Russian under a
  suffix-less name, it must be translated to English at that name, and the Russian
  text moved to the `_ru` file.
- **Interface.** UI strings are authored in `src/i18n/locales/en.json`; `en` is the
  source of truth for the key set and the default language in `src/store/persist.ts`.
  `ru.json` is a translation and must carry exactly the same keys. Swedish as a
  *studied* language is unrelated to this rule — that is lesson content, not interface.
- **Content files.** `content/**` is learning material, not documentation: Swedish is
  the subject, and translations of words and sentences follow the content schemas
  (`src/content/schema.ts`) rather than this rule.
- **Code.** Identifiers, comments, commit messages and PR descriptions are English.

## Commits

One subject line, no body, no trailers.

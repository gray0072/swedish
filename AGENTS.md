# AGENTS.md

Working agreements for anyone — human or agent — contributing to this repository.
Product spec: [SPEC.md](SPEC.md) — an index; each of its sections is a file in
[specs/](specs/). Lesson plan: [CURRICULUM.md](specs/CURRICULUM.md). Plan for the
reference section: [REFERENCE.md](specs/REFERENCE.md) and [DIALOGUES.md](specs/DIALOGUES.md).
Plan for the city illustration: [CITY_VISUALS.md](specs/CITY_VISUALS.md). Every planning and
spec document lives in `specs/`; `SPEC.md` stays at the root as the table of contents.

## Language

**English is the primary language of this project** — for every document and for the
app interface. Write in English first; a translation is optional and always secondary.

- **Documents.** The canonical file has no language suffix and is written in English:
  `SPEC.md`, `README.md`, `TODO.md`, `CHANGELOG.md`, `specs/CURRICULUM.md`,
  `specs/REFERENCE.md`, `specs/DIALOGUES.md`, `specs/08-gamification.md`. A Russian
  translation of a document lives next to it with the **`_ru` suffix**:
  `SPEC_ru.md`, `TODO_ru.md`, `CHANGELOG_ru.md`, `specs/CURRICULUM_ru.md`,
  `specs/08-gamification_ru.md`. No other
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

## Shared origin: storage and the PWA

The app is served from `https://gray0072.github.io/swedish/`, next to other apps on the same
origin (`/ivan/…`, `/tanks/`). Folders do not separate browser storage — only the origin does.

- **Every storage name starts with the app's name.** `localStorage` / `sessionStorage` keys,
  IndexedDB database names and Cache Storage cache names begin with `swedish` (the save is
  `swedish-app`). A bare `settings` or `progress` would read and overwrite another app's data.
  Names a library builds from its own unique id (Supabase's `sb-<project-ref>-…`, Workbox's
  precache name, which carries the scope `/swedish/`) are already apart.
- **Never wipe the whole origin.** `localStorage.clear()`, deleting every cache from
  `caches.keys()` or every IndexedDB database destroys the other apps' data; remove only names
  with this app's prefix.
- **The manifest `id` is an absolute path: `"/swedish/"`.** A relative `id` such as `"./"`
  resolves against the *origin* of `start_url`, not the manifest's folder, so every app on the
  domain would get the same id and Android would treat them as one app. `start_url` and `scope`
  stay `/swedish/`, so the app is installable next to the others.
- **Updates never interrupt a quiz.** The service worker is registered in `prompt` mode; a new
  version waits until the learner leaves the quiz, review or result screen, then the page
  reloads into it (`src/lib/appUpdate.ts`). The app also checks for a new version each time it
  returns to the foreground. A new screen that holds unsaved in-progress state belongs in
  `BUSY_ROUTES` there.

## Commits

One subject line, no body, no trailers.

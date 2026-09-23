# 0. Locked decisions

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [00-locked-decisions_ru.md](00-locked-decisions_ru.md) and must be kept in sync.

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
| Narrative theme | **Vikings and the real history of Sweden and Stockholm.** Every historical era, building and history card is anchored to verified facts; the four future eras are labelled speculation wherever they appear. Full spec in §12 |

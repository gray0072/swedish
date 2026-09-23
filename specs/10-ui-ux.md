# 10. UI/UX requirements

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [10-ui-ux_ru.md](10-ui-ux_ru.md) and must be kept in sync.

- **Mobile-first.** Most study happens on a phone. Quiz answer targets ≥ 44 px.
- **Dark mode** via Tailwind `class` strategy, defaulting to system preference.
- **Language toggle in the header.** A single `RU / EN` switch sits in the top bar on every page.
  It controls **both** the interface language and the translation shown next to Swedish — there is
  one language setting, not two. Default: `en`. Persisted to localStorage under
  `swedish-app:language` (written eagerly on change, also mirrored into the save file) and read
  before first paint so there is no flash of the wrong language.
  All UI strings go through `i18n`; no hardcoded text in components. Swedish is content only —
  there is no Swedish interface locale in v1.
- **Level labelling honesty:** every track carries a `note` rendered above its levels, saying that
  the topic breakdown inside the courses is a pragmatic approximation, not the official
  Skolverket syllabus.
- **Audio everywhere:** every Swedish word, example and question prompt has a speaker button.
  On first load, warn once if no `sv-SE` voice is installed, with a link to OS instructions.
- **Positive feedback:** an aurora sweep on a perfect run, a coin-count animation, subtle sounds
  (mutable), encouraging copy in Swedish. Full motion, sound and voice spec in §11.6–11.8.
- **Accessibility:** full keyboard navigation, visible focus rings, `aria-live` for feedback,
  respect `prefers-reduced-motion`, contrast ≥ 4.5:1.
- **PWA:** installable, offline-capable via a service worker precaching the app shell and
  all content JSON.

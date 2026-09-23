# 3. Tech stack

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [03-tech-stack_ru.md](03-tech-stack_ru.md) and must be kept in sync.

| Concern | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** (strict) | Content schemas + gamification state benefit enormously from types |
| Build tool | **Vite** | Instant HMR, trivial static output, first-class GitHub Pages support |
| UI | **React 18** | Largest ecosystem, easy for contributors |
| Routing | **React Router** with `HashRouter` | Hash routing works on GitHub Pages with zero server config |
| State | **Zustand** + `persist` middleware | Tiny, no boilerplate, localStorage persistence built in |
| Styling | **Tailwind CSS** | Fast iteration, consistent spacing/colour scale, dark mode out of the box |
| Content loading | `import.meta.glob` (eager) | Auto-discovers lesson files; no manual index to maintain |
| Validation | **Zod** | Same schemas used at build time (CI) and in dev-mode runtime checks |
| Markdown | `react-markdown` + `remark-gfm` | Theory is authored in Markdown |
| Tests | **Vitest** + **@testing-library/react** | Same config as Vite, zero extra setup |
| Audio | **Web Speech API** (`speechSynthesis`, `sv-SE`) | Free, offline, no assets to host |
| Icons | **lucide-react** | Consistent, tree-shakeable |

> **Alternative considered:** SvelteKit or Astro with static adapter. Both are excellent, but
> React + Vite has the lowest friction for contributors and the largest component ecosystem.
> If the app grows heavily content-first, Astro becomes the better choice — revisit at v2.

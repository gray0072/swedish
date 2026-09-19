# CITY_VISUALS_MOTION.md — motion

Part of [CITY_VISUALS.md](CITY_VISUALS.md). What moves, how it is driven, and what it is
allowed to cost. Extends SPEC §11.6 rather than replacing it.

## 1. Three categories

| Category | Trigger | Examples | Under `calm` | Under reduced motion |
|---|---|---|---|---|
| **Ambient** | Always on | Waves, smoke, citizens, boats, sparkle | Off | Off |
| **Reactive** | Learner input | Hover lift, tap ring, tooltip | On | Instant, no transition |
| **Event** | State change | Carve-in, upgrade, era cross-fade, affordability shimmer | On, shortened 50 % | Replaced by an instant state swap |

SPEC §11.6's existing rules (150–200 ms ease-out, aurora ≤ 1.2 s, carve-in on build) govern
the event category unchanged; this document adds the ambient category and its controls.

## 2. Implementation

- **CSS animations on groups** are the default: `transform` and `opacity` only, declared in
  one `city-scene.css`, applied by class. They run off the main thread and survive React
  re-renders.
- **One rAF loop** drives everything that needs real state: citizens, workers, boats. It
  lives in `useSceneClock()`, ticks at most 30 fps (`dt` clamped to 100 ms), and writes
  positions by mutating `transform` on refs — never through React state.
- **No SMIL** (`<animate>`): inconsistent across engines, and impossible to pause centrally.
- **No filters** — no `feGaussianBlur`, no `drop-shadow`, no `backdrop-filter`. Shadows and
  glows are drawn as shapes with flat opacity.

## 3. Catalogue

| Name | Target | Duration | Easing | Loop |
|---|---|---|---|---|
| `wave-scroll` | Water bands | 6 / 9 / 13 s | linear | ∞ |
| `foam-dash` | Shoreline | 7 s | linear | ∞ |
| `sparkle` | Water diamonds | 3–5 s, staggered | ease-in-out | ∞ |
| `smoke-rise` | Chimney puffs | 4 s | ease-out | ∞ |
| `flag-flap` | Banners | 700 ms | steps(2) | ∞ |
| `reed-sway` | Foreground props | 5 s | ease-in-out | ∞ |
| `plot-pulse` | Affordable plots | 2.4 s | ease-in-out | ∞ |
| `plot-shimmer` | Newly affordable | 900 ms | ease-out | once |
| `build-carve` | New building | 900 ms | ease-out | once |
| `upgrade-carve` | Added mass only | 700 ms | ease-out | once |
| `hover-lift` | Building group | 160 ms | ease-out | once |
| `tap-ring` | Building base | 450 ms | ease-out | once |
| `era-fade` | Whole scene | 260 ms | ease-in-out | once |
| `window-lights` | Lit windows | 2 s stagger | steps(1) | once per era open |
| `aurora-drift` | Aurora band | 18 s | ease-in-out | ∞ |

`build-carve` is the one moment that is allowed to be theatrical: the outline draws itself
with `stroke-dashoffset` (0 → 100 % of path length), then fills wash in bottom-up over
300 ms, then the worker appears. It is the visual twin of the D-major chord in SPEC §11.7,
and the two must start on the same frame.

## 4. Controls

Three ways motion gets turned down, in precedence order:

1. `prefers-reduced-motion: reduce` → forced to `off`, always, not overridable by settings.
2. `settings.cityMotion: 'full' | 'calm' | 'off'` (new, persisted, defaults to `full`) —
   surfaced in Settings next to the existing sound toggle.
3. Automatic: the clock pauses when the map is off-screen (`IntersectionObserver`, 10 %
   threshold), when the document is hidden (`visibilitychange`), and when the tab is
   backgrounded. Paused means the rAF loop is cancelled and ambient CSS classes are removed,
   not merely `animation-play-state: paused`, so nothing is scheduled at all.

At `off`, every element renders at a fixed, hand-chosen rest phase: waves flat, smoke absent,
citizens standing at spread-out nodes, windows lit. A still frame of the scene is a
deliverable in its own right and must look composed, not paused mid-step.

## 5. Performance budget

Hard limits, enforced in review and by the dev overlay ([CITY_VISUALS_TECH.md §7](CITY_VISUALS_TECH.md)):

- **≤ 700 SVG nodes** in the live scene, of which ≤ 60 ambient
  ([CITY_VISUALS_LIFE.md §7](CITY_VISUALS_LIFE.md)) and ≤ 40 agent nodes.
- **≤ 4 ms** of scripting per frame on a mid-range 2020 Android; the rAF loop touches only
  `transform` strings on pre-resolved refs.
- **≤ 24 CSS-animated groups**. Ambient animation is applied to groups, never to leaves.
- No animated attribute that triggers layout: no `x`, `y`, `width`, `d`, `cx`. Position
  changes go through `transform` only.
- The whole scene must mount in **≤ 16 ms** after its era chunk resolves; art modules are
  pure and do no work at import time beyond building the wobble table.

## 6. Celebrations

The existing perfect-run aurora sweep (SPEC §11.6) stays in the quiz. The city's own
celebration is the carve-in plus, for a level-3 completion, a single eight-petal star
settling above the roof over 600 ms. There is no confetti, no screen shake, no coin rain —
the city is the calm half of the app, and it earns its rewards by being permanent, not loud.

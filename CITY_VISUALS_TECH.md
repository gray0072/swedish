# CITY_VISUALS_TECH.md — implementation

Part of [CITY_VISUALS.md](CITY_VISUALS.md). File layout, data changes, validation, delivery
order and testing.

## 1. Module layout

```
src/components/city/
  CityMap.tsx              // unchanged public API: { era, buildings } -> the map
  scene/
    Scene.tsx              // <svg>, the layer stack, era theme provider
    iso.ts                 // toScreen(), depthOf(), footprint maths
    island.ts              // the walkable cell set, terrain paths, path graph
    themes.ts              // SceneTheme per era, light + dark
    wobble.ts              // seeded PRNG, wobble(path) helper
    useSceneClock.ts       // the single rAF loop, pause rules
    layers/
      Sky.tsx Horizon.tsx Water.tsx Terrain.tsx Plots.tsx
      Buildings.tsx Agents.tsx Vessels.tsx Props.tsx Weather.tsx HitLayer.tsx
  art/
    registry.ts            // eraId -> () => import('./<era>')
    <era>/index.ts         // buildingId -> BuildingArt
    <era>/<building>.tsx
    shared/primitives.tsx  // isoBox, isoRoof, shadow, capsule
    shared/props.tsx
    shared/figures.tsx     // citizen, worker, drone, boats
  icons.tsx                // stays — cards, achievements, toasts
```

`CityMap`'s props do not change, so `CityPage` is untouched by this work.

## 2. Data model

Two additions to `content/city/buildings.json` and `src/content/schema.ts`:

```ts
position: z.object({ x: z.number(), y: z.number() }),          // kept, still used as fallback
cell: z.object({ q: z.number().int(), r: z.number().int() }).optional(),
footprint: z.object({ w: z.number().int(), h: z.number().int() }).default({ w: 1, h: 1 }),
```

- `cell` is optional in the schema, and all 38 buildings now carry one. A building without
  one is still placed by projecting its percentage `position` onto the nearest free island
  cell — that fallback stays, so new content can be authored before its cell is picked.
- `footprint` lives in content, not in the art file, because it is a placement fact the
  validator needs without importing TSX.
- Nothing else in content changes. Art, materials, ambient emitters and work spots stay in
  code, matching how `icons.tsx` already works.

## 3. Loading and code splitting

- `art/registry.ts` maps era id to a dynamic `import()`, so exactly one era's art is in the
  bundle at a time. `Scene` suspends on it with a skeleton that is the terrain layers alone —
  those are static and live in the main chunk, so the island appears instantly and the
  buildings arrive.
- Switching era: keep the previous era's chunk mounted until the new one resolves, then
  cross-fade (`era-fade`, 260 ms). Never show an empty island between two eras.
- Budget per era chunk: **≤ 12 KB gzip**; ≤ 120 KB gzip for all ten. Checked in CI by a size
  assertion over `dist/assets/city-*.js`.

## 4. Rendering discipline

- The scene is rendered from three inputs only: `era`, `buildings`, `levels`. It holds no
  store subscriptions of its own, so it is trivially testable and never re-renders on
  unrelated state.
- Agents live outside React: created once per era in a ref-held array, mutated by the clock.
  React renders their `<g>` shells; the clock moves them.
- Memoise per building: `<BuildingInstance>` is `React.memo`'d on `(id, level, theme)`, so a
  purchase re-renders one building, not the island.

## 5. Validation

Extend `scripts/validate-content.ts` with a city-art pass:

1. Every building id has an entry in its era's art barrel, and vice versa.
2. `levels.length === BUILDING_PRICES[id].maxLevel`.
3. `cell` is inside `island.ts`'s walkable set (error from Phase 4 on, warning before).
4. No two footprints in the same era overlap, and none crosses the shoreline.
5. Every `ambient` emitter name is known; the era's total emitter count is within budget.
6. Every `SceneTheme` has both a light and a dark variant, and every token is a hex literal.

## 6. Accessibility

- The `<svg>` is `role="group"` with an `aria-label` naming the era, and `aria-hidden` on
  every decorative layer. Only the hit layer is exposed. It is deliberately **not**
  `role="img"`: that role flattens its subtree for assistive tech, which would hide the very
  building targets the next bullet makes focusable.
- Hit targets are `<g role="button" tabIndex={0}>` with the label from
  [CITY_VISUALS_BUILDINGS.md §7](CITY_VISUALS_BUILDINGS.md), activating on Enter and Space.
- The building cards below the map remain the complete, linear, screen-reader-friendly
  representation. Nothing is ever *only* on the map.
- Focus ring: 2 units, era trim colour, ≥ 3:1 against both ground and water.

## 7. Dev tooling

A dev-only overlay behind `import.meta.env.DEV`, toggled with a query flag `?scene=debug`:

- Grid cells with their `(q, r)`, footprints, the path graph, and agent routes.
- Live node count, animated-group count, and a frame-time readout against §5's budget.
- Buttons to force level 0–3 on every building and to jump era, so art can be reviewed
  without a save file.

## 8. Phases

| Phase | Deliverable | Status |
|---|---|---|
| 0 | `iso.ts`, `island.ts`, `themes.ts`, terrain + water + sky layers | Done |
| 1 | Plots, hit layer, affordability pulse, hover/tap/keyboard | Done |
| 2 | Building art for `tribe` and `viking`, all levels, carve-in | Done |
| 3 | `useSceneClock`, ambient emitters, motion settings, reduced-motion still frame | Done |
| 4 | Citizens, workers, vessels; `cell`/`footprint` in content | Done |
| 5 | Remaining eight eras' art | Done |
| 6 | Weather, era cross-fade, lit windows, level-3 star | Done; SPEC §11.5/§11.6 amended |

The badge fallback stays in the code: an era or a building with no art keeps its icon badge
planted on its plot. Nothing uses it today, but it is what lets new content be authored
before it is drawn, and that mixed state must keep looking deliberate.

## 9. Testing

- Unit (vitest, no DOM): `toScreen`/`depthOf` round-trips, depth sort stability, footprint
  overlap detection, path-graph connectivity, population formula, agent step integration over
  a fixed `dt` sequence.
- Content: the §5 validation pass runs in `npm run validate`, which CI already gates on.
- Visual: the dev overlay's "force all levels" mode is the review surface. No screenshot
  tests — they would fail on every wobble change and teach us nothing.
- Manual checklist per era: silhouette test at 60 units, dark theme, reduced motion still
  frame, keyboard traversal, 360 px width.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Art volume: 39 buildings × up to 3 levels | Shared primitives and props; levels are additive; phase per era |
| Bundle growth | Per-era chunks, CI size assertion (§3) |
| Frame cost on low-end Android | Node and animation budgets (§5), central pause, 30 fps cap |
| Style drift from SPEC §11 | Materials only from era tokens; one non-token colour per building, justified in the file's header comment |
| The map duplicating card information and drifting from it | The map renders from `levels` alone and shows no numbers except the level star |

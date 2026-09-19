# CITY_VISUALS_SCENE.md — the scene

Part of [CITY_VISUALS.md](CITY_VISUALS.md). Defines the stage every building and citizen
stands on: coordinates, layers, terrain and era colour.

## 1. Canvas and camera

- One `<svg>` per map, `viewBox="0 0 1200 900"` (4:3, matching the current container),
  `preserveAspectRatio="xMidYMid slice"`. World units are viewBox units; 1 unit ≈ 1 px at
  1200 px wide.
- **Fixed camera.** No pan, no zoom, no rotation. Everything fits at every breakpoint, so
  there is nothing to scroll to and nothing to get lost in.
- Light comes from the **upper left** everywhere and never moves. It is what makes flat
  shapes read as solid.

## 2. The isometric grid

Buildings stand on a 2:1 isometric grid, which is what turns "icons on a picture" into a
place with ground.

```
TILE_W = 96, TILE_H = 48          // world units, 2:1
ORIGIN = { x: 600, y: 300 }        // grid cell (0,0) centre

screenX = ORIGIN.x + (q - r) * TILE_W / 2
screenY = ORIGIN.y + (q + r) * TILE_H / 2
depth   = q + r                    // painter's-algorithm sort key
```

- The island spans roughly `q ∈ [-4, 5]`, `r ∈ [-4, 5]`; the exact walkable set is a
  hand-authored cell list in `src/components/city/scene/island.ts`.
- A building occupies a `footprint` of 1×1, 2×1 or 2×2 cells and is anchored at its
  **front-bottom** corner, so tall art can overhang upward without breaking sorting.
- Buildings render sorted by `depth`, then by `q` — back rows first. Ties are impossible
  because footprints may not overlap (enforced by validation,
  [CITY_VISUALS_TECH.md §5](CITY_VISUALS_TECH.md)).

## 3. Layer stack

Back to front. Each layer is one `<g>` with a stable id, so motion and reduced-motion rules
can target layers rather than individual shapes.

| # | Layer | Contents | Moves? |
|---|---|---|---|
| 0 | `sky` | Two-stop vertical era gradient | No |
| 1 | `celestial` | Sun or moon disc; aurora band in the night eras | Very slow drift |
| 2 | `horizon` | Mainland ridge, distant spires, three depth bands at 6 / 10 / 14 % opacity | Parallax 0 (fixed) |
| 3 | `water` | Mälaren: base fill + 3 wave bands + shoreline foam | Wave scroll |
| 4 | `vessels` | Boats and ferries on scripted routes | Yes |
| 5 | `terrain` | Island rock, grass, cliff edge, quays, paths, fields | No |
| 6 | `plots` | Unbuilt building sites: dashed outline, post sign | Pulse when affordable |
| 7 | `buildings` | Depth-sorted building instances and their shadows | Build-in, idle |
| 8 | `agents` | Citizens and workers | Yes |
| 9 | `props` | Foreground rocks, reeds, a boat at the near quay | Reeds sway |
| 10 | `weather` | Optional snow / rain / pollen, era-conditional | Yes |
| 11 | `hit` | Transparent `<a>`/`<g role="button">` targets, one per building or plot | — |

The hit layer is separate and last so hover/focus never depends on the art's shape, and so
focus rings draw above everything.

## 4. Terrain

- The island silhouette is the **same polygon in every era** — the existing Stadsholmen
  path, re-drawn in world coordinates. Only fills and what stands on it change.
- Three ground tones per era: top surface, a 1-cell cliff band at the shoreline, and the
  wet rock strip at the waterline. Cliff band = surface tone darkened 14 %.
- Shoreline, quay edges and path borders use the **woodcut wobble**: every long edge is a
  path with ±0.6 unit jitter at ~18-unit intervals, generated once at module load from a
  seeded PRNG so it is stable across renders but not mechanically straight.
- Paths connect building plots along grid edges and are the routes citizens walk
  ([CITY_VISUALS_LIFE.md §3](CITY_VISUALS_LIFE.md)). A path segment only draws once at least
  one of the two plots it joins is built.

## 5. Water

- Base: era water colour at 100 %, plus a second two-stop gradient for depth near the horizon.
- Three wave bands, each a repeating wobbled sine path, 60 units tall, scrolling horizontally
  at 6 / 9 / 13 s per cycle in alternating directions. Scroll by `translateX` on the group,
  with the path drawn 1.5× the viewBox width so the loop is seamless.
- Shoreline foam: a short dashed white-at-25 % stroke hugging the island edge, with its
  `stroke-dashoffset` animating over 7 s.
- Water sparkle: 12–20 tiny 2×2 diamonds at fixed positions, opacity looping 0 → 0.5 → 0 on
  staggered 3–5 s delays. Cheap, and it is most of what makes still water look alive.

## 6. Era styling

Each era supplies a `SceneTheme` — the single place colour lives, derived from the era's
content palette plus a small hand-tuned set:

```ts
interface SceneTheme {
  sky: [string, string];        // gradient stops, top → horizon
  water: { base: string; deep: string; wave: string; foam: string };
  ground: { top: string; cliff: string; wet: string };
  horizon: string;              // silhouette tone
  material: MaterialTokens;     // see CITY_VISUALS_BUILDINGS.md §3
  time: 'day' | 'dusk' | 'night';
  ambient: AmbientFlags;        // smoke, birds, snow, aurora, drones…
}
```

Era intent, following SPEC §11.5's material progression:

| Era | Time | Reads as |
|---|---|---|
| tribe | day | Bare rock, birch scrub, one firepit's smoke, no quays |
| viking | day | Timber, turf roofs, a longship at a wooden jetty |
| medieval | dusk | Brick and lime plaster, a wall ring, church spire |
| empire | day | Baroque stone, pale yellow plaster, tall ships |
| industrial | dusk | Red brick, iron, smoke plumes, lit windows appearing |
| modern | night | Concrete, glass, lit metro sign, warm window grid |
| green | day | Timber towers, planted roofs, unusually green island |
| connected | dusk | Glass and light, faint drone traffic |
| floating | day | Higher waterline, pontoon rings extending past the island edge |
| stellar | night | Deep violet sky, aurora band, beacon light sweeping |

Lit windows are era-gated: from `industrial` onward, a building's windows light up in the
dusk/night eras, staggered so they switch on one by one over ~2 s when the era is opened.

## 7. Dark theme

The scene has its own `time` per era, so it must not simply invert. Rule: in dark theme,
`sky`, `water` and `ground` tones drop 18 % in lightness and gain 6 % in the era accent's
hue; building fills stay identical, strokes lighten to keep ≥ 3:1 against their fill. Both
theme variants ship as literal token values — no runtime colour maths beyond the shared
`mix()` helper, so themes are reviewable by eye in one file.

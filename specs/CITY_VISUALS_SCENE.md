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

### Framing

One horizon governs the whole picture: `WATER_LINE = 260` in `iso.ts`. Sky above it, one
unbroken body of water from it down to `y = 900`, and a single island sitting *in* that water:

```
y =   0 … 260   sky, sun/moon, birds; the mainland ridge rises out of the far shore
y = 260         WATER_LINE — the horizon, and the only place sky and water meet
y = 260 … 336   far water: haze, fine wave bands, boats passing behind the island
y = 336 … 672   the island (plus its rock slab); tall art overhangs upward into the sky
y = 672 … 900   near water: the deepest tone, the largest waves, foreground rocks and reeds
```

Sky, water, horizon, the vessel routes and `ORIGIN.y` are all derived from `WATER_LINE`, so
the sea can never come loose from the shore and leave the island hanging in mid-air.

## 2. The isometric grid

Buildings stand on a 2:1 isometric grid, which is what turns "icons on a picture" into a
place with ground.

```
TILE_W = 96, TILE_H = 48          // world units, 2:1
ORIGIN = { x: 600, y: 480 }        // grid cell (0,0) centre — below WATER_LINE

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
| 2 | `horizon` | Mainland ridge rising out of the far shore, three depth bands, base at `WATER_LINE` | Parallax 0 (fixed) |
| 3 | `water` | Mälaren, `WATER_LINE` to the bottom edge: base + depth gradients + 3 wave bands + shallows and foam | Wave scroll |
| 4 | `vessels` | Boats on a route in the far water, so they pass behind the island | Yes |
| 5 | `terrain` | Island rock, grass, cliff edge, quays, paths | No |
| 6 | `plots` | Unbuilt building sites: dashed outline; a post sign only where no blueprint stands | Pulse when affordable |
| 7 | `buildings` | Buildings, plot blueprints and the decor (§4a), painter-sorted *together* by the front of their footprints | Build-in, idle |
| 8 | `agents` | Citizens and workers | Yes |
| 9 | `badges` | Calls to action over buildings and plots: upgrade arrow, build plus, saving ring | Gentle bob |
| 10 | `props` | Foreground rocks, reeds, a boat at the near quay | Reeds sway |
| 11 | `weather` | Optional snow / rain / pollen, era-conditional | Yes |
| 12 | `hit` | Transparent `<g role="button">` targets, one per building or plot; the selected one keeps a dashed ring | — |

The hit layer is separate and last so hover/focus never depends on the art's shape, and so
focus rings draw above everything.

## 4. Terrain

- The island silhouette is the **same outline in every era** — the walkable set's convex hull,
  jittered per vertex by a seeded PRNG and closed with a Catmull-Rom spline so it reads as a
  coastline rather than as the polygon it comes from. Only fills and what stands on it change.
- **The island has thickness.** The silhouette is drawn three times: a soft shadow cast on the
  lake, a copy offset down by `ISLAND_DEPTH = 26` in the cliff tone (the rock face below the
  grass), and the surface itself. That extruded sliver, plus the shallows ring `water` draws
  around it, is what plants the island in the water instead of on top of it.
- Three ground tones per era: top surface, a 1-cell cliff band at the shoreline, and the
  wet rock strip at the waterline. Cliff band = surface tone darkened 14 %. A single gradient
  from transparent (upper left) to the cliff tone (lower right) carries the fixed light.
- Path borders use the **woodcut wobble**: every long edge is a path with ±0.6 unit jitter at
  ~18-unit intervals, generated once at module load from a seeded PRNG so it is stable across
  renders but not mechanically straight.
- Paths connect building plots along grid edges and are the routes citizens walk
  ([CITY_VISUALS_LIFE.md §3](CITY_VISUALS_LIFE.md)). A path segment only draws once at least
  one of the two plots it joins is built. The whole network is two paths — a worn edge in the
  cliff tone and a trodden centre in the era's `path` tone — so its node cost does not grow
  with the town. Its wobble is seeded per render, so a re-render (a hover) never re-jitters it.

## 4a. Decor — what grows on the island

`scene/decor.ts` places, and `scene/decorArt.tsx` draws, everything on the island that is not
a building. Both kinds are pure functions of the era and the levels, so a save always draws
the same island, and neither ever sits on a footprint (built or not — a plot stays clear for
its building), on the hub, or on a cell the path graph walks.

- **Wild** — pines, round trees, bushes, boulders, and crystals in `stellar`, on roughly half
  the free cells. An era opens as a wooded island with empty plots.
- **Growth** — the town a building gathers around itself: one item per level, plus one more
  at its maximum (`growthCount`), on the nearest free cells. Tents and fields in `tribe`,
  cottages in `viking`, gabled houses and gardens in `medieval`/`empire`, blocks from
  `industrial` on, pods and domes in the future eras (`ERA_DECOR`). An upgrade therefore
  changes the island, not just a sprite: the new neighbours spring up with it (`decor-grow`).

Decor is coloured only through CSS tokens — the era's materials, plus two ground tokens added
for it: `foliage` (trees, fields) and `path` (walkways, derived from `top`). Every drawing is
2–6 nodes; a fully built era stays under 610 nodes in total, inside the motion budget
([CITY_VISUALS_MOTION.md §5](CITY_VISUALS_MOTION.md)).

## 5. Water

- Base: era water colour at 100 % from `WATER_LINE` to the bottom edge, plus two gradients for
  distance — the sky's horizon stop hazing the far water, the deep tone gathering toward the
  viewer.
- Three wave bands, each a repeating sine path, scrolling horizontally at 6 / 9 / 13 s per
  cycle in alternating directions: fine and faint near the horizon, tallest in the foreground.
  Scroll by `translateX` on the group, by **exactly one wave period** (600 units) and with the
  path drawn wide enough to cover the frame at both ends, or the loop visibly jumps.
- Shoreline: two outset copies of the silhouette at half the island's depth for the shallows,
  and the foam — a short dashed white-at-25 % stroke — hugging the island's *lower* outline,
  where rock actually meets water, with its `stroke-dashoffset` animating over 7 s.
- Water sparkle: 12–20 tiny 2×2 diamonds at fixed positions, opacity looping 0 → 0.5 → 0 on
  staggered 3–5 s delays. Cheap, and it is most of what makes still water look alive.

## 6. Era styling

Each era supplies a `SceneTheme` — the single place colour lives, derived from the era's
content palette plus a small hand-tuned set:

```ts
interface SceneTheme {
  sky: [string, string];        // gradient stops, top → horizon
  water: { base: string; deep: string; wave: string; foam: string };
  ground: { top: string; cliff: string; wet: string; foliage: string; path: string };
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

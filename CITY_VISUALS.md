# CITY_VISUALS.md — the living city

How the city map becomes a place worth looking at: a denser, deeper, animated SVG scene
with drawn buildings and inhabitants, instead of the current pictogram badges pinned to a
flat backdrop.

This document is the index and the rationale. The detail lives in five chapters:

| Chapter | Covers |
|---|---|
| [CITY_VISUALS_SCENE.md](CITY_VISUALS_SCENE.md) | Coordinate system, layer stack, terrain, water, horizon, era palettes |
| [CITY_VISUALS_BUILDINGS.md](CITY_VISUALS_BUILDINGS.md) | Building art: isometric-lite construction, level states, plots, authoring format |
| [CITY_VISUALS_LIFE.md](CITY_VISUALS_LIFE.md) | Citizens, workers, boats, birds — the ambient life layer |
| [CITY_VISUALS_MOTION.md](CITY_VISUALS_MOTION.md) | The animation catalogue, the clock, reduced motion, the performance budget |
| [CITY_VISUALS_TECH.md](CITY_VISUALS_TECH.md) | File layout, data model and content migration, validation, phasing, testing |

## 1. Why

The city is the reward half of the app (SPEC §8). Right now it reads as a diagram: a pale
wash, one island outline, and 3–5 circular icon badges. Nothing moves, nothing is built,
nothing tells you at a glance what you can afford. A learner who has just earned 400 coins
has no reason to look at the map at all — the cards below it carry every piece of
information the map should have been carrying.

## 2. What "like Clash of Clans" means here, and what it does not

The reference is about **density, depth, legibility and reactivity**, not about art style.
Adopt:

- A real **isometric ground plane** with buildings standing on it, at varied scale.
- **Drawn buildings**, not icons in circles — a longhouse looks like a longhouse, and it
  visibly grows when upgraded.
- **Empty plots**: you can see where the next building will go before you own it.
- **Ambient life** — people moving, smoke, water, boats — so the scene is never fully still.
- **Reactivity**: what you can afford glows; what you just bought builds itself in.

Do not adopt: 3D rendering, bitmap/painted textures, gloss and bevels, cartoon-mascot
proportions, damage/combat feedback, timers, chest/loot framing, or any monetisation
vocabulary. The app's style stays SPEC §11: flat vector, woodcut wobble, limited palette,
no horned helmets.

## 3. Principles

1. **One place across ten eras.** The shoreline, the island silhouette and the camera never
   change (SPEC §11.5). Everything else is a layer on top of them.
2. **Flat, but deep.** Depth comes from stacked flat shapes, a fixed light direction and
   painter-ordered overlap — never from gradients, blurs or bevels.
3. **Calm motion.** The scene breathes; it does not perform. No animation demands attention
   unless the learner caused it.
4. **The map is a view, never the source of truth.** Every fact it shows (levels, costs,
   requirements) is also in the building cards below it, which stay the accessible and
   screen-reader-facing representation.
5. **Content JSON stays declarative.** Art is code in `src/components/city/art/**`, keyed by
   building id, exactly as `icons.tsx` is today. Content says what exists, not how it looks.
6. **Budget first.** Art is code-split per era and sized against a hard budget
   ([CITY_VISUALS_TECH.md §6](CITY_VISUALS_TECH.md)); a PWA that precaches content cannot
   ship an uncapped illustration set.

## 4. Two amendments to SPEC §11 this requires

Both are narrow, and both have landed in SPEC §11.5 and §11.6:

- **§11.5 "no gradients except the aurora celebration"** → allow *one* vertical sky gradient
  per era and one water-depth gradient, both two-stop and low contrast. The current
  `CityBackdrop` already ships the sky one; this makes the rule match reality and stops
  there. Buildings, terrain and figures stay flat-filled.
- **§11.6 Motion** → add the ambient layer (idle loops that run continuously at low
  amplitude) as a named category, with its own settings toggle, because §11.6 today only
  describes event-triggered motion.

## 5. Success criteria

- A learner can tell, without scrolling, which buildings they own, which are affordable now,
  and where the next one will stand.
- The scene reads as the same island in era 1 and era 10.
- 60 fps on a 2020-class mid-range Android; the map costs ≤ 4 ms of scripting per frame and
  stops entirely when off-screen or backgrounded.
- `prefers-reduced-motion` yields a still scene that is still complete and pretty.
- Total added weight ≤ 120 KB gzip across all ten eras, with only the viewed era loaded.

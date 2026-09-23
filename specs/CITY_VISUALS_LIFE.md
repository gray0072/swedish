# CITY_VISUALS_LIFE.md — inhabitants and ambient life

Part of [CITY_VISUALS.md](CITY_VISUALS.md). The layer that makes the difference between a
model of a city and a city.

## 1. Rules

1. **Life is earned.** An empty island has nobody on it. Population is a function of what
   has been built, so the learner's own progress is what fills the streets.
2. **Nobody is a control.** Figures are never clickable, never carry information, never
   block a building. They are scenery with a pulse.
3. **Small and few.** Figures are 14–18 world units tall (roughly a quarter of a level-1
   building) and strictly capped, both for looks and for frames.
4. **Nobody is a portrait.** Two shapes, no face, no hands. At this size a face becomes a
   smudge, and a crowd of smudges reads as noise.

## 2. The figure

- Body: one wobbled capsule in the era's clothing tone. Head: one circle, 5 units.
  Optional third shape: a hat, hood, basket, tool, or a hi-vis vest in the late eras.
- Two walk phases, swapped every 320 ms (a 2-frame cycle — deliberately woodcut, not smooth),
  plus a 1.5-unit vertical bob so the step lands.
- Facing is horizontal mirroring only. There is no back view; isometric-lite means we never
  owe one.
- **Costume by era** is the whole characterisation budget: cloak and staff (tribe), tunic and
  axe (viking), hooded robe (medieval), coat and hat (empire), flat cap (industrial), puffer
  jacket and a dog (modern), cargo bike (green), visor (connected), drysuit (floating),
  soft-suit (stellar). One silhouette per era, one colour variation of it per figure.

## 3. Movement

- Citizens walk the **path graph** from [CITY_VISUALS_SCENE.md §4](CITY_VISUALS_SCENE.md):
  nodes are built plots and quay ends, edges are drawn paths.
- Each citizen holds `{ edge, t, dir, speed }` and advances `t` by `speed · dt`. At a node it
  picks a random connected edge, never immediately reversing unless the node is a dead end.
  Speed 14–22 units/s, sampled per citizen so a group never marches in step.
- Pauses: at a node, 20 % chance of idling 1–3 s (bob only). Idling is what stops walk loops
  from looking mechanical.
- Depth: a citizen is inserted into the building sort by the `depth` of its current cell, so
  people pass behind and in front of buildings correctly.

## 4. Population

```
citizens = clamp(round(1.2 * ownedBuildings + 0.6 * totalLevels), 0, CAP)
CAP = 14 on desktop, 8 below 640 px, 0 under reduced motion
```

Population changes are not instant: new citizens fade in at a quay or the map edge over
600 ms. It should feel like the city grew, not like a number changed.

## 5. Workers

A **worker** is a citizen variant tied to a building rather than a path:

- Appears at a building's `workSpot` for 6 s after it is built or upgraded, then walks off
  into the path graph and becomes an ordinary citizen.
- Animation: a 2-frame tool swing, 500 ms, with three 3-unit chips flying on each strike.
- At most 2 workers at once; further purchases queue behind them.
- From the `connected` era on, the worker is replaced by a small drone doing the same job,
  which is also how the future eras stay legible as future without new mechanics.

## 6. Vessels

- One to three boats per era, on fixed closed spline routes across the water layer, 22–40 s
  per lap, with a wake: two short dashed arcs trailing the hull, opacity 30 %.
- Boat style follows the era's harbour building (longship, tall ship, electric ferry,
  submersible, shuttle). A boat only sails once the era's harbour-class building is built;
  before that the water is empty, which is itself information. Which building that is comes
  from `BuildingArt.harbour` — a property of the drawing (has it somewhere to moor?), so the
  scene never has to guess from an id. An era whose art declares no boat simply has none.
- Boats are drawn in layer 4, always behind the island, so they never need depth sorting.

## 7. Other ambient emitters

Each is opt-in per building via `ambient: [...]` in the art file, or per era via
`SceneTheme.ambient`:

| Emitter | Behaviour | Cost |
|---|---|---|
| `smoke` | 3 puffs rising 40 units over 4 s, drifting right, fading | 3 nodes |
| `birds` | 2–4 chevrons crossing the sky on a 25 s loop, once every ~40 s | 4 nodes |
| `flag` | 2-frame banner flap, 700 ms | 1 node |
| `waterwheel`/`rotor` | Continuous rotation, 3–6 s per turn | 1 node |
| `beacon` | A 6° light wedge sweeping 360° over 8 s at 12 % opacity | 1 node |
| `aurora` | The existing celebration gradient, at 20 % opacity, drifting over 18 s | 2 nodes |
| `snow`/`pollen`/`rain` | 20 particles falling on staggered loops, era-gated, off by default | 20 nodes |

Total ambient node budget: **≤ 60 nodes** across the whole scene. The emitter list is
sorted by priority and truncated, so adding an emitter to a building can never blow the
budget — it can only push a lower-priority one out.

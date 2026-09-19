# CITY_VISUALS_BUILDINGS.md — buildings

Part of [CITY_VISUALS.md](CITY_VISUALS.md). How a building is drawn, how it changes with
level, and how new art is authored.

## 1. From badge to building

Today every building is `BuildingIcon` in a 44 px circle. That stays — it is the right thing
in the card list, in achievements and in the SRS unlock toasts. On the map it is replaced by
drawn art, and the two never appear in the same place.

## 2. Anatomy of a building

Every building is one `<g>` built from the same six parts, in this order:

1. **Shadow** — a flat parallelogram matching the footprint, offset 6 units right / 3 down,
   fill `#000` at 9 %. No blur.
2. **Side plane** — the one offset plane from SPEC §11.5's "isometric-lite", on the right,
   filled with the base material darkened 12 %.
3. **Front plane** — the base material, flat.
4. **Roof** — its own tone, lightened 8 % on the left slope, darkened 6 % on the right.
5. **Detail** — doors, windows, timbering, rigging, signage: stroke-only, 2 units wide,
   `stroke-linecap="round"`, wobbled like the terrain.
6. **Props** — the things that say the building is *in use*: barrels, nets, a cart, drying
   fish, planted boxes. Props are what separate a model from a place.

Silhouette rule: a building must be recognisable as a black silhouette at 60 units tall. If
it is not, the shape is wrong and no amount of detail fixes it.

Size guide: 1×1 footprint → 40–70 units tall; 2×1 → up to 110; 2×2 (the era's landmark, one
per era) → up to 170, and it may break the tallest-thing-in-the-scene rule on purpose.

## 3. Materials

One token set per era, shared by every building in it, so an era reads as a single build
period:

```ts
interface MaterialTokens {
  wall: string; wallSide: string;    // side is wall darkened 12 %
  roof: string; roofSide: string;
  timber: string;                    // structural stroke
  trim: string;                      // doors, signage, gold leaf
  glass: string; glassLit: string;   // window fill, and the lit variant
}
```

A building may add at most **one** colour outside its era tokens, and only when the real
building is known for it (Stadshuset's gold, the Avicii Arena's white dome, a rune stone's
red-painted carving).

## 4. Level states

`maxLevel` is 1, 2 or 3 (`src/city/economy.ts`). Art must make the level legible from the
map alone, without reading the badge:

- **Level 0 — plot.** A dashed footprint outline in the era trim colour at 40 %, a small
  carved post sign, and flattened ground. Not empty space: an invitation.
- **Level 1 — built.** The base form. Modest, complete, in use.
- **Level 2 — extended.** Same silhouette family, more of it: an added wing or storey, one
  more prop cluster, a second chimney. Roughly +25 % mass.
- **Level 3 — landmark.** Ornament appears: a carved gable, a weathervane, banners, a lit
  sign. Roughly +50 % mass over level 1.

Single-level buildings (`maxLevel: 1`) jump from plot straight to their landmark form.

Levels are authored as **three separate symbols**, not as a scale transform. Growth by
scaling looks like a zoom; growth by redrawing looks like construction.

## 5. States the art must express

| State | Signal |
|---|---|
| Locked era | The whole scene is dimmed 35 % behind the lock copy; plots are not drawn |
| Requirement unmet | Plot drawn, outline solid grey, no pulse, post sign carries a chain glyph |
| Affordable now | Plot outline pulses gold, 2.4 s loop — see [CITY_VISUALS_MOTION.md §3](CITY_VISUALS_MOTION.md) |
| Just became affordable | One shimmer sweep across the plot, once, when coins cross the cost |
| Under construction | The 900 ms carve-in, stroke then fill (SPEC §11.6) |
| Upgraded | The new level's added mass carves in; the existing shape does not redraw |
| Max level | A small eight-petal Nordic star sits above the roof, static |

## 6. Authoring format

One file per building per era folder:

```
src/components/city/art/
  viking/
    longhouse.tsx
    harbour.tsx
    index.ts          // barrel: id -> BuildingArt, lazily imported per era
  shared/
    props.tsx         // barrels, carts, nets, trees, reeds
    primitives.tsx    // isoBox(), isoRoof(), wobble(), shadow()
```

```tsx
export const longhouse: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 62, render: (m) => <>…</> },   // level 1
    { height: 70, render: (m) => <>…</> },   // level 2
    { height: 78, render: (m) => <>…</> },   // level 3
  ],
  anchor: { dx: 0, dy: 0 },      // fine nudge in world units
  ambient: ['smoke'],            // ambient emitters this building owns
  workSpot: { dx: 18, dy: -4 },  // where a worker figure stands
};
```

`render` receives the era's `MaterialTokens` and returns plain SVG children drawn in a local
space whose origin is the footprint's front-bottom corner, y pointing up. The scene applies
the isometric transform; art files never do coordinate maths.

## 7. Interaction

- Hover / focus: the building group lifts 3 units and its shadow grows 8 % — 160 ms ease-out.
- Click / tap: a single expanding ring at the base, then the existing
  `scrollToBuilding()` behaviour.
- Keyboard: the hit layer is tab-ordered by depth (back to front, left to right), each target
  labelled `"<name> — level n of m"`, with a visible focus ring drawn on the hit layer.
- Long-press / hover ≥ 500 ms: a small label plate with name, level and next cost. The plate
  is drawn in the hit layer, always above, and flips side near the viewBox edge.

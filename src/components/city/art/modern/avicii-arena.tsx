import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { dome, shadow, windowGrid } from '../shared/primitives';

/**
 * Avicii Arena — opened as Globen in 1989, renamed in 2021 (SPEC §12.6): the world's largest
 * hemispherical building, an unmistakable white sphere. `maxLevel` is 1, so this is modern's
 * designated 2×2 landmark, jumping straight to landmark.
 *
 * The sphere's white panelling is this building's one colour outside `m` — modern's palette
 * is night-toned concrete and teal glass, but the real Globen is famously, specifically white
 * (CITY_VISUALS_BUILDINGS.md §3's own example).
 */
const WHITE = '#EDEFF0';

const W = 130;

function landmark(m: MaterialTokens) {
  const r = W * 0.42;
  const cy = r;
  return (
    <>
      {shadow(W, 30)}
      {dome(W / 2, cy, r, WHITE, m.wallSide)}
      {/* Panel seams — a few long arcs, since the real facade reads as ribbed segments. */}
      <path d={`M${W / 2 - r * 0.7} ${cy - r * 0.5} A${r} ${r} 0 0 1 ${W / 2 + r * 0.7} ${cy - r * 0.5}`} stroke={m.wallSide} strokeWidth={1} fill="none" opacity={0.5} />
      <path d={`M${W / 2 - r * 0.9} ${cy} A${r} ${r} 0 0 1 ${W / 2 + r * 0.9} ${cy}`} stroke={m.wallSide} strokeWidth={1} fill="none" opacity={0.4} />
      {/* A low entrance block at the sphere's base. */}
      {windowGrid({ x: W / 2 - 14, y: 0, w: 28, h: 8, cols: 4, rows: 1, size: 3.5, glass: m.glass, glassLit: m.glassLit, lit: [1, 2] })}
    </>
  );
}

export const aviciiArena: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [{ height: 116, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

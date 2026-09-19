import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';
import { planter } from '../shared/props';

/**
 * The urban farm — a guess: food grown inside the city instead of trucked into it (SPEC
 * §12.8). A glasshouse tower with stacked planted terraces along its front, mass-timber
 * framed. `maxLevel` is 2, going from a single greenhouse level to a taller stacked one.
 */

const W = 46;

function built(m: MaterialTokens) {
  const wallH = 30;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH - 4, cols: 3, rows: 3, size: 5, glass: m.glass })}
      {planter(W * 0.5, wallH + 2, W - 8, m.wallSide, m.roof)}
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH, 220, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 44;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH - 4, cols: 3, rows: 4, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [3, 6] })}
      {/* Landmark: three planted terraces at increasing height — the busier, fuller farm. */}
      {planter(W * 0.5, wallH + 2, W - 8, m.wallSide, m.roof)}
      {planter(W * 0.5, wallH * 0.66, W - 10, m.wallSide, m.roof)}
      {planter(W * 0.5, wallH * 0.33, W - 12, m.wallSide, m.roof)}
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH, 220, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

export const verticalFarm: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 42, render: built },
    { height: 56, render: landmark },
  ],
  workSpot: { dx: W + 12, dy: 4 },
};

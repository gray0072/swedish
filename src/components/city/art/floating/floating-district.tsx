import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The floating quarter — a guess: a city that always stood on the water starts living on it
 * too (SPEC §12.8). A pontoon platform carrying a cluster of small floating houses linked by
 * walkways, rather than one tall building — floating's higher waterline means the platform
 * itself sits low, level with the water (CITY_VISUALS_SCENE.md §6). Floating's designated
 * 2×2 landmark.
 */

const W = 116;

function pontoonHouse(x: number, w: number, h: number, m: MaterialTokens, seed: number) {
  return (
    <g>
      {isoBox({ x, y: 4, w, h, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: x - 2, y: h + 4, w: w + 4, rise: h * 0.5, depth: 8, roof: m.roof, roofSide: m.roofSide })}
      {windowGrid({ x: x + 2, y: 8, w: w - 4, h: h - 6, cols: 2, rows: 1, size: 4, glass: m.glass, glassLit: m.glassLit, lit: [seed % 2] })}
    </g>
  );
}

function pontoon(w: number, wall: string, wallSide: string) {
  return isoBox({ x: -6, y: 0, w: w + 12, h: 5, depth: 6, wall: wallSide, wallSide: wall });
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 26)}
      {pontoon(W * 0.6, m.wall, m.wallSide)}
      {pontoonHouse(6, 30, 20, m, 1)}
      <path d={wobbleLine(0, 5, W * 0.6, 5, 281, 0.3)} stroke={m.timber} strokeWidth={1} opacity={0.5} />
    </>
  );
}

function extended(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 26)}
      {pontoon(W * 0.85, m.wall, m.wallSide)}
      {pontoonHouse(6, 30, 20, m, 1)}
      {pontoonHouse(48, 26, 22, m, 2)}
      {/* Extended: a walkway connecting the two houses, +25% mass (§4). */}
      <path d={wobbleLine(36, 8, 48, 8, 282, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
      <path d={wobbleLine(0, 5, W * 0.85, 5, 281, 0.3)} stroke={m.timber} strokeWidth={1} opacity={0.5} />
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 26)}
      {pontoon(W, m.wall, m.wallSide)}
      {pontoonHouse(6, 30, 20, m, 1)}
      {pontoonHouse(48, 26, 22, m, 2)}
      {/* Landmark: a third, taller house and a rooftop mast with a solar-and-signal cluster. */}
      {pontoonHouse(84, 24, 26, m, 3)}
      <path d={wobbleLine(96, 30, 96, 42, 283, 0.2)} stroke={m.trim} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={96} cy={44} r={2.4} fill={m.trim} />
      <path d={wobbleLine(36, 8, 48, 8, 282, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
      <path d={wobbleLine(74, 10, 84, 8, 284, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
      <path d={wobbleLine(0, 5, W, 5, 281, 0.3)} stroke={m.timber} strokeWidth={1} opacity={0.5} />
    </>
  );
}

export const floatingDistrict: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [
    { height: 46, render: built },
    { height: 50, render: extended },
    { height: 60, render: landmark },
  ],
  workSpot: { dx: W * 0.5, dy: 6 },
};

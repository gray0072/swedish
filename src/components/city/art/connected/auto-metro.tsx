import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The driverless metro — a guess: the announcements stay the same, you still have to
 * understand them (SPEC §12.8). A minimalist glass canopy over a platform entrance, no
 * driver's cab in sight, with a lit accent strip instead of a signboard. `maxLevel` is 2.
 */

const W = 84; // 2x1 footprint

function built(m: MaterialTokens) {
  const wallH = 18;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH - 4, cols: 6, rows: 1, size: 5, glass: m.glass })}
      <rect x={-2} y={wallH} width={W + 4} height={2} fill={m.trim} />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 20;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH - 4, cols: 6, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [1, 2, 4] })}
      <rect x={-2} y={wallH} width={W + 4} height={2} fill={m.trim} />
      {/* Landmark: a slim overhead canopy, unmanned — the "no driver's cab" cue. */}
      <path d={wobbleLine(0, wallH + 6, W, wallH + 4, 251, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.5, wallH, W * 0.5, wallH + 5, 252, 0.2)} stroke={m.timber} strokeWidth={1.4} strokeLinecap="round" />
    </>
  );
}

export const autoMetro: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 30, render: built },
    { height: 34, render: landmark },
  ],
  ambient: ['rotor'],
  workSpot: { dx: W * 0.4, dy: 4 },
};

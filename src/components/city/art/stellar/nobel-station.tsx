import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The Nobel station — the Nobel Prize has been awarded since 1901; where it gets awarded
 * next is fiction (SPEC §12.8). A ceremonial glass hall, echoing the empire era's palace
 * symmetry but in stellar's night-glass vocabulary. `maxLevel` is 2.
 */

const W = 92; // 2x1 footprint

function built(m: MaterialTokens) {
  const wallH = 34;
  return (
    <>
      {shadow(W, 14)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 12, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: W * 0.08, y: wallH * 0.2, w: W * 0.84, h: wallH * 0.5, cols: 6, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [1, 4] })}
      <path d={wobbleLine(W * 0.44, 0, W * 0.44, wallH * 0.4, 341, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.56, 0, W * 0.56, wallH * 0.4, 342, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 38;
  return (
    <>
      {shadow(W, 14)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 12, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: W * 0.08, y: wallH * 0.2, w: W * 0.84, h: wallH * 0.5, cols: 6, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [0, 1, 3, 4] })}
      <path d={wobbleLine(W * 0.44, 0, W * 0.44, wallH * 0.4, 341, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.56, 0, W * 0.56, wallH * 0.4, 342, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* Landmark: a laurel-style trim band above the entrance, the ceremony's one ornament. */}
      <path d={wobbleLine(W * 0.3, wallH * 0.42, W * 0.7, wallH * 0.42, 343, 0.4)} stroke={m.trim} strokeWidth={1.6} fill="none" />
    </>
  );
}

export const nobelStation: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 48, render: built },
    { height: 52, render: landmark },
  ],
  workSpot: { dx: W * 0.5, dy: 6 },
};

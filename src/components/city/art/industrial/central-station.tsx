import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * Central Station — opened in 1871 (SPEC §12.6): a brick facade with a tall arched central
 * window and a train shed roof behind it. `maxLevel` is 2, going from the plain facade to a
 * busier station with a clock and a lit sign.
 */

const W = 96; // 2x1 footprint

function built(m: MaterialTokens) {
  const wallH = 34;
  return (
    <>
      {shadow(W, 14)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 12, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -2, y: wallH, w: W + 4, rise: 14, depth: 12, roof: m.roof, roofSide: m.roofSide })}
      {/* The tall arched centre window — the facade's defining feature. */}
      <path d={`M${W * 0.4} 0 L${W * 0.4} ${wallH * 0.5} A${W * 0.1} ${W * 0.1} 0 0 0 ${W * 0.6} ${wallH * 0.5} L${W * 0.6} 0 Z`} fill={m.glass} />
      {windowGrid({ x: W * 0.06, y: wallH * 0.18, w: W * 0.26, h: wallH * 0.4, cols: 2, rows: 1, size: 5, glass: m.glass })}
      {windowGrid({ x: W * 0.68, y: wallH * 0.18, w: W * 0.26, h: wallH * 0.4, cols: 2, rows: 1, size: 5, glass: m.glass })}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 36;
  return (
    <>
      {shadow(W, 14)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 12, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -2, y: wallH, w: W + 4, rise: 15, depth: 12, roof: m.roof, roofSide: m.roofSide })}
      <path d={`M${W * 0.4} 0 L${W * 0.4} ${wallH * 0.5} A${W * 0.1} ${W * 0.1} 0 0 0 ${W * 0.6} ${wallH * 0.5} L${W * 0.6} 0 Z`} fill={m.glassLit} />
      {windowGrid({ x: W * 0.06, y: wallH * 0.18, w: W * 0.26, h: wallH * 0.4, cols: 2, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [0, 1] })}
      {windowGrid({ x: W * 0.68, y: wallH * 0.18, w: W * 0.26, h: wallH * 0.4, cols: 2, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [1] })}
      {/* Landmark: a station clock above the arch, and a lit signboard by the entrance. */}
      <circle cx={W * 0.5} cy={wallH + 8} r={6} fill="none" stroke={m.trim} strokeWidth={1.6} />
      <path d={wobbleLine(W * 0.5, wallH + 8, W * 0.5, wallH + 4, 151, 0.2)} stroke={m.trim} strokeWidth={1.2} strokeLinecap="round" />
      <rect x={W * 0.05} y={wallH * 0.7} width={10} height={5} fill={m.glassLit} />
    </>
  );
}

export const centralStation: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 48, render: built },
    { height: 51, render: landmark },
  ],
  ambient: ['smoke'],
  workSpot: { dx: W * 0.85, dy: 6 },
};

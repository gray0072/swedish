import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';
import { planter } from '../shared/props';

/**
 * The electric ferry — commuter electric ferries already run on Stockholm's water; here the
 * whole fleet has followed (SPEC §12.8, a plausible near-term extrapolation, not invention).
 * A small charging quay with a moored ferry of its own, mirroring how the viking harbour and
 * empire shipyard are drawn — this is green's harbour-class building, so the ambient boat on
 * the water only sails once it exists. `maxLevel` is 2.
 */

const W = 88; // 2x1 footprint

function quay(w: number, wall: string, wallSide: string) {
  return isoBox({ x: 0, y: 0, w, h: 7, depth: 4, wall, wallSide });
}

/** A battery ferry: pale hull with the era's stripe, a glazed cabin, solar panels on top. */
function ferry(cx: number, w: number, m: MaterialTokens) {
  const y0 = 3;
  return (
    <g>
      <polygon points={`${cx - w / 2},${y0 + 7} ${cx + w / 2},${y0 + 7} ${cx + w / 2 - 5},${y0} ${cx - w / 2 + 3},${y0}`} fill={m.glass} />
      <rect x={cx - w / 2 + 2} y={y0 + 3} width={w - 6} height={1.6} fill={m.trim} />
      <rect x={cx - w * 0.3} y={y0 + 7} width={w * 0.6} height={8} rx={1.5} fill={m.glass} />
      {windowGrid({ x: cx - w * 0.28, y: y0 + 8.5, w: w * 0.56, h: 5, cols: 5, rows: 1, size: 3.4, glass: m.wallSide, glassLit: m.glassLit, lit: [1, 3] })}
      <rect x={cx - w * 0.34} y={y0 + 15} width={w * 0.68} height={2.4} fill={m.timber} />
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 12)}
      {quay(W * 0.5, m.wall, m.wallSide)}
      <path d={wobbleLine(4, 7, 4, 18, 231, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* A ticket kiosk with a planted roof. */}
      {isoBox({ x: 8, y: 7, w: 12, h: 10, depth: 4, wall: m.wall, wallSide: m.wallSide })}
      <rect x={7} y={17} width={14} height={3} fill={m.roof} />
      {ferry(W * 0.72, 40, m)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 10, 12)}
      {quay(W, m.wall, m.wallSide)}
      {/* Landmark: a timber terminal with a planted roof, and a charging arm reaching over the
          ferry — plausible for an all-electric fleet. */}
      {isoBox({ x: 4, y: 7, w: 34, h: 18, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 6, y: 10, w: 30, h: 10, cols: 4, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [0, 2] })}
      <polygon points="1,25 41,25 44,32 4,32" fill={m.roof} />
      {planter(14, 31, 10, m.roof, m.trim)}
      {planter(30, 31, 10, m.roof, m.trim)}
      <path d={wobbleLine(W - 6, 7, W - 6, 40, 232, 0.2)} stroke={m.timber} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <path d={`M${W - 6} 40 L${W - 24} 36 L${W - 24} 28`} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <rect x={W - 29} y={25} width={10} height={3} rx={1} fill={m.trim} />
      {ferry(W * 0.72, 44, m)}
    </>
  );
}

export const electricFerry: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 26, render: built },
    { height: 46, render: landmark },
  ],
  workSpot: { dx: W * 0.8, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The data harbour — a harbour that handles data instead of silver; the servers heat the
 * neighbourhood (SPEC §12.8). A quay-side warehouse of glass-fronted server racks instead of
 * cargo, with heat-exchange pipes running to the water. This is connected's harbour-class
 * building — no ship moors here, since it carries data, not goods. `maxLevel` is 2.
 */

const W = 90; // 2x1 footprint

function racks(x: number, y: number, w: number, h: number, glass: string, glassLit: string, lit: number[]) {
  return windowGrid({ x, y, w, h, cols: 8, rows: 2, size: 3.5, glass, glassLit, lit });
}

function built(m: MaterialTokens) {
  const wallH = 26;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {racks(3, 3, W - 6, wallH - 6, m.glass, m.glassLit, [2, 9])}
      {/* Heat-exchange pipe running down to the waterline. */}
      <path d={wobbleLine(W - 6, 0, W - 6, -6, 261, 0.2)} stroke={m.trim} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 30;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {racks(3, 3, W - 6, wallH - 6, m.glass, m.glassLit, [1, 4, 8, 11, 14])}
      <path d={wobbleLine(W - 6, 0, W - 6, -6, 261, 0.2)} stroke={m.trim} strokeWidth={2} strokeLinecap="round" />
      {/* Landmark: a second pipe and a rooftop vent stack, the busier data-heat exchange. */}
      <path d={wobbleLine(W - 16, 0, W - 16, -5, 262, 0.2)} stroke={m.trim} strokeWidth={1.6} strokeLinecap="round" />
      <rect x={4} y={wallH} width={8} height={5} fill={m.roof} />
    </>
  );
}

export const dataHarbour: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 32, render: built },
    { height: 36, render: landmark },
  ],
  workSpot: { dx: W * 0.5, dy: 4 },
};

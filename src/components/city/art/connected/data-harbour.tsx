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

/** A lattice mast with a lamp at the top. */
function mast(x: number, h: number, m: MaterialTokens) {
  return (
    <g stroke={m.timber} strokeWidth={1.2} fill="none">
      <path d={`M${x - 3} 0 L${x} ${h} L${x + 3} 0`} />
      <path d={`M${x - 2.2} ${h * 0.25} L${x + 2.2} ${h * 0.25} M${x - 1.4} ${h * 0.5} L${x + 1.4} ${h * 0.5}`} />
      <circle cx={x} cy={h + 1.5} r={2} fill={m.trim} stroke="none" />
    </g>
  );
}

/** A rooftop cooler: a box with a fan ring on top. */
function cooler(x: number, y: number, m: MaterialTokens) {
  return (
    <g>
      <rect x={x} y={y} width={14} height={8} fill={m.wallSide} />
      <ellipse cx={x + 7} cy={y + 8} rx={6} ry={2} fill={m.timber} />
      <path d={`M${x + 2} ${y + 8} L${x + 12} ${y + 8}`} stroke={m.trim} strokeWidth={0.8} />
    </g>
  );
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
      {mast(W * 0.2, wallH + 18, m)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 30;
  return (
    <>
      {shadow(W + 10, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {racks(3, 3, W - 6, wallH - 6, m.glass, m.glassLit, [1, 4, 8, 11, 14])}
      <path d={wobbleLine(W - 6, 0, W - 6, -6, 261, 0.2)} stroke={m.trim} strokeWidth={2} strokeLinecap="round" />
      {/* Landmark: a row of coolers on the roof, a dish and a taller mast, and a lit heat main
          arching off to warm the neighbourhood — the busier data-heat exchange. */}
      {cooler(W * 0.36, wallH, m)}
      {cooler(W * 0.54, wallH, m)}
      {mast(W * 0.15, wallH + 30, m)}
      <path d={`M${W * 0.82} ${wallH} L${W * 0.82} ${wallH + 8}`} stroke={m.timber} strokeWidth={1.6} />
      <path d={`M${W * 0.82 - 9} ${wallH + 18} Q${W * 0.82 - 4} ${wallH + 6} ${W * 0.82 + 8} ${wallH + 10} Z`} fill={m.glass} />
      <path d={`M${W} 6 Q${W + 14} 22 ${W + 24} 4`} stroke={m.trim} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </>
  );
}

export const dataHarbour: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 46, render: built },
    { height: 62, render: landmark },
  ],
  workSpot: { dx: W * 0.5, dy: 4 },
};

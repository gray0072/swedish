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

/** The glazed train shed behind the hall: an iron-ribbed glass vault over the platforms. */
function trainShed(x: number, w: number, m: MaterialTokens) {
  const base = 6;
  const r = 22;
  return (
    <g>
      <rect x={x} y={base} width={w} height={14} fill={m.wallSide} />
      <path d={`M${x} ${base + 14} Q${x + w / 2} ${base + 14 + r * 1.3} ${x + w} ${base + 14} Z`} fill={m.glass} />
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <path key={t} d={`M${x + w * t} ${base + 14} L${x + w * t} ${base + 14 + r * 1.3 * (1 - Math.pow(2 * t - 1, 2)) * 0.5}`} stroke={m.roof} strokeWidth={1} />
      ))}
      <path d={`M${x} ${base + 14} Q${x + w / 2} ${base + 14 + r * 1.3} ${x + w} ${base + 14}`} stroke={m.roof} strokeWidth={1.8} fill="none" />
    </g>
  );
}

/** A small steam locomotive standing at the platform. */
function locomotive(x: number, m: MaterialTokens) {
  return (
    <g>
      <rect x={x} y={3} width={26} height={9} rx={2} fill={m.roof} />
      <rect x={x + 18} y={3} width={10} height={15} fill={m.roof} />
      <rect x={x + 20} y={12} width={5} height={4} fill={m.glassLit} />
      <rect x={x + 4} y={12} width={4} height={8} fill={m.roof} />
      <rect x={x + 3} y={19} width={6} height={2} fill={m.timber} />
      {[x + 5, x + 13, x + 22].map((cx) => (
        <circle key={cx} cx={cx} cy={3} r={3} fill={m.timber} stroke={m.trim} strokeWidth={0.8} />
      ))}
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 36;
  return (
    <>
      {shadow(W + 40, 14)}
      {/* Landmark: the glazed train shed and a locomotive at the platform — the station is
          running — and a clock turret over the arch. */}
      {trainShed(W * 0.62, 60, m)}
      {locomotive(W + 2, m)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 12, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -2, y: wallH, w: W + 4, rise: 15, depth: 12, roof: m.roof, roofSide: m.roofSide })}
      <path d={`M${W * 0.4} 0 L${W * 0.4} ${wallH * 0.5} A${W * 0.1} ${W * 0.1} 0 0 0 ${W * 0.6} ${wallH * 0.5} L${W * 0.6} 0 Z`} fill={m.glassLit} />
      {windowGrid({ x: W * 0.06, y: wallH * 0.18, w: W * 0.26, h: wallH * 0.4, cols: 2, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [0, 1] })}
      {windowGrid({ x: W * 0.68, y: wallH * 0.18, w: W * 0.26, h: wallH * 0.4, cols: 2, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [1] })}
      <rect x={W * 0.5 - 8} y={wallH + 6} width={16} height={16} fill={m.wall} />
      <polygon points={`${W * 0.5 - 10},${wallH + 22} ${W * 0.5},${wallH + 32} ${W * 0.5 + 10},${wallH + 22}`} fill={m.roof} />
      <circle cx={W * 0.5} cy={wallH + 14} r={5.5} fill={m.glass} stroke={m.trim} strokeWidth={1.4} />
      <path d={wobbleLine(W * 0.5, wallH + 14, W * 0.5, wallH + 18, 151, 0.2)} stroke={m.timber} strokeWidth={1.2} strokeLinecap="round" />
      <path d={wobbleLine(W * 0.5, wallH + 14, W * 0.5 + 3, wallH + 14, 152, 0.2)} stroke={m.timber} strokeWidth={1.2} strokeLinecap="round" />
      <rect x={W * 0.05} y={wallH * 0.7} width={10} height={5} fill={m.glassLit} />
    </>
  );
}

export const centralStation: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 48, render: built },
    { height: 68, render: landmark },
  ],
  ambient: ['smoke'],
  workSpot: { dx: W * 0.85, dy: 6 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';
import { barrel } from '../shared/props';

/**
 * The shipyard — where the warship Vasa was built (SPEC §12.6). A timber-ribbed hull under
 * construction on the slipway, with an A-frame gantry crane; `maxLevel` is 2, going from a
 * bare frame to a busier yard with the crane in use.
 */

const W = 90; // 2x1 footprint

/** The hull's side profile above the slipway: low bow on the left, high stern on the right. */
function hullProfile(x0: number, w: number): string {
  return `M${x0} 14 Q${x0 + w * 0.08} 4 ${x0 + w * 0.3} 4 L${x0 + w * 0.82} 4 Q${x0 + w} 6 ${x0 + w} 34 L${x0 + w * 0.78} 30 L${x0 + w * 0.2} 26 Z`;
}

/** Slipway: a timber ramp running down to the water's edge. */
function slipway(m: MaterialTokens) {
  return <polygon points={`-6,0 ${W * 0.78},0 ${W * 0.74},4 -2,4`} fill={m.wallSide} />;
}

/** Open frames — the ribs of a hull with no planking yet. */
function ribs(x0: number, w: number, m: MaterialTokens) {
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    const t = 0.12 + i * 0.13;
    const x = x0 + w * t;
    const top = 26 + t * 6;
    out.push(
      <path key={i} d={`M${x} 4 Q${x - 3} ${top * 0.5} ${x} ${top}`} stroke={m.timber} strokeWidth={1.8} strokeLinecap="round" fill="none" />,
    );
  }
  return (
    <>
      <path d={`M${x0 + w * 0.06} 5 L${x0 + w * 0.96} 5`} stroke={m.timber} strokeWidth={2.6} strokeLinecap="round" />
      {out}
      <path d={`M${x0 + w * 0.12} 26 Q${x0 + w * 0.6} 28 ${x0 + w * 0.94} 32`} stroke={m.timber} strokeWidth={1.4} fill="none" />
    </>
  );
}

function shed(m: MaterialTokens) {
  return (
    <g>
      {isoBox({ x: -24, y: 0, w: 22, h: 14, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -26, y: 14, w: 26, rise: 10, depth: 6, roof: m.roof, roofSide: m.roofSide })}
      {/* Stacked oak, waiting to become planks. */}
      <rect x={-22} y={-1} width={18} height={3} rx={1.5} fill={m.timber} transform="translate(0 -3)" />
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 12)}
      {slipway(m)}
      {shed(m)}
      {ribs(6, W * 0.66, m)}
      {barrel(W * 0.86, 0, m.timber)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const x0 = 6;
  const w = W * 0.66;
  const craneX = W * 0.92;
  return (
    <>
      {shadow(W + 10, 12)}
      {slipway(m)}
      {shed(m)}
      {/* Landmark: the hull is planked and gun ports are cut — the ship is nearly done. */}
      <path d={hullProfile(x0, w)} fill={m.timber} />
      {[12, 18, 24].map((y) => (
        <path key={y} d={`M${x0 + w * 0.12} ${y} Q${x0 + w * 0.6} ${y + 1} ${x0 + w * 0.95} ${y + 4}`} stroke={m.wallSide} strokeWidth={0.8} fill="none" opacity={0.6} />
      ))}
      {[0.32, 0.46, 0.6, 0.74].map((t) => (
        <rect key={t} x={x0 + w * t} y={15} width={4} height={3.5} fill={m.trim} />
      ))}
      {/* A tall treadwheel crane over the stern, hoisting the next timber. */}
      <path d={wobbleLine(craneX - 12, 0, craneX, 56, 121, 0.3)} stroke={m.timber} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(craneX + 12, 0, craneX, 56, 122, 0.3)} stroke={m.timber} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d={`M${craneX} 56 L${craneX - 22} 50`} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
      <path d={`M${craneX - 21} 50 L${craneX - 21} 38`} stroke={m.trim} strokeWidth={1.2} />
      <rect x={craneX - 28} y={35} width={14} height={3} fill={m.wallSide} />
      <circle cx={craneX} cy={10} r={7} fill="none" stroke={m.timber} strokeWidth={1.8} />
      <path d={`M${craneX} 56 L${craneX} 64`} stroke={m.timber} strokeWidth={1.4} />
      <path d={`M${craneX} 64 L${craneX + 9} 61 L${craneX} 58 Z`} fill={m.trim} />
    </>
  );
}

export const shipyard: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 36, render: built },
    { height: 64, render: landmark },
  ],
  workSpot: { dx: W * 0.45, dy: 6 },
};

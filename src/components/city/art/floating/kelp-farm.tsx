import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';

/**
 * The kelp farm — a guess: the Baltic feeds the city with more than fish (SPEC §12.8). A low
 * floating raft with buoy lines trailing kelp fronds, deliberately near-flat: a farm on the
 * water reads as a raft and a scatter of lines, not a tall building. `maxLevel` is 2.
 */

const W = 88; // 2x1 footprint

/** A buoy line: floats on the surface, kelp fronds standing up in the current. */
function kelpLine(x: number, w: number, m: MaterialTokens, seed: number) {
  return (
    <g>
      <path d={wobbleLine(x, 2, x + w, 2, seed, 0.3)} stroke={m.timber} strokeWidth={1} opacity={0.7} />
      {[0.12, 0.32, 0.52, 0.72, 0.92].map((t, i) => (
        <path
          key={i}
          d={`M${x + w * t} 2 Q${x + w * t - 4} ${8 + (i % 2) * 3} ${x + w * t + 1} ${12 + (i % 3) * 3}`}
          stroke={m.roof}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {[0, 0.5, 1].map((t) => (
        <circle key={t} cx={x + w * t} cy={2.5} r={2.4} fill={m.trim} />
      ))}
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W * 0.3, h: 5, depth: 4, wall: m.wall, wallSide: m.wallSide })}
      {isoBox({ x: 4, y: 5, w: 12, h: 9, depth: 4, wall: m.wall, wallSide: m.wallSide })}
      <rect x={3} y={14} width={14} height={2.5} fill={m.roof} />
      {kelpLine(W * 0.34, W * 0.6, m, 301)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 6, 10)}
      {/* Landmark: a processing hut on a bigger raft, racks of kelp drying in the wind, and a
          second line out on the water. */}
      {kelpLine(W * 0.42, W * 0.58, m, 310)}
      {isoBox({ x: 0, y: 0, w: W * 0.45, h: 6, depth: 5, wall: m.wall, wallSide: m.wallSide })}
      {isoBox({ x: 3, y: 6, w: 22, h: 16, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: 1, y: 22, w: 26, rise: 9, depth: 6, roof: m.roof, roofSide: m.roofSide })}
      <rect x={8} y={11} width={5} height={5} fill={m.glassLit} />
      {[30, 36].map((x) => (
        <g key={x}>
          <path d={`M${x} 6 L${x} 22`} stroke={m.timber} strokeWidth={1.4} />
          {[10, 14, 18].map((y) => (
            <path key={y} d={`M${x - 2.5} ${y + 3} L${x} ${y} L${x + 2.5} ${y + 3}`} stroke={m.roof} strokeWidth={1.6} fill="none" />
          ))}
        </g>
      ))}
      {kelpLine(W * 0.55, W * 0.45, m, 305)}
    </>
  );
}

export const kelpFarm: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 22, render: built },
    { height: 36, render: landmark },
  ],
  workSpot: { dx: W * 0.4, dy: 2 },
};

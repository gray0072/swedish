import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';

/**
 * The kelp farm — a guess: the Baltic feeds the city with more than fish (SPEC §12.8). A low
 * floating raft with buoy lines trailing kelp fronds, deliberately near-flat: a farm on the
 * water reads as a raft and a scatter of lines, not a tall building. `maxLevel` is 2.
 */

const W = 88; // 2x1 footprint

function kelpLine(x: number, w: number, timber: string, roof: string, seed: number) {
  return (
    <g>
      <path d={wobbleLine(x, 2, x + w, 2, seed, 0.3)} stroke={timber} strokeWidth={1} opacity={0.6} />
      {[0.2, 0.5, 0.8].map((t, i) => (
        <path key={i} d={wobbleLine(x + w * t, 2, x + w * t, -6, seed + i + 1, 0.4)} stroke={roof} strokeWidth={2} strokeLinecap="round" />
      ))}
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W * 0.3, h: 5, depth: 4, wall: m.wall, wallSide: m.wallSide })}
      {kelpLine(W * 0.32, W * 0.6, m.timber, m.roof, 301)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W * 0.3, h: 6, depth: 4, wall: m.wall, wallSide: m.wallSide })}
      {/* Landmark: a second raft and two working lines instead of one. */}
      {isoBox({ x: W * 0.34, y: 0, w: W * 0.18, h: 5, depth: 4, wall: m.wallSide, wallSide: m.wall })}
      {kelpLine(W * 0.55, W * 0.42, m.timber, m.roof, 305)}
      {kelpLine(W * 0.32, W * 0.2, m.timber, m.roof, 310)}
      <circle cx={W * 0.12} cy={4} r={2} fill={m.trim} />
    </>
  );
}

export const kelpFarm: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 20, render: built },
    { height: 24, render: landmark },
  ],
  workSpot: { dx: W * 0.4, dy: 2 },
};

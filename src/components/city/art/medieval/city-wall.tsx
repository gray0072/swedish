import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';

/**
 * City wall — Stockholm is first mentioned in writing in 1252 (SPEC §12.6), the year
 * conventionally tied to Birger Jarl fortifying the settlement. A run of crenellated wall
 * with a squat gate tower; `maxLevel` is 2, so it goes straight from built to landmark (§4).
 */

const W = 84; // 2x1 footprint

function crenellations(x: number, y: number, w: number, count: number, fill: string) {
  const teeth = [];
  const toothW = w / count / 2;
  for (let i = 0; i < count; i += 1) {
    teeth.push(<rect key={`t-${i}`} x={x + i * (toothW * 2) + toothW / 2} y={y} width={toothW} height={5} fill={fill} />);
  }
  return teeth;
}

function built(m: MaterialTokens) {
  const wallH = 26;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {crenellations(2, wallH, W - 4, 6, m.wall)}
      <path d={wobbleLine(W * 0.4, 0, W * 0.4, wallH * 0.6, 71, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 28;
  const towerH = 42;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W * 0.62, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {crenellations(2, wallH, W * 0.62 - 4, 4, m.wall)}
      {/* Landmark: a gate tower anchoring the wall run, with its own crenellated top. */}
      {isoBox({ x: W * 0.62, y: 0, w: W * 0.38, h: towerH, depth: 10, wall: m.wallSide, wallSide: m.wall })}
      {crenellations(W * 0.62 + 2, towerH, W * 0.38 - 4, 3, m.wallSide)}
      {/* The gate arch through the tower's base. */}
      <path d={wobbleLine(W * 0.78, 0, W * 0.78, towerH * 0.4, 72, 0.2)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.4, 0, W * 0.4, wallH * 0.6, 71, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* A raised banner on the tower — a garrisoned wall, not a ruin. */}
      <path d={wobbleLine(W * 0.9, towerH, W * 0.9, towerH + 12, 73, 0.2)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" />
      <polygon points={`${W * 0.9},${towerH + 12} ${W * 0.9 + 9},${towerH + 10} ${W * 0.9},${towerH + 7}`} fill={m.trim} />
    </>
  );
}

export const cityWall: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 34, render: built },
    { height: 56, render: landmark },
  ],
  ambient: ['flag'],
  workSpot: { dx: W * 0.85, dy: 6 },
};

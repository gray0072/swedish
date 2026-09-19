import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';
import { boatElectric } from '../shared/figures';

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

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 12)}
      {quay(W * 0.55, m.wall, m.wallSide)}
      <path d={wobbleLine(4, 7, 4, 18, 231, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {boatElectric({ x: W * 0.5, y: 9, w: 30, hull: m.wallSide })}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 12)}
      {quay(W, m.wall, m.wallSide)}
      {/* Landmark: a charging pylon on the quay, plausible for an all-electric fleet. */}
      <path d={wobbleLine(W - 8, 7, W - 8, 24, 232, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <rect x={W - 12} y={20} width={8} height={5} rx={1} fill={m.trim} />
      <path d={wobbleLine(4, 7, 4, 18, 231, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {boatElectric({ x: W * 0.45, y: 9, w: 38, hull: m.wallSide })}
    </>
  );
}

export const electricFerry: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 30, render: built },
    { height: 34, render: landmark },
  ],
  workSpot: { dx: W * 0.8, dy: 4 },
};

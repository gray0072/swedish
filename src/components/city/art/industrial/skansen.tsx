import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';
import { tree } from '../shared/props';

/**
 * Skansen — the world's first open-air museum, founded in 1891 (SPEC §12.6): a small cluster
 * of relocated historic farmhouses set among trees, not one building but a grouping of them.
 * `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 48;

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 10)}
      {/* Two small red cottages, echoing the tribe/viking timber vocabulary this museum
          preserves, deliberately smaller than a real 1x1 building would otherwise be. */}
      {isoBox({ x: 0, y: 0, w: 18, h: 14, depth: 5, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -1, y: 14, w: 20, rise: 10, depth: 5, roof: m.roof, roofSide: m.roofSide })}
      {isoBox({ x: 24, y: 0, w: 16, h: 12, depth: 5, wall: m.wallSide, wallSide: m.wall })}
      {isoRoof({ x: 23, y: 12, w: 18, rise: 8, depth: 5, roof: m.roofSide, roofSide: m.roof })}
      {tree(46, 0, 22, m.timber, m.roof)}
      <path d={wobbleLine(6, 0, 6, 9, 161, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

export const skansen: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 42, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { dome, isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The space school — Swedish is still being taught; that is the one part of this you can
 * count on (SPEC §12.8). A small domed classroom pod, deliberately modest next to the
 * beacon and the launch pad — the point of this building is continuity, not spectacle.
 * `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 42;

function landmark(m: MaterialTokens) {
  const wallH = 20;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH - 4, cols: 3, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [0, 2] })}
      {dome(W * 0.5, wallH, 10, m.glass, m.wallSide)}
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH * 0.4, 361, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

export const spaceSchool: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 32, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

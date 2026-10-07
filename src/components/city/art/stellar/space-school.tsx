import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { dome, isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The space school — Swedish is still being taught; that is the one part of this you can
 * count on (SPEC §12.8). A classroom block with an observatory on the roof, deliberately
 * modest next to the beacon and the launch pad — the point of this building is continuity,
 * not spectacle. `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 56;

function landmark(m: MaterialTokens) {
  const wallH = 24;
  const obsX = W * 0.72;
  return (
    <>
      {shadow(W + 6, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 9, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 3, w: W * 0.55, h: wallH - 8, cols: 3, rows: 2, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [0, 2, 4] })}
      <rect x={W * 0.62} y={0} width={8} height={12} fill={m.timber} />
      {/* The observatory: a drum and dome, its shutter open and a telescope looking out. */}
      <rect x={obsX - 12} y={wallH} width={24} height={8} fill={m.wall} />
      {dome(obsX, wallH + 8, 12, m.glass, m.wallSide)}
      <path d={`M${obsX - 2} ${wallH + 8} L${obsX - 2} ${wallH + 20} L${obsX + 2} ${wallH + 20} L${obsX + 2} ${wallH + 8} Z`} fill={m.timber} />
      <path d={`M${obsX} ${wallH + 14} L${obsX + 9} ${wallH + 24}`} stroke={m.trim} strokeWidth={2.6} strokeLinecap="round" />
      {/* A pennant on the roof: still a school. */}
      <path d={wobbleLine(W * 0.2, wallH, W * 0.2, wallH + 18, 361, 0.2)} stroke={m.timber} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d={`M${W * 0.2} ${wallH + 18} L${W * 0.2 + 10} ${wallH + 15} L${W * 0.2} ${wallH + 12} Z`} fill={m.trim} />
    </>
  );
}

export const spaceSchool: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 52, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

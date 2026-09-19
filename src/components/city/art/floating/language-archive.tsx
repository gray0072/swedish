import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The language archive — the words for sea and weather, gathered in one place (content
 * flavour). A small floating pavilion, raised slightly on stilts against the higher
 * waterline. `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 38;

function landmark(m: MaterialTokens) {
  const wallH = 20;
  const stiltH = 5;
  return (
    <>
      {shadow(W, 8)}
      <path d={wobbleLine(2, 0, 2, stiltH, 321, 0.2)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" />
      <path d={wobbleLine(W - 2, 0, W - 2, stiltH, 322, 0.2)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" />
      {isoBox({ x: 0, y: stiltH, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 3, y: stiltH + 3, w: W - 6, h: wallH - 6, cols: 3, rows: 1, size: 4.5, glass: m.glass, glassLit: m.glassLit, lit: [1] })}
      <rect x={-1} y={stiltH + wallH} width={W + 2} height={3} fill={m.roof} />
    </>
  );
}

export const languageArchive: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 30, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * ABBA The Museum — opened in 2013 (SPEC §12.6): a small modern glass-and-concrete box on
 * the Djurgården museum strip, distinguished mainly by a lit signboard rather than a famous
 * silhouette. `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 44;

function landmark(m: MaterialTokens) {
  const wallH = 24;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: wallH * 0.15, w: W - 4, h: wallH * 0.55, cols: 4, rows: 1, size: 4.5, glass: m.glass, glassLit: m.glassLit, lit: [0, 2, 3] })}
      {/* A lit signboard along the roofline, the museum's one bright, legible cue. */}
      <rect x={2} y={wallH + 2} width={W - 4} height={5} fill={m.glassLit} />
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH * 0.5, 181, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

export const abbaMuseum: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 40, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The Royal Palace — completed in 1754 after the Tre Kronor castle fire, in the flat,
 * restrained Swedish Baroque style (SPEC §12.6): a long low rectangular block with a flat
 * roofline and ranked, evenly-spaced windows, not a spired or gabled silhouette. `maxLevel`
 * is 1, so this is empire's designated 2×2 landmark, jumping straight to landmark.
 */

const W = 128;

function landmark(m: MaterialTokens) {
  const wallH = 46;
  return (
    <>
      {shadow(W, 24)}
      {/* Flat parapet roofline instead of a gable — the one Baroque-specific silhouette cue. */}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 16, wall: m.wall, wallSide: m.wallSide })}
      <rect x={-3} y={wallH} width={W + 6} height={5} fill={m.roof} />
      {/* Two ranks of tall, evenly-spaced windows — the palace's ceremonial repetition. */}
      {windowGrid({ x: W * 0.08, y: wallH * 0.14, w: W * 0.84, h: wallH * 0.34, cols: 7, rows: 1, size: 6, glass: m.glass, glassLit: m.glassLit })}
      {windowGrid({ x: W * 0.08, y: wallH * 0.56, w: W * 0.84, h: wallH * 0.3, cols: 7, rows: 1, size: 5, glass: m.glass })}
      {/* A pedimented central entrance, the one raised feature on an otherwise flat front. */}
      <path d={wobbleLine(W * 0.42, 0, W * 0.42, wallH * 0.4, 101, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.58, 0, W * 0.58, wallH * 0.4, 102, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <polygon points={`${W * 0.4},${wallH * 0.42} ${W * 0.5},${wallH * 0.55} ${W * 0.6},${wallH * 0.42}`} fill={m.trim} />
    </>
  );
}

export const royalPalace: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [{ height: 62, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 8 },
};

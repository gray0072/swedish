import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * Storkyrkan — Stockholm's cathedral, consecrated by the 13th century (SPEC §12.6). A steep
 * brick gable end, tall lancet windows and a slender copper-green spire topped with a gilt
 * ball and cross: the two checkable facts a learner would recognise it by. `maxLevel` is 1,
 * so this is medieval's designated 2×2 landmark and jumps straight from plot to landmark.
 *
 * The spire's weathered copper-green is this building's one colour outside `m` — Storkyrkan's
 * actual spire roofing is oxidised copper, not the era's brick/gold palette.
 */
const PATINA = '#5E8A76';

const W = 118;

function landmark(m: MaterialTokens) {
  const wallH = 60;
  const rise = 46;
  const spireX = W * 0.5;
  const spireBaseY = wallH + rise;
  const spireH = 52;
  return (
    <>
      {shadow(W, 26)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 14, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -4, y: wallH, w: W + 8, rise, depth: 14, roof: m.roof, roofSide: m.roofSide })}
      {/* Lancet windows — the gothic brick gable's one distinguishing detail. */}
      {windowGrid({ x: W * 0.12, y: wallH * 0.15, w: W * 0.76, h: wallH * 0.55, cols: 3, rows: 1, size: 7, glass: m.glass })}
      {/* The main door, arched. */}
      <path d={wobbleLine(W * 0.42, 0, W * 0.42, wallH * 0.35, 61, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.58, 0, W * 0.58, wallH * 0.35, 62, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* The spire: an octagon-read shaft narrowing to a gilt ball and cross. */}
      <polygon points={`${spireX - 8},${spireBaseY} ${spireX + 8},${spireBaseY} ${spireX + 3},${spireBaseY + spireH} ${spireX - 3},${spireBaseY + spireH}`} fill={PATINA} />
      <circle cx={spireX} cy={spireBaseY + spireH + 5} r={4} fill={m.trim} />
      <path d={wobbleLine(spireX, spireBaseY + spireH + 9, spireX, spireBaseY + spireH + 18, 63, 0.2)} stroke={m.trim} strokeWidth={1.6} strokeLinecap="round" />
      <path d={wobbleLine(spireX - 4, spireBaseY + spireH + 12, spireX + 4, spireBaseY + spireH + 12, 64, 0.2)} stroke={m.trim} strokeWidth={1.6} strokeLinecap="round" />
    </>
  );
}

export const storkyrkan: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [{ height: 170, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 6 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';

/**
 * Rock carving — modelled on the Bronze Age hällristningar at Tanum (SPEC §12.3, UNESCO
 * World Heritage). A flat carved slab, not a standing structure: the real thing is a low
 * relief on bare rock, so this stays close to the ground rather than reaching for the size
 * guide's upper end.
 *
 * `maxLevel` is 1, so this jumps straight from plot to landmark (§4).
 *
 * The red ochre fill in the carved grooves is this building's one colour outside `m` — Tanum's
 * carvings are traditionally re-painted with red ochre for visibility, a real and specific
 * fact about this monument (CITY_VISUALS_BUILDINGS.md §3).
 */
const OCHRE = '#a13a2a';

const W = 58;

function landmark(m: MaterialTokens) {
  const g = { stroke: OCHRE, strokeWidth: 1.6, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <>
      {shadow(W, 10)}
      {/* The rock: a smooth glacier-polished whaleback of bare granite, paler than the soil
          around it, with a thin shaded flank on the far side from the light. */}
      <path d={`M-2 0 Q0 18 ${W * 0.4} 23 Q${W * 0.8} 25 ${W + 2} 0 Z`} fill={m.glass} />
      <path d={`M${W * 0.82} 21 Q${W * 0.98} 14 ${W + 2} 0 L${W * 0.88} 0 Q${W * 0.9} 12 ${W * 0.82} 21 Z`} fill={m.wall} />
      <path d={`M2 6 Q${W * 0.3} 19 ${W * 0.55} 21`} stroke={m.wall} strokeWidth={1} fill="none" opacity={0.5} />
      {/* The Tanum repertoire, painted in: a sun wheel, a ship with its crew strokes, a figure
          with raised arms, a pair of footprints. */}
      <circle cx={W * 0.18} cy={10} r={4} {...g} />
      <path d={`M${W * 0.18 - 4} 10 H${W * 0.18 + 4} M${W * 0.18} 6 V14`} {...g} strokeWidth={1.1} />
      <path d={`M${W * 0.32} 9 Q${W * 0.45} 4 ${W * 0.58} 9`} {...g} />
      <path d={`M${W * 0.32} 9 L${W * 0.3} 13 M${W * 0.58} 9 L${W * 0.61} 13`} {...g} />
      <path d={`M${W * 0.39} 7 V11 M${W * 0.45} 6.5 V10.5 M${W * 0.51} 7 V11`} {...g} strokeWidth={1.1} />
      <path d={wobbleLine(W * 0.42, 14, W * 0.42, 19, 8, 0.3)} {...g} />
      <path d={`M${W * 0.36} 20 L${W * 0.42} 17 L${W * 0.48} 20`} {...g} strokeWidth={1.2} />
      <ellipse cx={W * 0.7} cy={7} rx={1.6} ry={2.4} fill={OCHRE} />
      <ellipse cx={W * 0.76} cy={9} rx={1.6} ry={2.4} fill={OCHRE} />
    </>
  );
}

export const rockCarving: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 26, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

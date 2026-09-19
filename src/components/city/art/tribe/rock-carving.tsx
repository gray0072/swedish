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

const W = 46;

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 6)}
      {/* The slab itself, drawn low and wide, front face only — a carving has no side plane. */}
      <polygon points={`0,0 ${W},0 ${W - 4},10 4,10`} fill={m.wall} />
      {/* A handful of carved motifs: a sun disc, a ship, a simple figure — the Tanum repertoire. */}
      <circle cx={W * 0.22} cy={6} r={3.2} fill="none" stroke={OCHRE} strokeWidth={1.4} />
      <path d={wobbleLine(W * 0.4, 8, W * 0.68, 8, 5, 0.4)} stroke={OCHRE} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.4, 8, W * 0.44, 3, 6, 0.4)} stroke={OCHRE} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.68, 8, W * 0.64, 3, 7, 0.4)} stroke={OCHRE} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.82, 4, W * 0.82, 9, 8, 0.4)} stroke={OCHRE} strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </>
  );
}

export const rockCarving: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 12, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

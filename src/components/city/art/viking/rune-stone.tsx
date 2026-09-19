import type { ReactNode } from 'react';
import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';

/**
 * Rune stone — Uppland alone holds roughly 2,500 of these, the densest concentration in the
 * world (SPEC §12.3). A tall standing granite slab carved with a serpent band (ormslinga,
 * SPEC §11.4) and a short run of **Younger Futhark** glyphs — straight-staff forms with
 * diagonal branches, never the round-lobed Elder Futhark and never an invented "fantasy"
 * rune. The glyphs below are simplified for legibility at this scale, not a literal
 * transliteration of any one stone's inscription.
 *
 * The red paint in the carved lines is this building's one colour outside `m` — Sweden's
 * rune stones were traditionally painted, most famously red (SPEC §11.4/§3's own example).
 */
const PAINT = '#b23a2e';

const W = 30;
const H = 44;

/** One Younger Futhark-style glyph: a vertical staff with 1–2 short diagonal branches. */
function rune(x: number, y: number, kind: 0 | 1 | 2 | 3, stroke: string) {
  const seed = Math.round(x + y);
  const staff = <path key="s" d={wobbleLine(x, y, x, y + 6, seed, 0.2)} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" fill="none" />;
  const branches: Record<0 | 1 | 2 | 3, ReactNode[]> = {
    0: [<path key="b" d={wobbleLine(x, y, x + 2.5, y + 2, seed + 1, 0.2)} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" fill="none" />],
    1: [
      <path key="b1" d={wobbleLine(x, y + 1, x + 2.2, y + 3, seed + 2, 0.2)} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" fill="none" />,
      <path key="b2" d={wobbleLine(x, y + 4, x + 2.2, y + 6, seed + 3, 0.2)} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" fill="none" />,
    ],
    2: [<path key="b" d={wobbleLine(x - 2, y + 2, x + 2, y + 2, seed + 4, 0.2)} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" fill="none" />],
    3: [
      <path key="b1" d={wobbleLine(x, y + 5, x - 2.2, y + 3, seed + 5, 0.2)} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" fill="none" />,
    ],
  };
  return (
    <g key={`${x}-${y}`}>
      {staff}
      {branches[kind]}
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const kinds: Array<0 | 1 | 2 | 3> = [0, 1, 2, 3, 1, 0];
  return (
    <>
      {shadow(W)}
      {/* The slab, front face only — a rune stone has no meaningful side plane at this scale. */}
      <path d={`M${W * 0.15} 0 L${W * 0.1} ${H * 0.85} Q${W / 2} ${H} ${W * 0.9} ${H * 0.85} L${W * 0.85} 0 Z`} fill={m.wall} />
      {/* Serpent band border (ormslinga, SPEC §11.4): a wobbled ribbon tracing the top and one
          side of the slab. Two strokes rather than one continuous path — simpler and just as
          readable at this size. */}
      <path d={wobbleLine(W * 0.15, 4, W * 0.85, 4, 81, 0.6)} stroke={m.timber} strokeWidth={1.4} fill="none" />
      <path d={wobbleLine(W * 0.85, 4, W * 0.75, H * 0.8, 82, 0.6)} stroke={m.timber} strokeWidth={1.4} fill="none" />
      {kinds.map((kind, i) => rune(W * 0.32, 8 + i * 5.5, kind, PAINT))}
    </>
  );
}

export const runeStone: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: H, render: landmark }],
  workSpot: { dx: W + 12, dy: 4 },
};

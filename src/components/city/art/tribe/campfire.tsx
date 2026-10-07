import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';
import { firewood } from '../shared/props';

/**
 * Campfire — where the tribe gathers and learns words (content flavour). A stone-ringed
 * firepit that grows into the settlement's meeting place: a cooking hearth with a spit and a
 * ring of seating stones, then a carved gathering pole with a hide banner — the tallest
 * thing the tribe owns, so the upgrade reads from across the island.
 *
 * The warm ember glow is this building's one colour outside `m` (CITY_VISUALS_BUILDINGS.md
 * §3) — a campfire is specifically known for the fire, not for any era material.
 */
const EMBER = '#e2793a';
const W = 30;
const CX = W / 2;

function ring(r: number, m: MaterialTokens) {
  return (
    <>
      <ellipse cx={CX} cy={2} rx={r} ry={r * 0.4} fill={m.timber} opacity={0.35} />
      <ellipse cx={CX} cy={2} rx={r} ry={r * 0.4} fill="none" stroke={m.wallSide} strokeWidth={3} />
    </>
  );
}

/** The fire, its hot core in the era's lamp-glow token so the art stays within one extra colour. */
function flame(h: number, core: string) {
  return (
    <>
      <path
        d={`M${CX - 5} 3 Q${CX - 7} ${3 + h * 0.5} ${CX} ${3 + h} Q${CX + 7} ${3 + h * 0.5} ${CX + 5} 3 Q${CX} ${3 + h * 0.35} ${CX - 5} 3 Z`}
        fill={EMBER}
      />
      <path d={`M${CX - 2} 3 Q${CX - 3} ${3 + h * 0.35} ${CX} ${3 + h * 0.6} Q${CX + 3} ${3 + h * 0.35} ${CX + 2} 3 Z`} fill={core} />
    </>
  );
}

/** A seating stone: an upright boulder with a lit top. */
function stone(x: number, h: number, m: MaterialTokens) {
  return (
    <g>
      <rect x={x - 4} y={0} width={8} height={h} rx={3} fill={m.wallSide} />
      <rect x={x - 3} y={h - 3} width={6} height={3} rx={1.5} fill={m.wall} />
    </g>
  );
}

/** The cooking spit: two forked posts and a bar with a pot hung from it. */
function spit(m: MaterialTokens) {
  return (
    <g stroke={m.timber} strokeWidth={1.8} strokeLinecap="round" fill="none">
      <path d={wobbleLine(CX - 13, 0, CX - 13, 20, 3, 0.3)} />
      <path d={wobbleLine(CX + 13, 0, CX + 13, 20, 4, 0.3)} />
      <path d={`M${CX - 16} 23 L${CX - 13} 20 L${CX - 10} 23 M${CX + 10} 23 L${CX + 13} 20 L${CX + 16} 23`} />
      <path d={wobbleLine(CX - 15, 20, CX + 15, 20, 5, 0.3)} />
      <path d={`M${CX} 20 L${CX} 16`} />
      <ellipse cx={CX} cy={13} rx={5} ry={4} fill={m.timber} stroke="none" />
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 8)}
      {ring(12, m)}
      {flame(16, m.glassLit)}
      {firewood(CX + 17, 0, 10, m.timber)}
    </>
  );
}

function extended(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 16, 10)}
      {stone(CX - 24, 9, m)}
      {stone(CX + 24, 8, m)}
      {ring(14, m)}
      {flame(21, m.glassLit)}
      {spit(m)}
      {firewood(CX + 28, 0, 12, m.timber)}
      {firewood(CX - 30, 0, 10, m.timber)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const poleX = CX + 20;
  return (
    <>
      {shadow(W + 22, 12)}
      {/* The gathering pole: carved bands in the trim colour, a hide banner from a crossbar. */}
      <path d={wobbleLine(poleX, 0, poleX, 58, 9, 0.4)} stroke={m.timber} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      {[16, 28, 40].map((y) => (
        <rect key={y} x={poleX - 2.6} y={y} width={5.2} height={3} fill={m.trim} />
      ))}
      <path d={`M${poleX - 9} 52 L${poleX + 9} 52`} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
      <path d={`M${poleX - 7} 52 L${poleX + 7} 52 L${poleX + 6} 38 L${poleX} 42 L${poleX - 6} 38 Z`} fill={m.trim} />
      {stone(CX - 26, 10, m)}
      {stone(CX - 18, 7, m)}
      {stone(CX + 30, 9, m)}
      {ring(15, m)}
      {flame(25, m.glassLit)}
      {spit(m)}
      {firewood(CX - 34, 0, 12, m.timber)}
      {/* Log benches, where the tribe sits to listen. */}
      <rect x={CX - 12} y={-6} width={24} height={4} rx={2} fill={m.timber} />
    </>
  );
}

export const campfire: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [
    { height: 22, render: built },
    { height: 30, render: extended },
    { height: 58, render: landmark },
  ],
  ambient: ['smoke'],
  workSpot: { dx: W / 2 + 20, dy: 0 },
};

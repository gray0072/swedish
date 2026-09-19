import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';
import { firewood } from '../shared/props';

/**
 * Campfire — where the tribe gathers and learns words (content flavour). A stone-ringed
 * firepit, deliberately short: the size guide's 40–70 unit range is a typical-building
 * guide, not a floor, and a waist-high fire silhouette is the honest shape here.
 *
 * The warm ember glow is this building's one colour outside `m` (CITY_VISUALS_BUILDINGS.md
 * §3) — a campfire is specifically known for the fire, not for any era material.
 */
const EMBER = '#e2793a';

const W = 30;

function ring(cx: number, r: number, wall: string) {
  return <ellipse cx={cx} cy={2} rx={r} ry={r * 0.4} fill="none" stroke={wall} strokeWidth={3} />;
}

function flame(cx: number, h: number) {
  return (
    <path
      d={`M${cx - 4} 4 Q${cx - 6} ${4 + h * 0.5} ${cx} ${4 + h} Q${cx + 6} ${4 + h * 0.5} ${cx + 4} 4 Q${cx} ${4 + h * 0.35} ${cx - 4} 4 Z`}
      fill={EMBER}
    />
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 8)}
      {ring(W / 2, 12, m.wallSide)}
      {flame(W / 2, 16)}
      {firewood(W / 2 + 10, 0, 10, m.timber)}
    </>
  );
}

function extended(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 10, 9)}
      {ring(W / 2, 14, m.wallSide)}
      {flame(W / 2, 19)}
      {firewood(W / 2 + 12, 0, 12, m.timber)}
      {firewood(W / 2 - 14, 0, 10, m.timber)}
      {/* A cooking spit across the fire — the "in use" prop that separates a pit from a hearth. */}
      <path d={wobbleLine(W / 2 - 12, 10, W / 2 + 12, 8, 3, 0.4)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 10, 9)}
      {ring(W / 2, 15, m.wallSide)}
      {flame(W / 2, 22)}
      {firewood(W / 2 + 12, 0, 12, m.timber)}
      {firewood(W / 2 - 14, 0, 10, m.timber)}
      <path d={wobbleLine(W / 2 - 12, 10, W / 2 + 12, 8, 3, 0.4)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      {/* Landmark: two low log benches around the ring — this is the tribe's gathering place. */}
      <rect x={-6} y={0} width={10} height={4} rx={2} fill={m.timber} />
      <rect x={W - 4} y={0} width={10} height={4} rx={2} fill={m.timber} />
    </>
  );
}

export const campfire: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [
    { height: 22, render: built },
    { height: 27, render: extended },
    { height: 30, render: landmark },
  ],
  ambient: ['smoke'],
  workSpot: { dx: W / 2 + 20, dy: 0 },
};

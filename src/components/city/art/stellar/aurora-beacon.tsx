import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { dome, isoBox, shadow, wobbleLine } from '../shared/primitives';

/**
 * The aurora beacon — pure invention, though the aurora over Sweden is real enough (SPEC
 * §12.8: explicitly fiction, never dressed up as fact). A slender tower topped with a lit
 * beacon lamp, its light drawn by the `beacon` ambient emitter rather than by this file
 * (CITY_VISUALS_LIFE.md §7). Stellar's designated 2×2 landmark.
 */

const W = 60;

function built(m: MaterialTokens) {
  const wallH = 70;
  return (
    <>
      {shadow(W, 22)}
      {isoBox({ x: W * 0.3, y: 0, w: W * 0.4, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {dome(W * 0.5, wallH + 8, 8, m.glassLit, m.wallSide)}
    </>
  );
}

function extended(m: MaterialTokens) {
  const wallH = 90;
  return (
    <>
      {shadow(W, 22)}
      {isoBox({ x: W * 0.32, y: 0, w: W * 0.36, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {/* Extended: a wider observation ring partway up the shaft, +25% mass (§4). */}
      <ellipse cx={W * 0.5} cy={wallH * 0.6} rx={W * 0.3} ry={6} fill={m.wallSide} />
      {dome(W * 0.5, wallH + 9, 9, m.glassLit, m.wallSide)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 110;
  return (
    <>
      {shadow(W, 22)}
      {isoBox({ x: W * 0.34, y: 0, w: W * 0.32, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      <ellipse cx={W * 0.5} cy={wallH * 0.55} rx={W * 0.32} ry={6.5} fill={m.wallSide} />
      {/* Landmark: a wider crown ring just below the beacon lamp — the ornament this level adds. */}
      <ellipse cx={W * 0.5} cy={wallH * 0.9} rx={W * 0.34} ry={7} fill={m.trim} opacity={0.5} />
      {dome(W * 0.5, wallH + 10, 10, m.glassLit, m.wallSide)}
      <path d={wobbleLine(W * 0.5, wallH + 20, W * 0.5, wallH + 26, 331, 0.2)} stroke={m.trim} strokeWidth={1.4} strokeLinecap="round" />
    </>
  );
}

export const auroraBeacon: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [
    { height: 86, render: built },
    { height: 107, render: extended },
    { height: 130, render: landmark },
  ],
  ambient: ['beacon'],
  workSpot: { dx: W * 0.5, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';
import { planter } from '../shared/props';

/**
 * The Wood City — extrapolated from the real Stockholm Wood City project announced for
 * Sickla in 2023 (SPEC §12.8: an informed guess, not a prediction dressed as fact). Mass
 * timber construction, drawn with visible cross-laminated panel seams rather than a plain
 * fill, and planted roof terraces stepping back at each level — green's signature "unusually
 * green island" motif (CITY_VISUALS_SCENE.md §6). Green's designated 2×2 landmark.
 */

const W = 110;

function timberSeams(x: number, y: number, w: number, h: number, timber: string, seed: number) {
  const lines = [];
  for (let i = 1; i < 4; i += 1) {
    const lx = x + (w / 4) * i;
    lines.push(<path key={i} d={wobbleLine(lx, y, lx, y + h, seed + i, 0.3)} stroke={timber} strokeWidth={0.8} opacity={0.4} />);
  }
  return lines;
}

function built(m: MaterialTokens) {
  const h1 = 50;
  return (
    <>
      {shadow(W, 20)}
      {isoBox({ x: 0, y: 0, w: W, h: h1, depth: 14, wall: m.wall, wallSide: m.wallSide })}
      {timberSeams(0, 0, W, h1, m.timber, 190)}
      <rect x={-2} y={h1} width={W + 4} height={5} fill={m.roof} />
      {planter(W * 0.25, h1 + 5, 20, m.wallSide, m.roof)}
      {planter(W * 0.65, h1 + 5, 20, m.wallSide, m.roof)}
    </>
  );
}

function extended(m: MaterialTokens) {
  const h1 = 56;
  const h2 = 34;
  return (
    <>
      {shadow(W, 20)}
      {isoBox({ x: 0, y: 0, w: W, h: h1, depth: 14, wall: m.wall, wallSide: m.wallSide })}
      {timberSeams(0, 0, W, h1, m.timber, 190)}
      <rect x={-2} y={h1} width={W + 4} height={4} fill={m.roof} />
      {/* Extended: a stepped-back upper storey with its own planted terrace, +25% mass (§4). */}
      {isoBox({ x: W * 0.14, y: h1 + 4, w: W * 0.72, h: h2, depth: 10, wall: m.wallSide, wallSide: m.wall })}
      {timberSeams(W * 0.14, h1 + 4, W * 0.72, h2, m.timber, 200)}
      <rect x={W * 0.12} y={h1 + h2 + 4} width={W * 0.76} height={4} fill={m.roof} />
      {planter(W * 0.3, h1 + h2 + 8, 18, m.wallSide, m.roof)}
      {planter(W * 0.7, h1 + h2 + 8, 18, m.wallSide, m.roof)}
      {planter(W * 0.2, h1 + 4, 14, m.wallSide, m.roof)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const h1 = 58;
  const h2 = 36;
  const h3 = 24;
  return (
    <>
      {shadow(W, 20)}
      {isoBox({ x: 0, y: 0, w: W, h: h1, depth: 14, wall: m.wall, wallSide: m.wallSide })}
      {timberSeams(0, 0, W, h1, m.timber, 190)}
      <rect x={-2} y={h1} width={W + 4} height={4} fill={m.roof} />
      {isoBox({ x: W * 0.14, y: h1 + 4, w: W * 0.72, h: h2, depth: 10, wall: m.wallSide, wallSide: m.wall })}
      {timberSeams(W * 0.14, h1 + 4, W * 0.72, h2, m.timber, 200)}
      <rect x={W * 0.12} y={h1 + h2 + 4} width={W * 0.76} height={4} fill={m.roof} />
      {/* Landmark: a top-storey timber crown, the tallest, most ornamented terrace. */}
      {isoBox({ x: W * 0.3, y: h1 + h2 + 4, w: W * 0.4, h: h3, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {timberSeams(W * 0.3, h1 + h2 + 4, W * 0.4, h3, m.timber, 210)}
      {planter(W * 0.5, h1 + h2 + h3 + 4, 24, m.wallSide, m.roof)}
      {planter(W * 0.3, h1 + h2 + 8, 18, m.wallSide, m.roof)}
      {planter(W * 0.7, h1 + h2 + 8, 18, m.wallSide, m.roof)}
      {planter(W * 0.2, h1 + 4, 14, m.wallSide, m.roof)}
    </>
  );
}

export const woodCity: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [
    { height: 65, render: built },
    { height: 100, render: extended },
    { height: 130, render: landmark },
  ],
  workSpot: { dx: W * 0.5, dy: 6 },
};

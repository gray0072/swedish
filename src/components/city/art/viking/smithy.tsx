import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';
import { basket } from '../shared/props';

/**
 * Smithy — forges tools and weapons (SPEC §12.3, era 2). A timber shed over a low stone
 * forge. `maxLevel` is 2, so it goes straight from built to landmark (§4) — there is no
 * "extended" state to draw.
 *
 * The forge's ember glow is this building's one colour outside `m`: a smithy is specifically
 * known for the coal glow at its heart (CITY_VISUALS_BUILDINGS.md §3).
 */
const EMBER = '#d95d2c';

const W = 44;

function forge(cx: number, wallSide: string) {
  return (
    <g>
      <rect x={cx - 8} y={0} width={16} height={7} fill={wallSide} />
      <circle cx={cx} cy={4} r={2.6} fill={EMBER} />
    </g>
  );
}

function built(m: MaterialTokens) {
  const wallH = 22;
  const rise = 18;
  return (
    <>
      {shadow(W)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -2, y: wallH, w: W + 4, rise, roof: m.roof, roofSide: m.roofSide })}
      {forge(W * 0.7, m.wallSide)}
      <path d={wobbleLine(W * 0.25, 0, W * 0.25, wallH * 0.7, 41, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 24;
  const rise = 20;
  return (
    <>
      {shadow(W + 16)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -2, y: wallH, w: W + 4, rise, roof: m.roof, roofSide: m.roofSide })}
      {/* Landmark: an open lean-to added for the bellows, +50% mass over level 1 (§4). */}
      {isoBox({ x: W + 2, y: 0, w: 16, h: wallH * 0.65, depth: 6, wall: m.wallSide, wallSide: m.wall })}
      {isoRoof({ x: W, y: wallH * 0.65, w: 20, rise: rise * 0.6, depth: 6, roof: m.roofSide, roofSide: m.roof })}
      {forge(W * 0.7, m.wallSide)}
      {basket(W + 10, 0, m.timber)}
      <path d={wobbleLine(W * 0.25, 0, W * 0.25, wallH * 0.7, 41, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* A hung tool sign — the plate a customer would look for. */}
      <path d={wobbleLine(W * 0.25, wallH * 0.7, W * 0.25 + 6, wallH * 0.7, 42, 0.2)} stroke={m.trim} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

export const smithy: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [
    { height: 40, render: built },
    { height: 44, render: landmark },
  ],
  ambient: ['smoke'],
  workSpot: { dx: W * 0.7, dy: 8 },
};

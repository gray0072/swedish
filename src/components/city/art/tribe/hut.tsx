import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';
import { firewood } from '../shared/props';

/**
 * Hut — era 1's first shelter (SPEC §12.3, era 1). A hide-and-timber pit hut: low walls, a
 * steep conical/gable thatch roof, no windows (glass tokens are unused here — nothing at this
 * technology level had glass). No colour outside `m` is used.
 */

const W = 52; // 1x1 footprint, local width in world units

function door(x: number, wallH: number, timber: string) {
  return (
    <path
      d={wobbleLine(x, 0, x, wallH * 0.7, 11, 0.3)}
      stroke={timber}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function built(m: MaterialTokens) {
  const wallH = 24;
  const roofRise = 20;
  return (
    <>
      {shadow(W)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -3, y: wallH, w: W + 6, rise: roofRise, roof: m.roof, roofSide: m.roofSide })}
      {door(W * 0.28, wallH, m.timber)}
      {firewood(W * 0.78, 0, 12, m.timber)}
    </>
  );
}

function extended(m: MaterialTokens) {
  const wallH = 26;
  const roofRise = 21;
  return (
    <>
      {shadow(W + 14)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -3, y: wallH, w: W + 6, rise: roofRise, roof: m.roof, roofSide: m.roofSide })}
      {/* Extended: a lean-to porch added against the front wall, +25% mass (§4). */}
      {isoBox({ x: -18, y: 0, w: 16, h: wallH * 0.6, depth: 6, wall: m.wallSide, wallSide: m.wall })}
      {isoRoof({ x: -20, y: wallH * 0.6, w: 20, rise: 10, depth: 6, roof: m.roofSide, roofSide: m.roof })}
      {door(W * 0.32, wallH, m.timber)}
      {firewood(W * 0.82, 0, 14, m.timber)}
      {firewood(-12, 0, 10, m.timber)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 27;
  const roofRise = 23;
  return (
    <>
      {shadow(W + 14)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -3, y: wallH, w: W + 6, rise: roofRise, roof: m.roof, roofSide: m.roofSide })}
      {isoBox({ x: -18, y: 0, w: 16, h: wallH * 0.6, depth: 6, wall: m.wallSide, wallSide: m.wall })}
      {isoRoof({ x: -20, y: wallH * 0.6, w: 20, rise: 10, depth: 6, roof: m.roofSide, roofSide: m.roof })}
      {/* Landmark ornament: a carved ridge post, the plainest "someone put care into this" mark
          available at this technology level — no metal, no dye, just a shaped stick. */}
      <path
        d={wobbleLine(W / 2 - 3, wallH + roofRise, W / 2 - 3, wallH + roofRise + 9, 23, 0.4)}
        stroke={m.trim}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      {door(W * 0.32, wallH, m.timber)}
      {firewood(W * 0.82, 0, 14, m.timber)}
      {firewood(-12, 0, 10, m.timber)}
    </>
  );
}

export const hut: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [
    { height: 46, render: built },
    { height: 51, render: extended },
    { height: 58, render: landmark },
  ],
  workSpot: { dx: W * 0.6, dy: 4 },
};

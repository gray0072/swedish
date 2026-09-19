import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';

/**
 * The spaceport — one more harbour, the fourth this city has had, counting from Birka (SPEC
 * §12.8). A launch pad with a gantry tower, deliberately playing the same "harbour" role as
 * every era before it (Birka's trading square, the shipyard, the electric ferry, the sea
 * gate) rather than reaching for spectacle — a plausible extrapolation, not science fiction.
 * `maxLevel` is 2. This is stellar's harbour-class building.
 */

const W = 90; // 2x1 footprint

function built(m: MaterialTokens) {
  const gantryH = 44;
  return (
    <>
      {shadow(W, 16)}
      <ellipse cx={W * 0.4} cy={2} rx={20} ry={7} fill={m.wallSide} />
      {isoBox({ x: W * 0.7, y: 0, w: 10, h: gantryH, depth: 5, wall: m.wall, wallSide: m.wallSide })}
      <path d={wobbleLine(W * 0.4, 2, W * 0.4, 22, 351, 0.2)} stroke={m.timber} strokeWidth={2.4} strokeLinecap="round" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const gantryH = 50;
  return (
    <>
      {shadow(W, 16)}
      <ellipse cx={W * 0.4} cy={2} rx={22} ry={8} fill={m.wallSide} />
      {isoBox({ x: W * 0.72, y: 0, w: 12, h: gantryH, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {/* Landmark: a boarding arm reaching from the gantry to the craft, and its running lights. */}
      <path d={wobbleLine(W * 0.72, gantryH * 0.6, W * 0.44, gantryH * 0.45, 352, 0.3)} stroke={m.timber} strokeWidth={1.8} strokeLinecap="round" />
      <circle cx={W * 0.78} cy={gantryH} r={2} fill={m.trim} />
      <path d={wobbleLine(W * 0.4, 2, W * 0.4, 26, 351, 0.2)} stroke={m.timber} strokeWidth={2.6} strokeLinecap="round" />
      <polygon points={`${W * 0.4 - 5},26 ${W * 0.4 + 5},26 ${W * 0.4},34`} fill={m.trim} />
    </>
  );
}

export const spacePort: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 46, render: built },
    { height: 52, render: landmark },
  ],
  workSpot: { dx: W * 0.55, dy: 6 },
};

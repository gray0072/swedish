import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { dome, isoBox, shadow, wobbleLine } from '../shared/primitives';
import { planter } from '../shared/props';

/**
 * The climate lab — where the city counts its emissions, and learns the words it takes to
 * talk about them (content flavour). A small timber-and-glass lab with a sensor dome on the
 * roof and a planted sill. `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 40;

function landmark(m: MaterialTokens) {
  const wallH = 22;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {dome(W * 0.7, wallH + 6, 6, m.glass, m.wallSide)}
      {planter(W * 0.28, wallH + 2, 18, m.wallSide, m.roof)}
      <path d={wobbleLine(W * 0.3, 0, W * 0.3, wallH * 0.6, 241, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

export const climateLab: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 38, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

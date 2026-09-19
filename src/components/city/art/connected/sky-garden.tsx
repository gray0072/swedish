import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid } from '../shared/primitives';
import { planter } from '../shared/props';

/**
 * The roof garden — a guess: roofs stop being empty (SPEC §12.8). A glass residential tower
 * whose setback terraces are planted rather than bare, stepping the green era's planted-roof
 * motif into a taller, glassier connected-era form. Connected's designated 2×2 landmark.
 */

const W = 106;

function tower(x: number, y: number, w: number, h: number, m: MaterialTokens, litOffset: number) {
  return (
    <>
      {isoBox({ x, y, w, h, depth: 12, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: x + 3, y: y + 3, w: w - 6, h: h - 6, cols: 4, rows: 3, size: 4, glass: m.glass, glassLit: m.glassLit, lit: [litOffset, litOffset + 3, litOffset + 7] })}
    </>
  );
}

function built(m: MaterialTokens) {
  const h1 = 56;
  return (
    <>
      {shadow(W, 20)}
      {tower(0, 0, W, h1, m, 0)}
      {planter(W * 0.5, h1 + 2, W - 16, m.wallSide, m.trim)}
    </>
  );
}

function extended(m: MaterialTokens) {
  const h1 = 62;
  const h2 = 40;
  return (
    <>
      {shadow(W, 20)}
      {tower(0, 0, W, h1, m, 0)}
      {planter(W * 0.5, h1 + 2, W - 16, m.wallSide, m.trim)}
      {tower(W * 0.16, h1 + 4, W * 0.68, h2, m, 2)}
      {planter(W * 0.5, h1 + h2 + 6, W * 0.6, m.wallSide, m.trim)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const h1 = 64;
  const h2 = 44;
  const h3 = 26;
  return (
    <>
      {shadow(W, 20)}
      {tower(0, 0, W, h1, m, 0)}
      {planter(W * 0.5, h1 + 2, W - 16, m.wallSide, m.trim)}
      {tower(W * 0.16, h1 + 4, W * 0.68, h2, m, 2)}
      {planter(W * 0.5, h1 + h2 + 6, W * 0.6, m.wallSide, m.trim)}
      {/* Landmark: a top-storey glass pavilion crowned by the tallest planted terrace. */}
      {tower(W * 0.32, h1 + h2 + 6, W * 0.36, h3, m, 1)}
      {planter(W * 0.5, h1 + h2 + h3 + 6, W * 0.32, m.wallSide, m.trim)}
    </>
  );
}

export const skyGarden: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [
    { height: 70, render: built },
    { height: 118, render: extended },
    { height: 150, render: landmark },
  ],
  ambient: ['rotor'],
  workSpot: { dx: W * 0.5, dy: 6 },
};

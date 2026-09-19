import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';
import { firewood } from '../shared/props';

/**
 * Longhouse — a shared home for an extended family (SPEC §12.3, era 2). Turf-and-timber
 * construction (CITY_VISUALS_SCENE.md §6): timber frame, a turf roof drawn as short
 * horizontal wobble courses rather than a smooth fill, and — the one real, checkable detail —
 * crossed gable beam-ends projecting past the roof ridge, an authentic Norse longhouse
 * feature. No horns anywhere near it (SPEC §11.4).
 *
 * This is viking's designated 2×2 landmark. A real longhouse is long and low, not tall, so
 * height stays modest even though the size guide would allow up to 170.
 */

const W = 100;

function turfCourses(x: number, y: number, w: number, rise: number, seed: number, stroke: string) {
  const lines = [];
  for (let i = 0; i < 4; i += 1) {
    const t = i / 3;
    const ly = y + rise * (0.15 + t * 0.7);
    const lw = w * (1 - t * 0.7);
    lines.push(
      <path
        key={`turf-${i}`}
        d={wobbleLine(x + (w - lw) / 2, ly, x + (w + lw) / 2, ly, seed + i, 0.4)}
        stroke={stroke}
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
      />,
    );
  }
  return lines;
}

/** Crossed timber beam-ends above the ridge — the longhouse's one carved flourish. */
function gableCross(cx: number, y: number, timber: string) {
  return (
    <g stroke={timber} strokeWidth={2} strokeLinecap="round">
      <path d={wobbleLine(cx - 6, y - 8, cx + 5, y + 3, 31, 0.3)} />
      <path d={wobbleLine(cx + 6, y - 8, cx - 5, y + 3, 32, 0.3)} />
    </g>
  );
}

function built(m: MaterialTokens) {
  const wallH = 30;
  const rise = 34;
  return (
    <>
      {shadow(W, 20)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -4, y: wallH, w: W + 8, rise, depth: 10, roof: m.roof, roofSide: m.roofSide })}
      {turfCourses(-4, wallH, W + 8, rise, 1, m.roofSide)}
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH * 0.75, 21, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {firewood(W + 6, 0, 12, m.timber)}
    </>
  );
}

function extended(m: MaterialTokens) {
  const wallH = 32;
  const rise = 36;
  return (
    <>
      {shadow(W + 30, 20)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -4, y: wallH, w: W + 8, rise, depth: 10, roof: m.roof, roofSide: m.roofSide })}
      {turfCourses(-4, wallH, W + 8, rise, 1, m.roofSide)}
      {/* Extended: a second bay added along the ridge — +25% mass (§4). */}
      {isoBox({ x: W + 4, y: 0, w: 28, h: wallH * 0.9, depth: 10, wall: m.wallSide, wallSide: m.wall })}
      {isoRoof({ x: W + 2, y: wallH * 0.9, w: 32, rise: rise * 0.8, depth: 10, roof: m.roofSide, roofSide: m.roof })}
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH * 0.75, 21, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {firewood(W + 40, 0, 14, m.timber)}
      {firewood(-10, 0, 10, m.timber)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 34;
  const rise = 38;
  return (
    <>
      {shadow(W + 30, 20)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -4, y: wallH, w: W + 8, rise, depth: 10, roof: m.roof, roofSide: m.roofSide })}
      {turfCourses(-4, wallH, W + 8, rise, 1, m.roofSide)}
      {isoBox({ x: W + 4, y: 0, w: 28, h: wallH * 0.9, depth: 10, wall: m.wallSide, wallSide: m.wall })}
      {isoRoof({ x: W + 2, y: wallH * 0.9, w: 32, rise: rise * 0.8, depth: 10, roof: m.roofSide, roofSide: m.roof })}
      {/* Landmark: the crossed gable beam-ends and a woven banner — the ornament this level adds. */}
      {gableCross(W / 2 - 2, wallH + rise, m.timber)}
      <rect x={W * 0.5 - 3} y={wallH + rise - 6} width={6} height={10} fill={m.trim} />
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH * 0.75, 21, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {firewood(W + 40, 0, 14, m.timber)}
      {firewood(-10, 0, 10, m.timber)}
    </>
  );
}

export const longhouse: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [
    { height: 64, render: built },
    { height: 68, render: extended },
    { height: 72, render: landmark },
  ],
  ambient: ['smoke'],
  workSpot: { dx: W * 0.5, dy: -6 },
};

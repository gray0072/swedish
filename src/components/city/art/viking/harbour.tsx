import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';
import { barrel, net } from '../shared/props';
import { boatViking } from '../shared/figures';

/**
 * Harbour — where expeditions east set out (SPEC §12.3, era 2). A wooden jetty with a
 * moored longship of its own; the *sailing* boats on scripted routes are a separate
 * ambient layer (CITY_VISUALS_LIFE.md §6) that only appears once a harbour-class building
 * exists — this building's own moored ship is a static detail, not that vessel.
 */

const W = 92; // 2x1 footprint

function jetty(w: number, wall: string, wallSide: string) {
  const planks = [];
  for (let i = 0; i < 5; i += 1) {
    planks.push(
      <path
        key={`plank-${i}`}
        d={wobbleLine((w / 5) * i, 1, (w / 5) * i, 7, 51 + i, 0.2)}
        stroke={wallSide}
        strokeWidth={1}
        fill="none"
      />,
    );
  }
  return (
    <g>
      {isoBox({ x: 0, y: 0, w, h: 8, depth: 4, wall, wallSide })}
      {planks}
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 14)}
      {jetty(W * 0.6, m.wall, m.wallSide)}
      {/* Mooring post */}
      <path d={wobbleLine(4, 8, 4, 20, 61, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {boatViking({ x: W * 0.55, y: 10, w: 34, hull: m.wallSide })}
      {barrel(W * 0.85, 0, m.timber)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 14)}
      {jetty(W, m.wall, m.wallSide)}
      <path d={wobbleLine(4, 8, 4, 20, 61, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W - 6, 8, W - 6, 22, 62, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* Landmark: the ship carries a sail now, and a small dock crane for cargo — the busier
          harbour §4 describes. */}
      {boatViking({ x: W * 0.55, y: 10, w: 40, hull: m.wallSide, sail: m.trim })}
      {net(W * 0.1, 0, 22, m.timber)}
      {barrel(W * 0.88, 0, m.timber)}
      {barrel(W * 0.78, 0, m.timber)}
    </>
  );
}

export const harbour: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 44, render: built },
    { height: 56, render: landmark },
  ],
  workSpot: { dx: W * 0.85, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';
import { barrel } from '../shared/props';

/**
 * The shipyard — where the warship Vasa was built (SPEC §12.6). A timber-ribbed hull under
 * construction on the slipway, with an A-frame gantry crane; `maxLevel` is 2, going from a
 * bare frame to a busier yard with the crane in use.
 */

const W = 90; // 2x1 footprint

function hullFrame(w: number, timber: string, ribCount: number) {
  const ribs = [];
  for (let i = 0; i < ribCount; i += 1) {
    const x = (w / (ribCount - 1)) * i;
    const h = 10 + Math.sin((i / (ribCount - 1)) * Math.PI) * 12;
    ribs.push(<path key={`rib-${i}`} d={wobbleLine(x, 0, x, h, 110 + i, 0.3)} stroke={timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />);
  }
  return ribs;
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: -2, y: 0, w: W * 0.35, h: 12, depth: 6, wall: m.wallSide, wallSide: m.wall })}
      {hullFrame(W * 0.7, m.timber, 6)}
      {barrel(W * 0.9, 0, m.timber)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const craneX = W * 0.85;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: -2, y: 0, w: W * 0.35, h: 14, depth: 6, wall: m.wallSide, wallSide: m.wall })}
      {hullFrame(W * 0.7, m.timber, 7)}
      {/* Landmark: an A-frame gantry crane hoisting a plank — the busier, working yard. */}
      <path d={wobbleLine(craneX - 10, 0, craneX, 30, 121, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(craneX + 10, 0, craneX, 30, 122, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(craneX, 30, craneX, 12, 123, 0.2)} stroke={m.trim} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <rect x={craneX - 6} y={9} width={12} height={3} fill={m.timber} />
      {barrel(W * 0.55, 0, m.timber)}
      {barrel(W * 0.62, 0, m.timber)}
    </>
  );
}

export const shipyard: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 34, render: built },
    { height: 42, render: landmark },
  ],
  workSpot: { dx: W * 0.45, dy: 6 },
};

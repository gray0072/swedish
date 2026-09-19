import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';
import { barrel, basket, cart } from '../shared/props';

/**
 * Stortorget market — the main square of the Old Town, in continuous use as a market place
 * since the medieval city's founding (SPEC §12.6). Like Birka's trading square before it,
 * an open market of awning stalls rather than one building — the honest shape for a square.
 */

const W = 88; // 2x1 footprint

function stall(x: number, w: number, wood: string, awning: string) {
  return (
    <g>
      <path d={wobbleLine(x, 0, x, 16, Math.round(x), 0.3)} stroke={wood} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(x + w, 0, x + w, 16, Math.round(x) + 1, 0.3)} stroke={wood} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <polygon points={`${x - 2},16 ${x + w + 2},16 ${x + w - 2},22 ${x + 2},22`} fill={awning} />
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 8)}
      {stall(4, 20, m.timber, m.trim)}
      {basket(20, 0, m.wall)}
      {cart(56, 0, m.timber, m.trim)}
    </>
  );
}

function extended(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 8)}
      {stall(4, 20, m.timber, m.trim)}
      {stall(32, 20, m.timber, m.trim)}
      {basket(20, 0, m.wall)}
      {basket(48, 0, m.wall)}
      {cart(70, 0, m.timber, m.trim)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 8)}
      {stall(4, 20, m.timber, m.trim)}
      {stall(32, 20, m.timber, m.trim)}
      {stall(60, 20, m.timber, m.trim)}
      {basket(20, 0, m.wall)}
      {basket(48, 0, m.wall)}
      {barrel(80, 0, m.timber)}
      {/* Landmark: a well at the square's centre — Stortorget's real, still-standing well. */}
      <ellipse cx={W * 0.55} cy={2} rx={6} ry={2.4} fill="none" stroke={m.trim} strokeWidth={1.6} />
    </>
  );
}

export const stortorgetMarket: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 24, render: built },
    { height: 26, render: extended },
    { height: 28, render: landmark },
  ],
  ambient: ['flag'],
  workSpot: { dx: W * 0.4, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';
import { basket, cart } from '../shared/props';

/**
 * Birka's trading square — one of Scandinavia's earliest towns, c. 750–975 (SPEC §12.3).
 * An open market: a row of awning-covered stalls rather than a single building, which is
 * the honest shape for a trading square.
 */

const W = 90; // 2x1 footprint

function stall(x: number, w: number, wood: string, awning: string) {
  return (
    <g>
      <path d={wobbleLine(x, 0, x, 14, Math.round(x), 0.3)} stroke={wood} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(x + w, 0, x + w, 14, Math.round(x) + 1, 0.3)} stroke={wood} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <polygon points={`${x - 2},14 ${x + w + 2},14 ${x + w - 2},20 ${x + 2},20`} fill={awning} />
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 6)}
      {stall(4, 22, m.timber, m.trim)}
      {stall(34, 22, m.timber, m.trim)}
      {basket(20, 0, m.wall)}
      {cart(60, 0, m.timber, m.trim)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 6)}
      {stall(4, 22, m.timber, m.trim)}
      {stall(34, 22, m.timber, m.trim)}
      {stall(64, 22, m.timber, m.trim)}
      {basket(20, 0, m.wall)}
      {basket(48, 0, m.wall)}
      {cart(84, 0, m.timber, m.trim)}
      {/* Landmark: a market flag on a post, marking Birka's trading square as a named place. */}
      <path d={wobbleLine(2, 0, 2, 26, 71, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <polygon points="2,26 14,24 2,20" fill={m.trim} />
    </>
  );
}

export const tradingSquare: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 26, render: built },
    { height: 30, render: landmark },
  ],
  ambient: ['flag'],
  workSpot: { dx: W * 0.4, dy: 4 },
};

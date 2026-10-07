import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, windowGrid, wobbleLine } from '../shared/primitives';
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

/**
 * A narrow merchant house with a stepped gable — the row of tall, coloured facades around the
 * square (the red Schantzska house, its ochre neighbours) is what Stortorget is known for.
 * Drawn on a raised baseline, so it stands *behind* the stalls.
 */
function townhouse(x: number, w: number, h: number, fill: string, m: MaterialTokens, lit: number[]) {
  const base = 6;
  const top = base + h;
  const step = (t: number) => x + w * t;
  const gable = [
    [x, base], [x, top + 4], [step(0.16), top + 4], [step(0.16), top + 9], [step(0.32), top + 9], [step(0.32), top + 14],
    [step(0.42), top + 14], [step(0.42), top + 18], [step(0.58), top + 18], [step(0.58), top + 14], [step(0.68), top + 14],
    [step(0.68), top + 9], [step(0.84), top + 9], [step(0.84), top + 4], [x + w, top + 4], [x + w, base],
  ];
  return (
    <g>
      <polygon points={`${x + w},${base} ${x + w + 4},${base + 2.5} ${x + w + 4},${top + 6.5} ${x + w},${top + 4}`} fill={m.wallSide} />
      <polygon points={gable.map(([px, py]) => `${px},${py}`).join(' ')} fill={fill} />
      {windowGrid({ x: x + 2, y: base + 9, w: w - 4, h: h - 8, cols: 2, rows: 3, size: 3.4, glass: m.timber, glassLit: m.glassLit, lit })}
      <rect x={x + w / 2 - 2.5} y={base} width={5} height={8} fill={m.timber} />
    </g>
  );
}

/** The square's well, with its little roof on four posts. */
function well(x: number, m: MaterialTokens) {
  return (
    <g>
      <rect x={x - 6} y={0} width={12} height={6} fill={m.wallSide} />
      <path d={`M${x - 5} 6 V16 M${x + 5} 6 V16`} stroke={m.timber} strokeWidth={1.6} />
      <polygon points={`${x - 9},16 ${x},22 ${x + 9},16`} fill={m.roof} />
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 10)}
      {townhouse(30, 20, 30, m.wall, m, [1, 4])}
      {stall(4, 20, m.timber, m.trim)}
      {basket(20, 0, m.wall)}
      {cart(64, 0, m.timber, m.trim)}
    </>
  );
}

function extended(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 10)}
      {townhouse(22, 20, 30, m.wall, m, [1, 4])}
      {townhouse(43, 18, 36, m.trim, m, [0, 3, 5])}
      {stall(2, 18, m.timber, m.trim)}
      {stall(62, 18, m.timber, m.trim)}
      {basket(18, 0, m.wall)}
      {cart(86, 0, m.timber, m.trim)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 10, 10)}
      {townhouse(14, 20, 30, m.wall, m, [1, 4])}
      {townhouse(35, 18, 38, m.trim, m, [0, 3, 5])}
      {townhouse(54, 20, 32, m.glass, m, [2, 4])}
      {stall(-6, 18, m.timber, m.trim)}
      {stall(78, 18, m.timber, m.trim)}
      {basket(10, 0, m.wall)}
      {barrel(98, 0, m.timber)}
      {/* Landmark: the well at the square's centre — Stortorget's real, still-standing well. */}
      {well(W * 0.5, m)}
    </>
  );
}

export const stortorgetMarket: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 58, render: built },
    { height: 62, render: extended },
    { height: 64, render: landmark },
  ],
  ambient: ['flag'],
  workSpot: { dx: W * 0.4, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';

/**
 * Riddarholmen Church — the Swedish royal burial church, with its famous cast-iron openwork
 * spire added in 1841 after fire destroyed the original (SPEC §12.6). The lattice spire is
 * the one checkable, unmistakable feature, so it is drawn as an open diamond trellis rather
 * than a solid cone. `maxLevel` is 1, jumping straight from plot to landmark.
 *
 * The spire's flat iron-grey is this building's one colour outside `m` — cast iron, not the
 * era's brick-and-gold palette.
 */
const IRON = '#565B5E';

const W = 46;

function lattice(cx: number, baseY: number, h: number) {
  const rungs = 5;
  const lines = [];
  for (let i = 0; i < rungs; i += 1) {
    const t = i / (rungs - 1);
    const y = baseY + h * t;
    const hw = 9 * (1 - t * 0.8);
    lines.push(
      <g key={`rung-${i}`}>
        <path d={wobbleLine(cx - hw, y, cx, baseY + h * (t + 1 / rungs), 80 + i, 0.2)} stroke={IRON} strokeWidth={1} fill="none" />
        <path d={wobbleLine(cx + hw, y, cx, baseY + h * (t + 1 / rungs), 85 + i, 0.2)} stroke={IRON} strokeWidth={1} fill="none" />
      </g>,
    );
  }
  return (
    <g>
      <path d={wobbleLine(cx, baseY, cx, baseY + h, 79, 0.2)} stroke={IRON} strokeWidth={1.4} strokeLinecap="round" />
      {lines}
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 30;
  const rise = 18;
  const spireH = 30;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -2, y: wallH, w: W + 4, rise, roof: m.roof, roofSide: m.roofSide })}
      <path d={wobbleLine(W * 0.3, 0, W * 0.3, wallH * 0.6, 91, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {lattice(W * 0.5, wallH + rise, spireH)}
      <circle cx={W * 0.5} cy={wallH + rise + spireH + 3} r={2.4} fill={m.trim} />
    </>
  );
}

export const riddarholmen: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 84, render: landmark }],
  workSpot: { dx: W + 10, dy: 4 },
};

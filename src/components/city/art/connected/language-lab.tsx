import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The language lab — a guess at how the Swedish spoken in this city will sound (SPEC §12.8).
 * A small glass pavilion with a lit waveform strip standing in for its listening booths.
 * `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 40;

function landmark(m: MaterialTokens) {
  const wallH = 22;
  return (
    <>
      {shadow(W, 10)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 8, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH - 4, cols: 3, rows: 2, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [1, 4] })}
      {/* A small waveform strip above the door — the lab's one legible motif. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={W * 0.3 + i * 3} y={wallH + 1} width={1.6} height={2 + (i % 3) * 2} fill={m.trim} />
      ))}
      <path d={wobbleLine(W * 0.5, 0, W * 0.5, wallH * 0.4, 271, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

export const languageLab: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 38, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The language lab — a guess at how the Swedish spoken in this city will sound (SPEC §12.8).
 * A small glass pavilion with a lit waveform strip standing in for its listening booths.
 * `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 54;

function landmark(m: MaterialTokens) {
  const wallH = 28;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 9, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH - 6, cols: 4, rows: 2, size: 6, glass: m.glass, glassLit: m.glassLit, lit: [1, 4, 6] })}
      <rect x={W * 0.42} y={0} width={8} height={12} fill={m.timber} />
      {/* The lab's sign: a speech bubble with a waveform in it, on the roof. */}
      <rect x={6} y={wallH + 6} width={30} height={16} rx={6} fill={m.glass} />
      <polygon points={`12,${wallH + 7} 9,${wallH} 18,${wallH + 7}`} fill={m.glass} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const h = [3, 7, 10, 6, 9, 4][i];
        return <rect key={i} x={11 + i * 3.6} y={wallH + 14 - h / 2} width={2} height={h} rx={1} fill={m.trim} />;
      })}
      {/* A listening dish turned to the sky, for the voices of the future. */}
      <path d={wobbleLine(W * 0.82, wallH, W * 0.82, wallH + 10, 271, 0.2)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <path d={`M${W * 0.82 - 10} ${wallH + 22} Q${W * 0.82 - 4} ${wallH + 8} ${W * 0.82 + 9} ${wallH + 13} Z`} fill={m.glass} />
      <path d={`M${W * 0.82 - 1} ${wallH + 15} L${W * 0.82 + 4} ${wallH + 20}`} stroke={m.trim} strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}

export const languageLab: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 52, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

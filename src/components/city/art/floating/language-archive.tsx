import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The language archive — the words for sea and weather, gathered in one place (content
 * flavour). A small floating pavilion, raised slightly on stilts against the higher
 * waterline. `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 46;

function landmark(m: MaterialTokens) {
  const deck = 6;
  const cx = W / 2;
  return (
    <>
      {shadow(W + 8, 10)}
      {/* A pontoon ring it floats on, with a railing. */}
      <rect x={-6} y={0} width={W + 12} height={deck} rx={3} fill={m.wallSide} />
      <path d={`M-4 ${deck + 3} H${W + 4}`} stroke={m.timber} strokeWidth={0.8} strokeDasharray="1 3" />
      {/* The archive: a round tower of stacked reading floors, each ring a band of lit windows
          — shelves of words for sea and weather. */}
      {[0, 1, 2].map((i) => {
        const y = deck + i * 16;
        const w = W - i * 6;
        return (
          <g key={i}>
            <rect x={cx - w / 2} y={y} width={w} height={14} rx={3} fill={m.wall} />
            <rect x={cx + w / 2 - 6} y={y} width={6} height={14} rx={2} fill={m.wallSide} />
            {windowGrid({ x: cx - w / 2 + 3, y: y + 4, w: w - 10, h: 6, cols: 4, rows: 1, size: 3.5, glass: m.glass, glassLit: m.glassLit, lit: i === 1 ? [0, 2] : [1, 3] })}
            <rect x={cx - w / 2 - 1} y={y + 14} width={w + 2} height={2} fill={m.roof} />
          </g>
        );
      })}
      <path d={`M${cx - 10} ${deck + 48} Q${cx} ${deck + 58} ${cx + 10} ${deck + 48} Z`} fill={m.glass} />
      <path d={wobbleLine(cx, deck + 56, cx, deck + 64, 321, 0.2)} stroke={m.timber} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={cx} cy={deck + 65} r={2} fill={m.trim} />
    </>
  );
}

export const languageArchive: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 72, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

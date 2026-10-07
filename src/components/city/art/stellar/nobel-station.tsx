import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { dome, isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * The Nobel station — the Nobel Prize has been awarded since 1901; where it gets awarded
 * next is fiction (SPEC §12.8). A ceremonial glass hall, echoing the empire era's palace
 * symmetry but in stellar's night-glass vocabulary. `maxLevel` is 2: the hall, then the hall
 * crowned with a rotunda and the medal over its doors.
 */

const W = 92; // 2x1 footprint

function hall(m: MaterialTokens, wallH: number, lit: number[]) {
  return (
    <>
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 12, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: W * 0.08, y: wallH * 0.2, w: W * 0.84, h: wallH * 0.5, cols: 6, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit })}
      <path d={wobbleLine(W * 0.44, 0, W * 0.44, wallH * 0.4, 341, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(W * 0.56, 0, W * 0.56, wallH * 0.4, 342, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 14)}
      {hall(m, 34, [1, 4])}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 38;
  const cx = W * 0.5;
  const medalY = wallH * 0.62;
  return (
    <>
      {shadow(W + 10, 14)}
      {hall(m, wallH, [0, 1, 3, 4])}
      {/* Landmark: a glass rotunda over the hall, circled by a ring of light, and the medal —
          a gold disc in a laurel — over the doors. */}
      <rect x={cx - 18} y={wallH} width={36} height={14} fill={m.wall} />
      {windowGrid({ x: cx - 16, y: wallH + 3, w: 32, h: 8, cols: 5, rows: 1, size: 3.5, glass: m.glass, glassLit: m.glassLit, lit: [0, 2, 4] })}
      {dome(cx, wallH + 14, 18, m.glass, m.wallSide)}
      <ellipse cx={cx} cy={wallH + 20} rx={30} ry={5} fill="none" stroke={m.trim} strokeWidth={1.6} />
      <path d={wobbleLine(cx, wallH + 32, cx, wallH + 42, 344, 0.2)} stroke={m.timber} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={cx} cy={wallH + 43} r={2} fill={m.trim} />
      <circle cx={cx} cy={medalY} r={6} fill={m.trim} />
      <path
        d={`M${cx - 9} ${medalY - 4} Q${cx - 11} ${medalY + 4} ${cx - 4} ${medalY + 8} M${cx + 9} ${medalY - 4} Q${cx + 11} ${medalY + 4} ${cx + 4} ${medalY + 8}`}
        stroke={m.trim}
        strokeWidth={1.4}
        fill="none"
      />
      {[W * 0.06, W * 0.94].map((x) => (
        <rect key={x} x={x - 2} y={wallH} width={4} height={16} fill={m.glassLit} opacity={0.8} />
      ))}
    </>
  );
}

export const nobelStation: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 48, render: built },
    { height: 84, render: landmark },
  ],
  workSpot: { dx: W * 0.5, dy: 6 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * Stadshuset — Stockholm City Hall, built 1923 by architect Ragnar Östberg (SPEC §12.6):
 * National Romantic brick with a tall square tower crowned by three gilded crowns (Tre
 * Kronor, Sweden's national emblem) on a spire. `maxLevel` is 1, so this is industrial's
 * designated 2×2 landmark, jumping straight to landmark.
 *
 * The crowns' gold leaf is this building's one colour outside `m` — industrial's trim token
 * is SL blue, but the three crowns are specifically, famously gilded (CITY_VISUALS_BUILDINGS.md
 * §3's own example).
 */
const GOLD = '#D4AF37';

const W = 106;

function crown(cx: number, cy: number, r: number) {
  return (
    <g fill={GOLD}>
      <rect x={cx - r} y={cy} width={r * 2} height={r * 0.8} rx={2} />
      <polygon points={`${cx - r},${cy} ${cx - r * 0.5},${cy + r} ${cx},${cy} ${cx + r * 0.5},${cy + r} ${cx + r},${cy}`} />
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const bodyH = 40;
  const towerH = 78;
  const towerW = W * 0.24;
  const towerX = W * 0.62;
  return (
    <>
      {shadow(W, 24)}
      {isoBox({ x: 0, y: 0, w: W, h: bodyH, depth: 16, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: W * 0.06, y: bodyH * 0.2, w: W * 0.5, h: bodyH * 0.5, cols: 5, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit })}
      {/* The tower rises from the body, well past the size guide's ceiling — the landmark is
          allowed to break the tallest-thing rule (CITY_VISUALS_BUILDINGS.md §2). */}
      {isoBox({ x: towerX, y: bodyH, w: towerW, h: towerH, depth: 10, wall: m.wallSide, wallSide: m.wall })}
      {windowGrid({ x: towerX + 3, y: bodyH + towerH * 0.15, w: towerW - 6, h: towerH * 0.6, cols: 1, rows: 4, size: 4, glass: m.glass })}
      {/* A slender spire capped by the three crowns. */}
      <polygon points={`${towerX + 3},${bodyH + towerH} ${towerX + towerW - 3},${bodyH + towerH} ${towerX + towerW / 2},${bodyH + towerH + 20}`} fill={m.roof} />
      {crown(towerX + towerW / 2, bodyH + towerH + 22, 4)}
      <path d={wobbleLine(W * 0.2, 0, W * 0.2, bodyH * 0.4, 141, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

export const stadshuset: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [{ height: 170, render: landmark }],
  workSpot: { dx: W * 0.3, dy: 8 },
};

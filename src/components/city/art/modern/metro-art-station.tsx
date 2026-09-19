import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, windowGrid, wobbleLine } from '../shared/primitives';

/**
 * Art metro station — about 90 of the T-bana's 100 stations are decorated, "the world's
 * longest art gallery" (SPEC §12.6). The one unmistakable, checkable sign is the T-bana's
 * blue-on-white roundel; the platform entrance itself is a plain modern glass box with a
 * rough-hewn rock wall showing through, echoing the system's famous cave stations.
 * `maxLevel` is 2, going from a bare entrance to one with its mosaic mural lit.
 *
 * The roundel's SL blue is this building's one colour outside `m` — modern's trim token is
 * teal, but the T-bana sign is a fixed, specific blue everywhere in the real system
 * (CITY_VISUALS_BUILDINGS.md §2's Storkyrkan/Stadshuset-style hard requirement).
 */
const SL_BLUE = '#0072BC';

const W = 88; // 2x1 footprint

function roundel(cx: number, cy: number, r: number) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SL_BLUE} />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="#FFFFFF" strokeWidth={r * 0.22} />
      {/* The T, drawn as two strokes rather than a font glyph. */}
      <path d={`M${cx - r * 0.32} ${cy - r * 0.32} H${cx + r * 0.32} M${cx} ${cy - r * 0.32} V${cy + r * 0.32}`} stroke="#FFFFFF" strokeWidth={r * 0.22} strokeLinecap="round" />
    </g>
  );
}

function built(m: MaterialTokens) {
  const wallH = 22;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: W * 0.08, y: wallH * 0.15, w: W * 0.6, h: wallH * 0.6, cols: 5, rows: 1, size: 5, glass: m.glass })}
      {roundel(W * 0.85, wallH + 10, 9)}
      <path d={wobbleLine(W * 0.75, 0, W * 0.75, wallH * 0.7, 171, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 24;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: W * 0.08, y: wallH * 0.15, w: W * 0.6, h: wallH * 0.6, cols: 5, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [1, 3] })}
      {/* Landmark: the mosaic mural beside the entrance, a rough band of coloured tesserae —
          the "art gallery" this era's buildings are named for. */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={W * 0.08 + i * 4} y={wallH * 0.82} width={3} height={3} fill={i % 2 ? m.trim : m.glassLit} />
      ))}
      {roundel(W * 0.88, wallH + 12, 10)}
      <path d={wobbleLine(W * 0.75, 0, W * 0.75, wallH * 0.7, 171, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

export const metroArtStation: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 40, render: built },
    { height: 44, render: landmark },
  ],
  workSpot: { dx: W * 0.4, dy: 4 },
};

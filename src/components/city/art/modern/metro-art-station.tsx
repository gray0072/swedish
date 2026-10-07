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

/**
 * The cave: a platform hall blasted out of the bedrock and left raw, painted inside — the
 * look of T-Centralen's blue vines on white, the most photographed station in the system.
 */
function cave(x: number, w: number, m: MaterialTokens) {
  const h = 38;
  const archH = 26;
  // A dark mass of raw bedrock, taller than the hall, with a round-headed opening cut into it.
  const rock = `M${x - 3} 0 L${x - 2} ${h * 0.55} L${x + w * 0.1} ${h * 0.8} L${x + w * 0.28} ${h * 0.92} L${x + w * 0.5} ${h} L${x + w * 0.7} ${h * 0.93} L${x + w * 0.9} ${h * 0.78} L${x + w + 3} ${h * 0.52} L${x + w + 3} 0 Z`;
  const opening = `M${x + 8} 0 L${x + 8} ${archH * 0.55} Q${x + w / 2} ${archH * 1.25} ${x + w - 8} ${archH * 0.55} L${x + w - 8} 0 Z`;
  return (
    <g>
      <path d={rock} fill={m.roof} />
      <path d={`M${x + w * 0.18} ${h * 0.84} L${x + w * 0.3} ${h * 0.7} M${x + w * 0.62} ${h * 0.95} L${x + w * 0.7} ${h * 0.78} M${x + w * 0.84} ${h * 0.8} L${x + w * 0.9} ${h * 0.62}`} stroke={m.wallSide} strokeWidth={1.2} strokeLinecap="round" />
      <path d={opening} fill="#FFFFFF" opacity={0.92} />
      {/* Blue vines climbing the white walls, as in T-Centralen. */}
      <g stroke={SL_BLUE} strokeWidth={1.2} fill="none" strokeLinecap="round">
        {[0.3, 0.5, 0.7].map((t) => (
          <path key={t} d={`M${x + w * t} 0 Q${x + w * t - 3} ${archH * 0.3} ${x + w * t} ${archH * 0.55} Q${x + w * t + 3} ${archH * 0.75} ${x + w * t} ${archH * 0.9}`} />
        ))}
      </g>
      {[0.3, 0.5, 0.7].flatMap((t) => [
        <ellipse key={`${t}a`} cx={x + w * t - 2.5} cy={archH * 0.35} rx={1.8} ry={1} fill={SL_BLUE} />,
        <ellipse key={`${t}b`} cx={x + w * t + 2.5} cy={archH * 0.68} rx={1.8} ry={1} fill={SL_BLUE} />,
      ])}
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 24;
  return (
    <>
      {shadow(W + 26, 12)}
      {/* Landmark: the cave hall opened up beside the entrance, an escalator canopy, and the
          roundel raised on a pylon you can see from across the square. */}
      {cave(W * 0.5, W * 0.62, m)}
      {isoBox({ x: 0, y: 0, w: W * 0.52, h: wallH, depth: 10, wall: m.wall, wallSide: m.wallSide })}
      {windowGrid({ x: W * 0.05, y: wallH * 0.15, w: W * 0.42, h: wallH * 0.6, cols: 3, rows: 1, size: 5, glass: m.glass, glassLit: m.glassLit, lit: [0, 2] })}
      <polygon points={`-18,0 0,${wallH * 0.7} 0,${wallH * 0.85} -20,4`} fill={m.glass} opacity={0.8} />
      <path d={`M-19 2 L0 ${wallH * 0.78}`} stroke={m.trim} strokeWidth={1.2} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={W * 0.05 + i * 4} y={wallH * 0.82} width={3} height={3} fill={i % 2 ? m.trim : m.glassLit} />
      ))}
      <path d={wobbleLine(W * 1.16, 0, W * 1.16, 46, 172, 0.2)} stroke={m.timber} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      {roundel(W * 1.16, 54, 11)}
    </>
  );
}

export const metroArtStation: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 40, render: built },
    { height: 66, render: landmark },
  ],
  workSpot: { dx: W * 0.4, dy: 4 },
};

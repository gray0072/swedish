import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, upright, windowGrid } from '../shared/primitives';

/**
 * ABBA The Museum — opened in 2013 (SPEC §12.6): a small modern glass-and-concrete box on
 * the Djurgården museum strip, distinguished mainly by a lit signboard rather than a famous
 * silhouette. `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 60;

/** The mirror ball on a mast over the marquee: a sphere of glass facets catching the lights. */
function mirrorBall(cx: number, cy: number, roofY: number, m: MaterialTokens) {
  return (
    <g>
      <path d={`M${cx} ${cy - 7} V${roofY}`} stroke={m.timber} strokeWidth={1.6} />
      <circle cx={cx} cy={cy} r={7} fill={m.glass} />
      <path d={`M${cx - 7} ${cy} H${cx + 7} M${cx - 6} ${cy + 3.5} H${cx + 6} M${cx - 6} ${cy - 3.5} H${cx + 6} M${cx} ${cy - 7} V${cy + 7} M${cx - 3.5} ${cy - 6} V${cy + 6} M${cx + 3.5} ${cy - 6} V${cy + 6}`} stroke={m.wallSide} strokeWidth={0.6} />
      <circle cx={cx - 2.5} cy={cy + 2.5} r={1.6} fill="#FFFFFF" />
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 32;
  return (
    <>
      {shadow(W, 12)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 9, wall: m.wall, wallSide: m.wallSide })}
      {/* Vertical timber cladding, as on the real building's facade. */}
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => (
        <path key={t} d={`M${W * t} ${wallH * 0.62} V${wallH}`} stroke={m.wallSide} strokeWidth={1} />
      ))}
      {windowGrid({ x: 2, y: 2, w: W - 4, h: wallH * 0.55, cols: 5, rows: 1, size: 6, glass: m.glass, glassLit: m.glassLit, lit: [0, 1, 3, 4] })}
      <rect x={W * 0.42} y={0} width={W * 0.16} height={12} fill={m.glassLit} />
      {/* The marquee on the roof — the name in lights, the museum's one bright cue. */}
      <rect x={4} y={wallH + 3} width={W - 8} height={14} rx={2} fill={m.timber} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <circle key={i} cx={7 + i * ((W - 14) / 9)} cy={wallH + 15} r={0.9} fill={m.glassLit} />
      ))}
      {upright(
        wallH + 6,
        <text x={W / 2} y={wallH + 6} textAnchor="middle" fontSize={10} fontWeight={800} letterSpacing={1.5} fill={m.trim}>
          ABBA
        </text>,
      )}
      {mirrorBall(W * 0.82, wallH + 30, wallH + 17, m)}
    </>
  );
}

export const abbaMuseum: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 62, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

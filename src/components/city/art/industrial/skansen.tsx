import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, isoRoof, shadow, wobbleLine } from '../shared/primitives';
import { tree } from '../shared/props';

/**
 * Skansen — the world's first open-air museum, founded in 1891 (SPEC §12.6): a small cluster
 * of relocated historic farmhouses set among trees, not one building but a grouping of them.
 * `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 66;

/** A post mill: the whole body turns on its post to face the wind, sails in a cross. */
function windmill(x: number, m: MaterialTokens) {
  const hub = { x: x + 6, y: 40 };
  return (
    <g>
      <path d={`M${x + 6} 0 L${x + 6} 24 M${x} 0 L${x + 6} 14 L${x + 12} 0`} stroke={m.timber} strokeWidth={2} strokeLinecap="round" fill="none" />
      {isoBox({ x: x - 2, y: 24, w: 16, h: 18, depth: 5, wall: m.wall, wallSide: m.wallSide })}
      <polygon points={`${x - 4},42 ${x + 6},50 ${x + 16},42`} fill={m.roof} />
      <g stroke={m.timber} strokeWidth={2} strokeLinecap="round">
        <path d={`M${hub.x - 15} ${hub.y + 15} L${hub.x + 15} ${hub.y - 15} M${hub.x - 15} ${hub.y - 15} L${hub.x + 15} ${hub.y + 15}`} />
      </g>
      {[[-1, 1], [1, -1], [-1, -1], [1, 1]].map(([dx, dy]) => (
        <polygon
          key={`${dx}${dy}`}
          points={`${hub.x + dx * 5},${hub.y + dy * 5} ${hub.x + dx * 15},${hub.y + dy * 15} ${hub.x + dx * 15 + dy * 3},${hub.y + dy * 15 - dx * 3} ${hub.x + dx * 5 + dy * 3},${hub.y + dy * 5 - dx * 3}`}
          fill={m.glass}
          opacity={0.85}
        />
      ))}
      <circle cx={hub.x} cy={hub.y} r={2} fill={m.timber} />
    </g>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 12)}
      {/* Skansen is a village of buildings moved here from all over Sweden: a red farmhouse,
          Seglora's wooden church with its shingled spire, and a post mill. */}
      {windmill(W - 6, m)}
      {isoBox({ x: 22, y: 6, w: 16, h: 18, depth: 5, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: 21, y: 24, w: 18, rise: 9, depth: 5, roof: m.roof, roofSide: m.roofSide })}
      <rect x={27} y={30} width={6} height={10} fill={m.wall} />
      <polygon points="25.5,40 30,56 34.5,40" fill={m.roof} />
      {isoBox({ x: 0, y: 0, w: 22, h: 13, depth: 5, wall: m.wall, wallSide: m.wallSide })}
      {isoRoof({ x: -1, y: 13, w: 24, rise: 9, depth: 5, roof: m.roof, roofSide: m.roofSide })}
      {/* White-painted corners and a lit window — a Swedish red cottage, unmistakably. */}
      <path d="M0.8 0 V13 M21.2 0 V13" stroke={m.glass} strokeWidth={1.6} />
      <rect x={4} y={5} width={4} height={4} fill={m.glassLit} />
      <path d={wobbleLine(14, 0, 14, 8, 161, 0.3)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      {tree(-8, 0, 24, m.timber, m.roof)}
    </>
  );
}

export const skansen: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 58, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};

import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';

/**
 * The Vasa — capsized on her maiden voyage on 10 August 1628, salvaged in 1961 (SPEC §12.6).
 * The single most checkable fact about her silhouette is the towering, ornately carved and
 * gilded stern castle, far taller than the rest of the hull — that is what this drawing leads
 * with. `maxLevel` is 1, jumping straight to landmark.
 */

/** Gun port lids, painted red inside — the one colour this drawing takes from outside `m`. */
const PORT_RED = '#A8322A';

const W = 90; // 2x1 footprint

function mast(x: number, h: number, yards: number[], timber: string) {
  return (
    <g stroke={timber} strokeLinecap="round" fill="none">
      <path d={wobbleLine(x, 24, x, h, Math.round(x) + 133, 0.3)} strokeWidth={2.2} />
      {yards.map((y, i) => (
        <path key={y} d={`M${x - 10 + i * 2} ${y} L${x + 10 - i * 2} ${y}`} strokeWidth={1.4} />
      ))}
    </g>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 6, 16)}
      {/* The cradle she rests in: two timber chocks under the keel. */}
      <rect x={W * 0.22} y={0} width={8} height={4} fill={m.wallSide} />
      <rect x={W * 0.62} y={0} width={8} height={4} fill={m.wallSide} />
      {mast(W * 0.26, 74, [52, 66], m.timber)}
      {mast(W * 0.5, 92, [56, 74, 86], m.timber)}
      {mast(W * 0.72, 70, [50, 62], m.timber)}
      {/* Bowsprit, angled forward over the beakhead. */}
      <path d={`M${W * 0.06} 22 L${-14} 36`} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
      {/* The hull: a low waist between the forecastle and the towering stern. */}
      <path
        d={`M-6 18 L4 20 Q6 6 18 3 L${W * 0.78} 3 Q${W * 0.9} 6 ${W * 0.94} 20 L${W * 0.96} 50 L${W * 0.78} 46 L${W * 0.74} 34 L${W * 0.3} 27 L${W * 0.14} 28 L4 26 Z`}
        fill={m.timber}
      />
      {/* Two gun decks of ports along the side. */}
      {[0.22, 0.32, 0.42, 0.52, 0.62].map((t) => (
        <g key={t}>
          <rect x={W * t} y={9} width={4} height={3.4} fill={PORT_RED} />
          <rect x={W * t + 2} y={17} width={4} height={3.4} fill={PORT_RED} />
        </g>
      ))}
      {/* Gilded wales and the carved stern — the gold she was built to show off. */}
      <path d={`M6 22 Q${W * 0.4} 24 ${W * 0.76} 31`} stroke={m.trim} strokeWidth={1.6} fill="none" />
      <path d={`M14 6 Q${W * 0.5} 5 ${W * 0.86} 10`} stroke={m.trim} strokeWidth={1} fill="none" opacity={0.7} />
      <rect x={W * 0.8} y={30} width={W * 0.13} height={4} fill={m.trim} />
      <rect x={W * 0.82} y={38} width={W * 0.1} height={3} fill={m.trim} />
      <circle cx={W * 0.87} cy={45} r={2.6} fill={m.trim} />
      <path d={`M${W * 0.8} 34 L${W * 0.8} 44 M${W * 0.86} 34 L${W * 0.86} 41 M${W * 0.92} 34 L${W * 0.92} 46`} stroke={m.trim} strokeWidth={0.9} />
      {/* The lion figurehead on the beakhead. */}
      <circle cx={-3} cy={21} r={3.2} fill={m.trim} />
      {/* A long pennant from the main truck. */}
      <path d={`M${W * 0.5} 92 L${W * 0.5 + 18} 89 L${W * 0.5} 87 Z`} fill={m.trim} />
    </>
  );
}

export const vasaShip: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [{ height: 94, render: landmark }],
  workSpot: { dx: W * 0.15, dy: 4 },
};

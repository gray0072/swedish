import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow, wobbleLine } from '../shared/primitives';

/**
 * The Vasa — capsized on her maiden voyage on 10 August 1628, salvaged in 1961 (SPEC §12.6).
 * The single most checkable fact about her silhouette is the towering, ornately carved and
 * gilded stern castle, far taller than the rest of the hull — that is what this drawing leads
 * with. `maxLevel` is 1, jumping straight to landmark.
 */

const W = 90; // 2x1 footprint

function landmark(m: MaterialTokens) {
  const hullY = 8;
  const sternH = 46;
  return (
    <>
      {shadow(W, 16)}
      {/* Hull: a low curved boat shape, gun ports along the side. */}
      <path d={`M0 ${hullY} Q${W * 0.5} 0 ${W} ${hullY} L${W - 6} ${hullY + 10} L6 ${hullY + 10} Z`} fill={m.wallSide} />
      {[0.15, 0.32, 0.49, 0.66].map((t) => (
        <rect key={t} x={W * t} y={hullY + 3} width={5} height={4} fill={m.timber} />
      ))}
      {/* The stern castle: stacked, narrowing decks rising well above the hull. */}
      <rect x={W * 0.66} y={hullY} width={W * 0.3} height={sternH * 0.4} fill={m.wall} />
      <rect x={W * 0.7} y={hullY + sternH * 0.4} width={W * 0.22} height={sternH * 0.35} fill={m.wall} />
      <rect x={W * 0.74} y={hullY + sternH * 0.75} width={W * 0.14} height={sternH * 0.25} fill={m.wall} />
      {/* Gilded carving picked out on each deck — the stern's famous ornament. */}
      <path d={wobbleLine(W * 0.68, hullY + sternH * 0.4, W * 0.94, hullY + sternH * 0.4, 131, 0.3)} stroke={m.trim} strokeWidth={1.4} fill="none" />
      <path d={wobbleLine(W * 0.72, hullY + sternH * 0.75, W * 0.9, hullY + sternH * 0.75, 132, 0.3)} stroke={m.trim} strokeWidth={1.4} fill="none" />
      <circle cx={W * 0.87} cy={hullY + sternH * 0.9} r={3} fill={m.trim} />
      {/* Two masts, unrigged — she never sailed far enough to need it drawn busy. */}
      <path d={wobbleLine(W * 0.32, hullY, W * 0.32, hullY + 50, 133, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
      <path d={wobbleLine(W * 0.5, hullY, W * 0.5, hullY + 60, 134, 0.3)} stroke={m.timber} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

export const vasaShip: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [{ height: 68, render: landmark }],
  workSpot: { dx: W * 0.15, dy: 4 },
};

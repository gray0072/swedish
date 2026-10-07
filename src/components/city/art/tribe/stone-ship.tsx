import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow } from '../shared/primitives';

/**
 * Stone ship — modelled on Ales stenar in Skåne (SPEC §12.3): 59 boulders set in a ship
 * outline, a Bronze/Iron Age burial monument. This is tribe's designated 2×2 landmark
 * footprint, but the real monument is a waist-high ring of standing stones, not a tower —
 * so its silhouette stays low and wide rather than reaching for the 170-unit ceiling the
 * size guide allows. Faithfulness to the actual place wins over maximising height.
 */

const W = 96; // spans most of a 2x2 footprint's width
const DEPTH = 44;

/** One standing stone: an upright, round-shouldered block with its lit face toward the light.
 * Ales stenar's stones stand, they do not lie — drawn flat they read as pebbles. */
function boulder(cx: number, y: number, size: number, fill: string, side: string) {
  const w = size * 0.9;
  const h = size * 1.5;
  return (
    <g>
      <rect x={cx - w / 2} y={y} width={w} height={h} rx={w * 0.4} fill={side} />
      <rect x={cx - w / 2} y={y} width={w * 0.6} height={h} rx={w * 0.3} fill={fill} />
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const stones: Array<[number, number, number]> = [
    [8, DEPTH * 0.1, 9],
    [26, 2, 7],
    [50, 0, 6.5],
    [74, 2, 7],
    [88, DEPTH * 0.1, 9],
    [92, DEPTH * 0.55, 8],
    [70, DEPTH * 0.75, 6],
    [50, DEPTH * 0.85, 6],
    [30, DEPTH * 0.75, 6],
    [8, DEPTH * 0.55, 8],
  ];
  // The bow and stern stones (first and fifth/sixth) stand taller — the ship's prow shape.
  return (
    <>
      {shadow(W, DEPTH * 0.6)}
      {stones.map(([cx, y, size], i) => {
        const isEnd = i === 0 || i === 4 || i === 5;
        return (
          <g key={`stone-${i}`}>{boulder(cx, y, isEnd ? size * 1.4 : size, m.wall, m.wallSide)}</g>
        );
      })}
    </>
  );
}

export const stoneShip: BuildingArt = {
  footprint: { w: 2, h: 2 },
  levels: [{ height: 34, render: landmark }],
  workSpot: { dx: W / 2, dy: DEPTH * 0.4 },
};

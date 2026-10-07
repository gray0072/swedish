import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { shadow } from '../shared/primitives';

/**
 * The driverless metro — a guess: the announcements stay the same, you still have to
 * understand them (SPEC §12.8). A minimalist glass canopy over a platform entrance, no
 * driver's cab in sight, with a lit accent strip instead of a signboard. `maxLevel` is 2.
 */

const W = 84; // 2x1 footprint

const DECK = 20;

/** The elevated guideway: one slim beam on three pylons. */
function guideway(m: MaterialTokens) {
  return (
    <g>
      {[8, W * 0.5, W - 8].map((x) => (
        <rect key={x} x={x - 2.5} y={0} width={5} height={DECK} fill={m.wallSide} />
      ))}
      <rect x={-8} y={DECK} width={W + 16} height={4} fill={m.wall} />
      <rect x={-8} y={DECK + 4} width={W + 16} height={1} fill={m.trim} />
    </g>
  );
}

/** A driverless pod train: rounded both ends, no cab, a lit window band. */
function train(x: number, w: number, m: MaterialTokens) {
  return (
    <g>
      <rect x={x} y={DECK + 5} width={w} height={11} rx={5} fill={m.glass} />
      <rect x={x + 4} y={DECK + 9} width={w - 8} height={4} rx={2} fill={m.glassLit} />
      <rect x={x + 2} y={DECK + 6} width={w - 4} height={1.2} fill={m.trim} />
    </g>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 10)}
      {guideway(m)}
      {train(6, 40, m)}
      {/* Stairs up to the platform. */}
      <polygon points={`${W - 4},0 ${W + 10},0 ${W - 4},${DECK}`} fill={m.wallSide} />
    </>
  );
}

function landmark(m: MaterialTokens) {
  return (
    <>
      {shadow(W + 10, 10)}
      {/* Landmark: a glass station on the guideway, a lift tower, and a second train. */}
      <rect x={W + 2} y={0} width={9} height={DECK + 24} fill={m.wall} />
      <rect x={W + 4} y={DECK + 14} width={5} height={6} fill={m.glassLit} />
      {guideway(m)}
      <rect x={W * 0.5} y={DECK + 5} width={W * 0.48} height={18} fill={m.glass} opacity={0.55} />
      <path d={`M${W * 0.48} ${DECK + 23} Q${W * 0.74} ${DECK + 34} ${W} ${DECK + 23}`} fill={m.glass} />
      <path d={`M${W * 0.48} ${DECK + 23} Q${W * 0.74} ${DECK + 34} ${W} ${DECK + 23}`} stroke={m.trim} strokeWidth={1.2} fill="none" />
      {train(W * 0.52, 36, m)}
      {train(2, 30, m)}
    </>
  );
}

export const autoMetro: BuildingArt = {
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 36, render: built },
    { height: 56, render: landmark },
  ],
  ambient: ['rotor'],
  workSpot: { dx: W * 0.4, dy: 4 },
};

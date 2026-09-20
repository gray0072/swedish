import { WATER_LINE } from '../iso';

/**
 * Layer 2 (`horizon`) — the distant mainland, three fixed depth bands rising out of the far
 * shore and ending exactly at `WATER_LINE`, where the water starts. No parallax, no motion:
 * it exists purely to give the lake a far edge instead of a hard line between two gradients.
 *
 * Each band's `y` offsets are relative to the waterline, so moving the horizon moves the
 * mainland with it.
 */

const W = WATER_LINE;

const BANDS = [
  { d: `M0 ${W - 44} Q 240 ${W - 68} 470 ${W - 48} T 860 ${W - 56} T 1200 ${W - 40} V ${W + 8} H 0 Z`, opacity: 0.1 },
  { d: `M0 ${W - 26} Q 300 ${W - 44} 600 ${W - 28} T 1010 ${W - 34} T 1200 ${W - 24} V ${W + 8} H 0 Z`, opacity: 0.17 },
  { d: `M0 ${W - 10} Q 340 ${W - 22} 680 ${W - 12} T 1200 ${W - 9} V ${W + 8} H 0 Z`, opacity: 0.26 },
];

export default function Horizon() {
  return (
    <g aria-hidden="true">
      {BANDS.map((band) => (
        <path key={band.opacity} d={band.d} fill="var(--horizon)" opacity={band.opacity} />
      ))}
    </g>
  );
}

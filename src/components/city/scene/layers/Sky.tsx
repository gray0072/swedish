import { WATER_LINE } from '../iso';
import type { SceneTheme } from '../types';

const BIRD_CHEVRONS = [
  { y: 100, delay: 0 },
  { y: 150, delay: -14 },
];

/**
 * Layers 0 (`sky`) and 1 (`celestial`) — the two-stop vertical gradient, the sun/moon disc,
 * a drifting aurora band in the night eras, and the `birds` ambient emitter (CITY_VISUALS_LIFE.md
 * §7): 2-4 chevrons crossing on a slow loop. `active` gates every animated class the same way
 * every ambient layer does (CITY_VISUALS_MOTION.md §4) — off means the still, composed frame:
 * the aurora sits static at rest opacity, no birds cross.
 */
export default function Sky({ theme, eraId, active }: { theme: SceneTheme; eraId: string; active: boolean }) {
  const gradId = `sky-grad-${eraId}`;
  const isNight = theme.time === 'night';
  const celestialY = isNight ? 90 : 70;
  const celestialFill = isNight ? 'var(--trim)' : 'var(--glass-lit)';
  const hasAurora = theme.ambient.emitters.includes('aurora');
  const hasBirds = theme.ambient.emitters.includes('birds');

  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-0)" />
          <stop offset="100%" stopColor="var(--sky-1)" />
        </linearGradient>
      </defs>
      {/* Down to the waterline plus a little, so the water painted on top of it never leaves
          a hairline seam at the horizon. */}
      <rect x="0" y="0" width="1200" height={WATER_LINE + 20} fill={`url(#${gradId})`} />
      <circle cx="940" cy={celestialY} r={isNight ? 22 : 30} fill={celestialFill} opacity={isNight ? 0.9 : 0.5} />
      {hasAurora && (
        <path
          className={active ? 'ambient-aurora' : undefined}
          d="M120 140 Q 400 60 700 130 T 1120 110"
          fill="none"
          stroke="var(--trim)"
          strokeOpacity="0.35"
          strokeWidth="26"
          strokeLinecap="round"
        />
      )}
      {hasBirds && active && (
        <g className="ambient-birds">
          {BIRD_CHEVRONS.map((b, i) => (
            <path
              key={i}
              className="ambient-birds__flock"
              d={`M -40 ${b.y} l 8 -5 l 8 5 l 8 -5 l 8 5`}
              fill="none"
              stroke="var(--horizon)"
              strokeOpacity="0.45"
              strokeWidth="2"
              style={{ animationDelay: `${b.delay}s` }}
            />
          ))}
        </g>
      )}
    </g>
  );
}

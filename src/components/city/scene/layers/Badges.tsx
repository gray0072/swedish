/**
 * Layer 9 (`badges`) — the map's calls to action (CITY_VISUALS_BUILDINGS.md §5): what the
 * learner can do *right now*, readable at a glance without the cards below.
 *
 * - `upgrade` — a built building whose next level is affordable: a green arrow.
 * - `build` — a plot whose requirements are met and whose price is in the wallet: a gold plus.
 * - `saving` — a plot that is open but not yet affordable: a ring filling with coins, so the
 *   next goal is visible and so is how close it is.
 *
 * Drawn above the citizens so a passer-by never hides one. The badges that mean "you can act"
 * bob gently; the saving ring is still, so the map never nags about something not yet possible.
 */

export interface BadgeInstance {
  id: string;
  kind: 'upgrade' | 'build' | 'saving';
  x: number;
  /** The top of the building (or blueprint) the badge floats above. */
  y: number;
  /** 0–1 share of the price already in the wallet — `saving` only. */
  progress?: number;
}

const AURORA = '#3FBF9F';
const PINE = '#2F4A3C';
const GOLD = '#C8A24A';
const BIRCH = '#F6F2EA';

function ring(progress: number): string {
  // An arc from 12 o'clock, clockwise, `progress` of the way round.
  const r = 9;
  const p = Math.max(0.001, Math.min(0.999, progress));
  const angle = p * Math.PI * 2;
  const x = r * Math.sin(angle);
  const y = -r * Math.cos(angle);
  return `M 0 ${-r} A ${r} ${r} 0 ${p > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

export default function Badges({ badges, active }: { badges: BadgeInstance[]; active: boolean }) {
  return (
    <g aria-hidden="true" pointerEvents="none">
      {badges.map((badge) => (
        <g key={`${badge.id}-${badge.kind}`} transform={`translate(${badge.x.toFixed(1)} ${(badge.y - 18).toFixed(1)})`}>
          <g className={active && badge.kind !== 'saving' ? 'badge-bob' : undefined}>
            {badge.kind === 'saving' ? (
              <>
                <circle r={11} fill={BIRCH} fillOpacity={0.85} />
                <circle r={9} fill="none" stroke={PINE} strokeOpacity={0.18} strokeWidth={3} />
                <path d={ring(badge.progress ?? 0)} fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round" />
                {/* A coin in the middle: what the ring is filling with. */}
                <circle r={3.6} fill={GOLD} />
              </>
            ) : (
              <>
                {/* The pointer under the bubble, so it reads as attached to the building. */}
                <path d="M -4 9 L 0 16 L 4 9 Z" fill={badge.kind === 'upgrade' ? AURORA : GOLD} />
                <circle r={12} fill={badge.kind === 'upgrade' ? AURORA : GOLD} stroke={BIRCH} strokeWidth={2.2} />
                {badge.kind === 'upgrade' ? (
                  <path d="M 0 -6 L 6 1 L 2 1 L 2 6 L -2 6 L -2 1 L -6 1 Z" fill={BIRCH} />
                ) : (
                  <path d="M -1.8 -6.5 H 1.8 V -1.8 H 6.5 V 1.8 H 1.8 V 6.5 H -1.8 V 1.8 H -6.5 V -1.8 H -1.8 Z" fill={BIRCH} />
                )}
              </>
            )}
          </g>
        </g>
      ))}
    </g>
  );
}

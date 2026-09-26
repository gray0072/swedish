import type { AchievementStatus } from '@/store/achievements';

/**
 * Tier colours, in order: falu copper, silver, gold, aurora, aurora violet, flag blue — all
 * palette tokens (SPEC §11.2), spelled out in full so Tailwind keeps the classes.
 */
export const TIER_TEXT = [
  'text-falu dark:text-lingon',
  'text-granite/70 dark:text-birch/80',
  'text-gold',
  'text-aurora',
  'text-aurora-violet',
  'text-blue-flag dark:text-yellow-flag',
] as const;

export const TIER_BG = ['bg-falu', 'bg-granite/60', 'bg-gold', 'bg-aurora', 'bg-aurora-violet', 'bg-blue-flag'] as const;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
export function romanTier(tier: number): string {
  return ROMAN[tier - 1] ?? String(tier);
}

// A twelve-point rosette — the sunburst behind a fully completed medal.
const ROSETTE = Array.from({ length: 24 }, (_, i) => {
  const angle = (Math.PI * i) / 12 - Math.PI / 2;
  const r = i % 2 === 0 ? 31 : 25;
  return `${(32 + r * Math.cos(angle)).toFixed(2)},${(32 + r * Math.sin(angle)).toFixed(2)}`;
}).join(' ');

const RING_R = 29;
const RING_LEN = 2 * Math.PI * RING_R;

/**
 * An achievement as a medal: the disc takes the colour of the tier held, the ring around it
 * fills towards the next tier in that tier's colour, and a medal with every tier done gets a
 * rosette behind it. Locked medals are a dashed outline; a locked secret shows only "?".
 */
export default function AchievementMedal({
  status,
  size = 56,
  showRing = true,
}: {
  status: Pick<AchievementStatus, 'achievement' | 'tier' | 'value' | 'next' | 'prev'>;
  size?: number;
  showRing?: boolean;
}) {
  const { achievement, tier, value, next, prev } = status;
  const total = achievement.tiers.length;
  const complete = tier >= total;
  const hidden = achievement.secret && tier === 0;
  const colour = tier > 0 ? TIER_TEXT[tier - 1] : 'text-granite/40 dark:text-birch/30';
  const nextColour = TIER_TEXT[Math.min(tier, TIER_TEXT.length - 1)];
  const fraction = complete ? 1 : next ? Math.max(0, Math.min(1, (value - prev) / (next - prev))) : 0;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full overflow-visible">
        {complete && (
          <polygon points={ROSETTE} className={colour + ' origin-center animate-[spin_40s_linear_infinite] motion-reduce:animate-none'} fill="currentColor" opacity={0.28} />
        )}
        {showRing && !complete && (
          <>
            <circle cx="32" cy="32" r={RING_R} fill="none" strokeWidth="3" className="stroke-granite/15 dark:stroke-white/10" />
            {fraction > 0 && (
              <circle
                cx="32"
                cy="32"
                r={RING_R}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                className={nextColour + ' transition-[stroke-dashoffset] duration-500'}
                strokeDasharray={RING_LEN}
                strokeDashoffset={RING_LEN * (1 - fraction)}
                transform="rotate(-90 32 32)"
              />
            )}
          </>
        )}
        {tier > 0 ? (
          <g className={colour}>
            <circle cx="32" cy="32" r="24" fill="currentColor" />
            <circle cx="32" cy="32" r="19.5" className="fill-birch dark:fill-midnight-surface" />
            {/* The stitched inner rim, like the border on a woven band. */}
            <circle cx="32" cy="32" r="21.8" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="1.2 2.4" />
          </g>
        ) : (
          <circle
            cx="32"
            cy="32"
            r="22"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="stroke-granite/40 dark:stroke-birch/30"
          />
        )}
      </svg>
      <span
        className={
          'relative select-none leading-none ' + (tier > 0 ? '' : 'opacity-45 grayscale')
        }
        style={{ fontSize: size * 0.4 }}
      >
        {hidden ? <span className="font-display font-bold text-granite/60 dark:text-birch/50">?</span> : achievement.icon}
      </span>
      {tier > 0 && total > 1 && (
        <span
          className={
            'absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[10px] font-bold leading-4 text-white shadow-sm ' +
            TIER_BG[tier - 1]
          }
        >
          {romanTier(tier)}
        </span>
      )}
    </span>
  );
}

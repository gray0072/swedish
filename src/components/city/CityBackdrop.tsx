import type { Era } from '@/content/schema';

/**
 * The shoreline and island are constant across every era (SPEC §11.5) — only the palette
 * shifts. This is what makes six eras read as one place across time rather than six
 * unrelated illustrations.
 */
export default function CityBackdrop({ era }: { era: Era }) {
  const gradId = `sky-${era.id}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={era.palette.primary} stopOpacity="0.18" />
          <stop offset="100%" stopColor={era.palette.primary} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${gradId})`} />
      {/* Mälaren water */}
      <path
        d="M0 62 Q 15 58 30 62 T 60 62 T 100 60 V100 H0 Z"
        fill="#3FBF9F"
        fillOpacity="0.12"
      />
      <path
        d="M0 68 Q 20 64 40 68 T 100 66 V100 H0 Z"
        fill="#006AA7"
        fillOpacity="0.10"
      />
      {/* Stadsholmen — the island the city grows on, same silhouette every era */}
      <path
        d="M22 66 Q 20 50 35 44 Q 50 38 62 45 Q 78 50 76 64 Q 72 74 50 74 Q 30 74 22 66 Z"
        fill={era.palette.primary}
        fillOpacity="0.14"
        stroke={era.palette.accent}
        strokeOpacity="0.35"
        strokeWidth="0.4"
      />
    </svg>
  );
}

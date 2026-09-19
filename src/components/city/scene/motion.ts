/**
 * Motion tier resolution (CITY_VISUALS_MOTION.md §4). Three ways motion gets turned down, in
 * precedence order — `prefers-reduced-motion` always wins and is never overridable by the
 * setting, which is why this is a pure function rather than something read once at startup.
 */
export type MotionTier = 'full' | 'calm' | 'off';

export function resolveMotionTier(setting: MotionTier, prefersReducedMotion: boolean): MotionTier {
  return prefersReducedMotion ? 'off' : setting;
}

/** Only `full` runs the ambient layer (CITY_VISUALS_MOTION.md §1's table: calm and off are both "Off"). */
export function ambientEnabled(tier: MotionTier): boolean {
  return tier === 'full';
}

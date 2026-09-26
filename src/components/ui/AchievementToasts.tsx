import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import {
  claimPendingAchievements,
  useAchievementStatuses,
  type AchievementStatus,
} from '@/store/achievements';
import { resolveLocalized } from '@/content/schema';
import { playAchievement } from '@/lib/sound';
import AchievementMedal, { romanTier } from './AchievementMedal';
import { useRevealOpen } from './AchievementReveal';

type Toast =
  | { kind: 'one'; key: string; status: AchievementStatus; coins: number }
  | { kind: 'many'; key: string; count: number; coins: number };

const SHOW_MS = 4500;
// More fresh tiers than this at once (an old save meeting achievements, a cloud merge) are
// announced as one summary instead of a queue the learner would wait a minute to clear.
const MAX_SINGLE = 3;

/**
 * Watches the achievements, claims every freshly reached tier (which pays its coins) and
 * announces it. The end of a quiz claims its own unlocks first and celebrates them on the
 * result screen (AchievementReveal), so those never arrive here as toasts. Rendered once in the app shell; being its own component keeps its
 * re-renders — one per answer while a quiz runs — away from the page underneath.
 */
export default function AchievementToasts() {
  const t = useT();
  const lang = useLanguage();
  const statuses = useAchievementStatuses();
  const [queue, setQueue] = useState<Toast[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    if (!statuses.some((s) => s.liveTier > s.storedTier)) return;
    const unlocks = claimPendingAchievements();
    if (unlocks.length === 0) return;
    const toasts: Toast[] =
      unlocks.length > MAX_SINGLE
        ? [
            {
              kind: 'many',
              key: `t${counter.current++}`,
              count: unlocks.reduce((n, u) => n + u.to - u.from, 0),
              coins: unlocks.reduce((n, u) => n + u.coins, 0),
            },
          ]
        : unlocks.map((u) => ({
            kind: 'one',
            key: `t${counter.current++}`,
            status: { ...statuses.find((s) => s.achievement.id === u.id)!, tier: u.to },
            coins: u.coins,
          }));
    setQueue((q) => [...q, ...toasts]);
  }, [statuses]);

  // A full-screen reveal owns the moment; toasts wait underneath it instead of expiring unseen.
  const revealOpen = useRevealOpen((s) => s.open);
  const current = revealOpen ? undefined : queue[0];

  useEffect(() => {
    if (!current) return;
    playAchievement();
    const timer = window.setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  if (!current) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <Link
        key={current.key}
        to="/stats"
        onClick={() => setQueue((q) => q.slice(1))}
        className="card pointer-events-auto flex w-full max-w-sm animate-bounce-in items-center gap-3 !p-3 shadow-lg"
      >
        {current.kind === 'one' ? (
          <AchievementMedal status={current.status} size={48} showRing={false} />
        ) : (
          <span className="text-3xl leading-none" aria-hidden="true">
            🏅
          </span>
        )}
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gold">
            {t('achievements.unlocked')}
          </span>
          <span className="block truncate text-sm font-semibold">
            {current.kind === 'one'
              ? resolveLocalized(current.status.achievement.name, lang) +
                (current.status.achievement.tiers.length > 1 ? ` ${romanTier(current.status.tier)}` : '')
              : t('achievements.manyUnlocked', { count: current.count })}
          </span>
        </span>
        <span className="shrink-0 text-sm font-bold text-falu dark:text-gold">+{current.coins} 🪙</span>
      </Link>
    </div>
  );
}

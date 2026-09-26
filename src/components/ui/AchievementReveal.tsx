import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { useAchievementStatuses, type AchievementUnlock } from '@/store/achievements';
import { resolveLocalized } from '@/content/schema';
import { describeAchievement } from '@/achievements/describe';
import { playAchievement } from '@/lib/sound';
import AchievementMedal, { romanTier, TIER_BG, TIER_TEXT } from './AchievementMedal';

// Sixteen rays behind the medal, alternating long and short.
const RAYS = Array.from({ length: 16 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 16;
  const spread = Math.PI / 32;
  const r = i % 2 === 0 ? 100 : 72;
  const p = (angle: number, radius: number) =>
    `${(100 + radius * Math.cos(angle)).toFixed(1)},${(100 + radius * Math.sin(angle)).toFixed(1)}`;
  return `M100,100 L${p(a - spread, r)} L${p(a + spread, r)} Z`;
}).join(' ');

// Where the sparks land, relative to the medal's centre — the same throw as the coin burst.
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 12 + (i % 2) * 0.2;
  const d = i % 3 === 0 ? 130 : 100;
  return { dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d), glyph: i % 2 ? '✦' : '✧' };
});

/** True while a reveal is on screen — AchievementToasts holds its queue until it closes. */
export const useRevealOpen = create<{ open: boolean }>(() => ({ open: false }));

/**
 * The end-of-lesson ceremony for every achievement tier the run earned — one full screen per
 * unlock, Duolingo-style: the medal spins in over turning rays, sparks fly off, the tier pips
 * fill, and "Continue" moves to the next one. Enter, Space and Escape work too, and every
 * movement stops under `prefers-reduced-motion`.
 */
export default function AchievementReveal({
  unlocks,
  startAt = 0,
  onClose,
}: {
  unlocks: AchievementUnlock[];
  startAt?: number;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useLanguage();
  const statuses = useAchievementStatuses();
  const [index, setIndex] = useState(startAt);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    useRevealOpen.setState({ open: true });
    return () => useRevealOpen.setState({ open: false });
  }, []);

  const unlock = unlocks[index];
  const status = statuses.find((s) => s.achievement.id === unlock?.id);

  useEffect(() => {
    if (!unlock) return;
    playAchievement();
    button.current?.focus();
  }, [unlock]);

  const advance = () => (index + 1 < unlocks.length ? setIndex(index + 1) : onClose());

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!unlock || !status) return null;

  const { achievement } = status;
  const total = achievement.tiers.length;
  const tier = unlock.to;
  const colour = TIER_TEXT[tier - 1];
  const title = achievement.secret && unlock.from === 0
    ? t('reveal.secret')
    : unlock.from > 0
      ? t('reveal.levelUp', { tier: romanTier(tier) })
      : t('reveal.new');
  const nextGoal = tier < total ? describeAchievement(achievement, tier, lang) : null;
  // It follows a colon, so it continues the sentence: "Next level: study 7 days in a row."
  const next = nextGoal && nextGoal.charAt(0).toLocaleLowerCase(lang) + nextGoal.slice(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={resolveLocalized(achievement.name, lang)}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-birch/95 px-4 backdrop-blur-sm dark:bg-midnight/95"
    >
      {/* key: every unlock replays the whole entrance from scratch. */}
      <div key={index} className="flex w-full max-w-sm flex-col items-center text-center">
        <p
          className={'animate-rise-in text-sm font-bold uppercase tracking-[0.2em] ' + colour}
          style={{ animationDelay: '100ms' }}
        >
          {title}
        </p>

        <div className="relative my-4 flex h-64 w-64 items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className={'absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite] motion-reduce:animate-none ' + colour}
            aria-hidden="true"
          >
            <path d={RAYS} fill="currentColor" opacity="0.22" />
          </svg>
          <span
            className={'absolute h-40 w-40 rounded-full opacity-30 blur-2xl ' + TIER_BG[tier - 1]}
            aria-hidden="true"
          />
          <span
            className={
              'absolute h-36 w-36 animate-ping rounded-full opacity-20 [animation-iteration-count:2] motion-reduce:hidden ' +
              TIER_BG[tier - 1]
            }
            style={{ animationDelay: '600ms' }}
            aria-hidden="true"
          />
          <span className="animate-medal-in motion-reduce:animate-none" style={{ animationDelay: '150ms' }}>
            <AchievementMedal status={{ ...status, tier }} size={150} showRing={false} />
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 motion-reduce:hidden">
            {SPARKS.map(({ dx, dy, glyph }, i) => (
              <span
                key={i}
                className={'absolute -ml-2 -mt-3 animate-coin-fly text-xl opacity-0 ' + (i % 2 ? colour : 'text-gold')}
                style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${550 + i * 35}ms` } as React.CSSProperties}
              >
                {glyph}
              </span>
            ))}
          </span>
        </div>

        <h2 className="animate-rise-in font-display text-3xl font-semibold" style={{ animationDelay: '500ms' }}>
          {resolveLocalized(achievement.name, lang)}
          {total > 1 && <span className={colour}> {romanTier(tier)}</span>}
        </h2>
        <p
          className="mt-1 animate-rise-in text-sm text-granite dark:text-birch/70"
          style={{ animationDelay: '600ms' }}
        >
          {describeAchievement(achievement, tier - 1, lang)}
        </p>

        {total > 1 && (
          <div className="mt-4 flex gap-1.5" aria-label={t('achievements.tiersLabel', { tier, total })}>
            {achievement.tiers.map((threshold, i) => (
              <span
                key={threshold}
                className={
                  'h-2 w-7 rounded-full ' +
                  (i < tier ? TIER_BG[i] : 'bg-granite/15 dark:bg-white/10') +
                  (i >= unlock.from && i < tier ? ' animate-pop-in' : '')
                }
                style={i >= unlock.from && i < tier ? { animationDelay: `${800 + (i - unlock.from) * 180}ms` } : undefined}
              />
            ))}
          </div>
        )}

        <p
          className="mt-4 animate-bounce-in text-2xl font-bold text-falu dark:text-gold"
          style={{ animationDelay: '900ms' }}
        >
          +{unlock.coins} 🪙
        </p>

        <p className="mt-2 min-h-[2.5rem] animate-rise-in text-xs text-granite dark:text-birch/60" style={{ animationDelay: '1000ms' }}>
          {/* A one-off has no levels to speak of; only a finished ladder gets the "top" line. */}
          {next ? t('reveal.next', { goal: next }) : total > 1 ? t('reveal.maxed') : null}
        </p>

        <button
          ref={button}
          onClick={advance}
          className="btn-primary mt-4 w-full animate-rise-in justify-center"
          style={{ animationDelay: '1100ms' }}
        >
          {index + 1 < unlocks.length ? t('reveal.next.button') : t('reveal.continue')}
        </button>
        {unlocks.length > 1 && (
          <p className="mt-2 text-xs tabular-nums text-granite dark:text-birch/50">
            {t('reveal.counter', { index: index + 1, total: unlocks.length })}
          </p>
        )}
      </div>
    </div>
  );
}

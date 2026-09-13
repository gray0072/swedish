import type { LucideIcon } from 'lucide-react';
import {
  CalendarCheck,
  Coins,
  Gift,
  Layers,
  Lightbulb,
  RotateCcw,
  Snowflake,
  Sparkles,
  Star,
} from 'lucide-react';
import type { Perk, PerkType } from '@/content/schema';
import { useT } from '@/i18n';
import { usePerks } from '@/store/city';
import type { PerkTotals } from '@/city/perks';

/**
 * One place decides how a perk looks and reads, so a building card and the bonus panel can
 * never disagree about what a perk does (SPEC §8.4). Each entry carries the icon plus the
 * i18n keys for a short name and a full sentence describing the effect — the sentence is what
 * makes the bonus understandable without a tooltip.
 */
const PERK_UI: Record<PerkType, { icon: LucideIcon; tone: string }> = {
  xpMultiplier: { icon: Star, tone: 'text-gold' },
  coinMultiplier: { icon: Coins, tone: 'text-gold' },
  dailyIncome: { icon: CalendarCheck, tone: 'text-pine dark:text-aurora' },
  extraReviewSlots: { icon: Layers, tone: 'text-pine dark:text-aurora' },
  reviewBonus: { icon: Gift, tone: 'text-falu dark:text-gold' },
  streakFreeze: { icon: Snowflake, tone: 'text-blue-flag dark:text-aurora' },
  hintToken: { icon: Lightbulb, tone: 'text-gold' },
  retryToken: { icon: RotateCcw, tone: 'text-falu dark:text-gold' },
  cosmetic: { icon: Sparkles, tone: 'text-granite dark:text-birch/60' },
};

/** Percentage perks are stored as fractions (0.03) but read as percents (+3%). */
function displayValue(type: PerkType, value: number): number {
  const isPercent = type === 'xpMultiplier' || type === 'coinMultiplier';
  return isPercent ? Math.round(value * 100) : Math.round(value * 100) / 100;
}

export function perkEffectKey(type: PerkType) {
  return `perk.${type}.effect` as const;
}

/**
 * The perk line on a building card: icon plus a full sentence ("+3% XP from every quiz"),
 * so the card never shows a bare number whose meaning the learner has to guess.
 */
export function PerkLine({ perk, level }: { perk: Perk; level: number }) {
  const t = useT();
  const { icon: Icon, tone } = PERK_UI[perk.type];
  const perLevel = perk.type === 'cosmetic' ? 0 : perk.valuePerLevel;
  const owned = Math.max(level, 1);

  return (
    <p className="flex items-start gap-1.5 text-xs font-semibold text-falu dark:text-gold">
      <Icon size={14} className={`mt-0.5 shrink-0 ${tone}`} aria-hidden="true" />
      <span>
        {t(perkEffectKey(perk.type) as never, { value: displayValue(perk.type, perLevel * owned) })}
        {level > 1 && perk.type !== 'cosmetic' && (
          <span className="font-normal text-granite dark:text-birch/50">
            {' '}
            ({t('city.level')} {level})
          </span>
        )}
      </span>
    </p>
  );
}

/** Rows of the bonus panel: only perks the learner actually has, in a fixed reading order. */
function activeRows(perks: PerkTotals): Array<{ type: PerkType; value: number }> {
  const rows: Array<{ type: PerkType; value: number }> = [
    { type: 'xpMultiplier', value: perks.xpMultiplier - 1 },
    { type: 'coinMultiplier', value: perks.coinMultiplier - 1 },
    { type: 'dailyIncome', value: perks.dailyIncome },
    { type: 'reviewBonus', value: perks.reviewBonus },
    { type: 'extraReviewSlots', value: perks.extraReviewSlots },
    { type: 'hintToken', value: perks.hintTokens },
    { type: 'retryToken', value: perks.retryTokens },
    { type: 'streakFreeze', value: perks.streakFreeze },
  ];
  return rows.filter((r) => r.value > 0.0001);
}

/**
 * The city's total bonuses, shown on both the home screen and the city map so the learner
 * can always see what the buildings are actually doing for them.
 */
export default function PerkPanel({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const perks = usePerks();
  const rows = activeRows(perks);

  return (
    <section className="card">
      <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-granite dark:text-birch/50">
        <Sparkles size={13} aria-hidden="true" /> {t('perks.title')}
      </h2>

      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-granite dark:text-birch/70">{t('perks.empty')}</p>
      ) : (
        <>
          {!compact && (
            <p className="mt-1 text-xs text-granite dark:text-birch/60">{t('perks.subtitle')}</p>
          )}
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {rows.map(({ type, value }) => {
              const { icon: Icon, tone } = PERK_UI[type];
              return (
                <li key={type} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-granite/10 dark:bg-white/10 ${tone}`}
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {t(`perk.${type}.label` as never)}
                    </span>
                    <span className="block text-xs text-granite dark:text-birch/60">
                      {t(perkEffectKey(type) as never, { value: displayValue(type, value) })}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

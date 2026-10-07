import { Link } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import type { Building } from '@/content/schema';
import { resolveLocalized } from '@/content/schema';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { useAllLessonProgress } from '@/store/progress';
import { findNextOpenLesson, getBuilding, lessonPath } from '@/content/registry';
import { lessonsToEarn } from '@/city/economy';
import { fillCount } from '@/achievements/describe';
import { formatNumber } from '@/lib/format';
import { PerkLine } from './PerkDisplay';
import { BuildingIcon, iconFor } from './icons';
import { useBuildAction } from './useBuildAction';

/** Filled dots for built levels, hollow for the rest — the level read at a glance. */
export function LevelPips({ level, maxLevel }: { level: number; maxLevel: number }) {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      {Array.from({ length: maxLevel }, (_, i) => (
        <span
          key={i}
          className={
            'h-2.5 w-2.5 rounded-full border ' +
            (i < level ? 'border-pine bg-pine dark:border-aurora dark:bg-aurora' : 'border-granite/40 dark:border-birch/30')
          }
        />
      ))}
    </span>
  );
}

/** A bar of the wallet against a price, gold once it is full. */
export function CoinProgress({ coins, cost }: { coins: number; cost: number }) {
  const share = Math.max(0, Math.min(1, coins / cost));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-granite/15 dark:bg-white/10"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={cost}
      aria-valuenow={Math.min(coins, cost)}
    >
      <div
        className={'h-full rounded-full transition-[width] duration-700 ' + (share >= 1 ? 'bg-gold' : 'bg-falu/70 dark:bg-gold/70')}
        style={{ width: `${share * 100}%` }}
      />
    </div>
  );
}

/**
 * The building picked on the map, under the map: what it does now, what the next level adds,
 * how far the wallet is from it — and the button, right there, so the place where the learner
 * *sees* the building is also where they build it. While it is open the map previews the next
 * level in place. When the coins are short, the way to earn them is one tap away.
 */
export default function MapBuildingPanel({
  building,
  preview,
  onTogglePreview,
  onSelect,
}: {
  building: Building;
  preview: boolean;
  onTogglePreview: () => void;
  onSelect: (id: string | null) => void;
}) {
  const t = useT();
  const lang = useLanguage();
  const progress = useAllLessonProgress();
  const { level, atMax, cost, missingRequirement, canAfford, coins, build } = useBuildAction(building);
  const nextLesson = canAfford || atMax ? undefined : findNextOpenLesson((id) => Boolean(progress[id]?.passed));
  const short = cost - coins;
  const requirement = missingRequirement ? getBuilding(missingRequirement) : undefined;

  return (
    <section className="card animate-rise-in space-y-3" aria-label={resolveLocalized(building.name, lang)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-granite/10 text-falu dark:bg-white/10 dark:text-gold">
            <BuildingIcon icon={iconFor(building.id)} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="sv-word truncate text-base">{resolveLocalized(building.name, lang)}</p>
            <p className="flex items-center gap-2 text-[11px] text-granite dark:text-birch/50">
              <LevelPips level={level} maxLevel={building.maxLevel} />
              {t('city.level')} {level}/{building.maxLevel}
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="rounded-full p-1 text-granite hover:bg-granite/10 dark:text-birch/60 dark:hover:bg-white/10"
          aria-label={t('city.panel.close')}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {building.description && (
        <p className="text-xs text-granite dark:text-birch/60">{resolveLocalized(building.description, lang)}</p>
      )}

      <div className="grid gap-1.5 sm:grid-cols-2">
        {level > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-granite/70 dark:text-birch/40">{t('city.panel.now')}</p>
            <PerkLine perk={building.perk} level={level} />
          </div>
        )}
        {!atMax && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-granite/70 dark:text-birch/40">
              {level === 0 ? t('city.panel.whenBuilt') : t('city.panel.next', { level: level + 1 })}
            </p>
            <PerkLine perk={building.perk} level={level + 1} />
          </div>
        )}
      </div>

      {requirement ? (
        <p className="text-xs text-granite dark:text-birch/60">
          {t('city.requires')}:{' '}
          <button className="font-semibold text-falu underline dark:text-gold" onClick={() => onSelect(requirement.id)}>
            {resolveLocalized(requirement.name, lang)}
          </button>
        </p>
      ) : atMax ? (
        <p className="text-sm font-semibold text-pine dark:text-aurora">★ {t('city.panel.maxed')}</p>
      ) : (
        <div className="space-y-2">
          <CoinProgress coins={coins} cost={cost} />
          <p className="flex flex-wrap justify-between gap-x-3 text-xs text-granite dark:text-birch/60">
            <span className="font-semibold tabular-nums">
              {formatNumber(Math.min(coins, cost))} / {formatNumber(cost)} 🪙
            </span>
            <span>
              {canAfford
                ? t('city.panel.ready')
                : `${t('city.panel.toGo', { coins: formatNumber(short) })} · ${fillCount(t('city.panel.lessons'), lessonsToEarn(short), lang)}`}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary flex-1" disabled={!canAfford} onClick={build}>
              {level === 0 ? t('city.build') : t('city.panel.upgradeTo', { level: level + 1 })} · {formatNumber(cost)} 🪙
            </button>
            {nextLesson && (
              <Link to={lessonPath(nextLesson)} className="btn-secondary flex-1 text-center">
                {t('city.panel.earn')} →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {!atMax && !requirement ? (
          <button
            onClick={onTogglePreview}
            aria-pressed={preview}
            className={
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ' +
              (preview
                ? 'border-gold bg-gold/15 text-falu dark:text-gold'
                : 'border-granite/25 text-granite dark:border-white/15 dark:text-birch/60')
            }
          >
            <Eye size={13} aria-hidden="true" /> {t('city.panel.preview')}
          </button>
        ) : (
          <span />
        )}
        <button
          className="font-semibold text-falu hover:underline dark:text-gold"
          onClick={() => document.getElementById(`building-${building.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          {t('city.panel.details')} ↓
        </button>
      </div>
    </section>
  );
}

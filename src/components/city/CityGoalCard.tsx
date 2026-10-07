import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { useWallet } from '@/store/wallet';
import { useCityBuildingLevels, useCurrentEra, useOwnedBuildingCount, totalBuildingsCount } from '@/store/city';
import { getBuildings, getEras } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { buildingCostAt, lessonsToEarn } from '@/city/economy';
import { findBuyableBuilding, findSavingGoal } from '@/city/progress';
import { fillCount } from '@/achievements/describe';
import { formatNumber } from '@/lib/format';
import { BuildingIcon, iconFor } from './icons';
import { CoinProgress } from './MapBuildingPanel';

/**
 * The home screen's way into the city, led by a goal rather than a count: the building the
 * learner can buy right now, or else the nearest one they are saving for, with the wallet
 * against its price and roughly how many lessons are left to it. The goal is what turns
 * "another lesson" into "the smithy, two lessons from now".
 */
export default function CityGoalCard() {
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const levels = useCityBuildingLevels();
  const era = useCurrentEra();
  const owned = useOwnedBuildingCount();

  const eras = getEras();
  const buildings = getBuildings();
  const buyable = findBuyableBuilding(eras, buildings, levels, wallet.xp, wallet.coins);
  const saving = buyable ? undefined : findSavingGoal(eras, buildings, levels, wallet.xp, wallet.coins);
  const goal = buyable ?? saving?.building;
  const cost = buyable ? buildingCostAt(buyable, levels[buyable.id] ?? 0) : saving?.cost ?? 0;
  const short = cost - wallet.coins;

  return (
    <Link
      to={goal ? `/city?building=${goal.id}` : '/city'}
      className="card card-hover block space-y-3 hover:border-falu/40"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-granite dark:text-birch/50">
            <Landmark size={13} aria-hidden="true" /> {t('home.city.title')}
          </p>
          <p className="mt-1 text-lg font-semibold">{resolveLocalized(era.name, lang)}</p>
          <p className="text-sm text-granite dark:text-birch/70">
            {owned}/{totalBuildingsCount()}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-falu dark:text-gold">{t('home.city.cta')} →</span>
      </div>

      {goal && (
        <div className="rounded-xl bg-granite/5 p-3 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-granite/10 text-falu dark:bg-white/10 dark:text-gold">
              <BuildingIcon icon={iconFor(goal.id)} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-granite/70 dark:text-birch/40">
                {buyable ? t('home.city.ready') : t('home.city.goal')}
              </p>
              <p className="sv-word truncate text-sm">{resolveLocalized(goal.name, lang)}</p>
            </div>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-granite dark:text-birch/70">
              {formatNumber(Math.min(wallet.coins, cost))} / {formatNumber(cost)} 🪙
            </span>
          </div>
          <div className="mt-2">
            <CoinProgress coins={wallet.coins} cost={cost} />
          </div>
          {!buyable && short > 0 && (
            <p className="mt-1.5 text-xs text-granite dark:text-birch/60">
              {t('city.panel.toGo', { coins: formatNumber(short) })} · {fillCount(t('city.panel.lessons'), lessonsToEarn(short), lang)}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}

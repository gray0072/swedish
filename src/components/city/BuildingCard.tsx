import type { Building } from '@/content/schema';
import { resolveLocalized } from '@/content/schema';
import { useLanguage } from '@/store/settings';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useWallet } from '@/store/wallet';
import { useCityBuildingLevels } from '@/store/city';
import { formatNumber } from '@/lib/format';
import { getBuilding } from '@/content/registry';
import { buildingCostAt } from '@/city/economy';
import { PerkLine } from './PerkDisplay';
import { playBuild, playUpgrade } from '@/lib/sound';
import { celebrate } from '@/components/ui/Fireworks';

/**
 * `preview` is the read-only variant shown for an era the learner has not unlocked yet
 * (CityPage): same name, description and perk, but nothing to press — the cost is stated as
 * plain text, because a button that can only ever be disabled reads as broken rather than as
 * locked. Requirements still show: half of what makes a future era interesting is seeing the
 * order things have to be built in.
 */
export default function BuildingCard({ building, preview = false }: { building: Building; preview?: boolean }) {
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const levels = useCityBuildingLevels();
  const buyBuilding = useAppStore((s) => s.buyBuilding);

  const level = levels[building.id] ?? 0;
  const atMax = level >= building.maxLevel;
  const cost = buildingCostAt(building, level);
  const missingRequirement = building.requires.find((reqId) => (levels[reqId] ?? 0) < 1);
  const canAfford = wallet.coins >= cost;

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="sv-word text-base">{resolveLocalized(building.name, lang)}</p>
        {level > 0 && (
          <span className="rounded-full bg-pine/15 px-2 py-0.5 text-[11px] font-semibold text-pine dark:text-aurora">
            {t('city.level')} {level}/{building.maxLevel}
          </span>
        )}
      </div>
      {building.description && (
        <p className="text-xs text-granite dark:text-birch/60">
          {resolveLocalized(building.description, lang)}
        </p>
      )}
      <PerkLine perk={building.perk} level={level} />

      {preview ? (
        <div className="mt-1 space-y-1 text-xs text-granite/80 dark:text-birch/50">
          <p className="font-semibold">
            {t('city.cost')}: {formatNumber(cost)} 🪙
            {building.maxLevel > 1 && (
              <span className="font-normal">
                {' '}
                · {t('city.maxLevel')} {building.maxLevel}
              </span>
            )}
          </p>
          {missingRequirement && (
            <p>
              {t('city.requires')}: {resolveLocalized(getBuilding(missingRequirement)?.name, lang)}
            </p>
          )}
        </div>
      ) : missingRequirement ? (
        <p className="mt-1 text-xs text-granite/70 dark:text-birch/40">
          {t('city.requires')}: {resolveLocalized(getBuilding(missingRequirement)?.name, lang)}
        </p>
      ) : atMax ? (
        <p className="mt-1 text-xs font-semibold text-pine dark:text-aurora">{t('city.maxLevel')}</p>
      ) : (
        <button
          className="btn-primary mt-1"
          disabled={!canAfford}
          onClick={() => {
            // buyBuilding returns false when the coins ran out between render and click, or
            // the building is already maxed — no sound for a purchase that didn't happen.
            if (!buyBuilding(building.id, cost, building.maxLevel)) return;
            if (level === 0) playBuild();
            else playUpgrade();
            celebrate();
          }}
        >
          {level === 0 ? t('city.build') : t('city.upgrade')} · {formatNumber(cost)} 🪙
        </button>
      )}
    </div>
  );
}

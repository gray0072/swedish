import type { Building } from '@/content/schema';
import { resolveLocalized } from '@/content/schema';
import { useLanguage } from '@/store/settings';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useWallet } from '@/store/wallet';
import { useCityBuildingLevels } from '@/store/city';
import { formatNumber } from '@/lib/format';
import { getBuilding } from '@/content/registry';

function perkLabel(building: Building, t: ReturnType<typeof useT>): string {
  const p = building.perk;
  switch (p.type) {
    case 'xpMultiplier':
      return `+${Math.round(p.valuePerLevel * 100)}% XP`;
    case 'coinMultiplier':
      return `+${Math.round(p.valuePerLevel * 100)}% 🪙`;
    case 'dailyIncome':
      return `+${p.valuePerLevel} 🪙/day`;
    case 'extraReviewSlots':
      return `+${p.valuePerLevel} review slots`;
    case 'streakFreeze':
      return `+${p.valuePerLevel} streak freeze/week`;
    case 'unlockLessonPack':
      return `🔓 ${p.packId}`;
    case 'hintToken':
      return `+${p.valuePerLevel} hints`;
    case 'cosmetic':
      return '✨';
  }
  void t;
  return '';
}

export default function BuildingCard({ building }: { building: Building }) {
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const levels = useCityBuildingLevels();
  const buyBuilding = useAppStore((s) => s.buyBuilding);

  const level = levels[building.id] ?? 0;
  const atMax = level >= building.maxLevel;
  const cost = Math.round(building.cost.coins * Math.pow(building.costGrowth, level));
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
      <p className="text-xs font-semibold text-falu dark:text-gold">
        {t('city.perk')}: {perkLabel(building, t)}
      </p>

      {missingRequirement ? (
        <p className="mt-1 text-xs text-granite/70 dark:text-birch/40">
          {t('city.requires')}: {resolveLocalized(getBuilding(missingRequirement)?.name, lang)}
        </p>
      ) : atMax ? (
        <p className="mt-1 text-xs font-semibold text-pine dark:text-aurora">{t('city.maxLevel')}</p>
      ) : (
        <button
          className="btn-primary mt-1"
          disabled={!canAfford}
          onClick={() => buyBuilding(building.id, cost, building.maxLevel)}
        >
          {level === 0 ? t('city.build') : t('city.upgrade')} · {formatNumber(cost)} 🪙
        </button>
      )}
    </div>
  );
}

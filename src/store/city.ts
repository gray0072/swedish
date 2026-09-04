import { useMemo } from 'react';
import { useAppStore } from './appStore';
import { getBuilding, getBuildings, getEras } from '@/content/registry';
import type { Perk } from '@/content/schema';
import type { BuildingState } from './persist';

export interface PerkTotals {
  xpMultiplier: number;
  coinMultiplier: number;
  dailyIncome: number;
  extraReviewSlots: number;
  unlockedPacks: string[];
}

/** Pure selector — the quiz engine never reaches into the city store directly (SPEC §8.4). */
export function getActivePerks(buildingLevels: Record<string, number>): PerkTotals {
  const totals: PerkTotals = {
    xpMultiplier: 1,
    coinMultiplier: 1,
    dailyIncome: 0,
    extraReviewSlots: 0,
    unlockedPacks: [],
  };
  for (const [buildingId, level] of Object.entries(buildingLevels)) {
    if (level <= 0) continue;
    const building = getBuilding(buildingId);
    if (!building) continue;
    applyPerk(totals, building.perk, level);
  }
  return totals;
}

function applyPerk(totals: PerkTotals, perk: Perk, level: number) {
  switch (perk.type) {
    case 'xpMultiplier':
      totals.xpMultiplier += perk.valuePerLevel * level;
      break;
    case 'coinMultiplier':
      totals.coinMultiplier += perk.valuePerLevel * level;
      break;
    case 'dailyIncome':
      totals.dailyIncome += perk.valuePerLevel * level;
      break;
    case 'extraReviewSlots':
      totals.extraReviewSlots += perk.valuePerLevel * level;
      break;
    case 'unlockLessonPack':
      totals.unlockedPacks.push(perk.packId);
      break;
    default:
      break;
  }
}

// Select the raw, reference-stable buildings map first, then derive with useMemo — building
// a new object inline inside the zustand selector would give useSyncExternalStore a fresh
// snapshot every render and loop forever.
export function useCityBuildingLevels(): Record<string, number> {
  const buildings = useAppStore((s) => s.city.buildings);
  return useMemo(() => {
    const map: Record<string, number> = {};
    for (const [id, b] of Object.entries(buildings) as Array<[string, BuildingState]>) {
      map[id] = b.level;
    }
    return map;
  }, [buildings]);
}

export function usePerks(): PerkTotals {
  const levels = useCityBuildingLevels();
  return getActivePerks(levels);
}

/** Current era is simply the highest-order era whose XP threshold has been reached. */
export function useCurrentEra() {
  const xp = useAppStore((s) => s.wallet.xp);
  const eras = getEras();
  let current = eras[0];
  for (const era of eras) {
    if (xp >= era.unlockXp) current = era;
  }
  return current;
}

export function useOwnedBuildingCount(): number {
  return useAppStore((s) => Object.values(s.city.buildings).filter((b) => b.level > 0).length);
}

export function totalBuildingsCount(): number {
  return getBuildings().length;
}

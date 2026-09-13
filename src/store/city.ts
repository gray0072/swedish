import { useMemo } from 'react';
import { useAppStore } from './appStore';
import { getBuildings, getEras } from '@/content/registry';
import { getActivePerks, type PerkTotals } from '@/city/perks';
import type { BuildingState } from './persist';

export { getActivePerks, NO_PERKS } from '@/city/perks';
export type { PerkTotals } from '@/city/perks';

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
  return useMemo(() => getActivePerks(levels), [levels]);
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

/** True once the building that gates a piece of content has been built at least once. */
export function useIsBuilt(buildingId: string): boolean {
  return useAppStore((s) => (s.city.buildings[buildingId]?.level ?? 0) > 0);
}

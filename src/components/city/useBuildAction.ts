import type { Building } from '@/content/schema';
import { useAppStore } from '@/store/appStore';
import { useWallet } from '@/store/wallet';
import { useCityBuildingLevels } from '@/store/city';
import { buildingCostAt } from '@/city/economy';
import { BUILD_SOUND_MS, playBuild, playUpgrade, UPGRADE_SOUND_MS } from '@/lib/sound';
import { celebrate } from '@/components/ui/Fireworks';

/**
 * Everything a "Build / Upgrade" control needs to know about one building, and the purchase
 * itself — shared by the building card and the map's panel so the two can never disagree
 * about a price or a requirement.
 */
export function useBuildAction(building: Building) {
  const wallet = useWallet();
  const levels = useCityBuildingLevels();
  const buyBuilding = useAppStore((s) => s.buyBuilding);

  const level = levels[building.id] ?? 0;
  const atMax = level >= building.maxLevel;
  const cost = buildingCostAt(building, level);
  const missingRequirement = building.requires.find((reqId) => (levels[reqId] ?? 0) < 1);
  const canAfford = wallet.coins >= cost;

  /** Buys the next level; false when it did not happen (coins ran out, already maxed). */
  function build(): boolean {
    if (!buyBuilding(building.id, cost, building.maxLevel)) return false;
    // Back up to the map, where the new building rises — the card itself barely changes.
    document.getElementById('city-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // The chime first, then the fireworks: started together, the bursts drowned it.
    if (level === 0) playBuild();
    else playUpgrade();
    window.setTimeout(celebrate, level === 0 ? BUILD_SOUND_MS : UPGRADE_SOUND_MS);
    return true;
  }

  return { level, atMax, cost, missingRequirement, canAfford, coins: wallet.coins, build };
}

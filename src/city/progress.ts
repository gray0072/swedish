import type { Building, Era } from '@/content/schema';
import { buildingCostAt } from './economy';

/**
 * Which era the city tab should open on: the earliest *unlocked* era that still has
 * something to build or upgrade. Opening on era 1 every time made the page feel dead
 * once the first eras were maxed out — the learner had to hunt for the tab where their
 * coins were actually worth spending.
 *
 * An era counts as "done" when every one of its buildings sits at its maximum level;
 * affordability is deliberately ignored, because a tab is a place to look at, not a
 * purchase — an era you are saving up for is exactly the one you want to land on.
 * If everything unlocked is maxed, fall back to the latest unlocked era (the frontier),
 * and to the first era when nothing is unlocked at all.
 */
export function pickInitialEra(
  eras: Era[],
  buildings: Building[],
  levels: Record<string, number>,
  xp: number,
): Era | undefined {
  const ordered = [...eras].sort((a, b) => a.order - b.order);
  const unlocked = ordered.filter((era) => xp >= era.unlockXp);
  if (unlocked.length === 0) return ordered[0];

  const pending = unlocked.find((era) => !isEraComplete(era, buildings, levels));
  return pending ?? unlocked[unlocked.length - 1];
}

/** Every building of the era stands at its maximum level (vacuously true for an empty era). */
export function isEraComplete(era: Era, buildings: Building[], levels: Record<string, number>): boolean {
  return buildings.every((b) => b.era !== era.id || (levels[b.id] ?? 0) >= b.maxLevel);
}

/**
 * The first building, in era order, that the learner could buy right now: its era is
 * unlocked, every building it requires stands, it is not maxed and its next level is
 * affordable. This is the same rule the city page enforces with its buttons — the result
 * page must not advertise a purchase the city would then refuse (a future-era building, or
 * one whose prerequisite is still missing).
 */
export function findBuyableBuilding(
  eras: Era[],
  buildings: Building[],
  levels: Record<string, number>,
  xp: number,
  coins: number,
): Building | undefined {
  const eraOrder = new Map(eras.map((era) => [era.id, era] as const));
  const ordered = buildings
    .filter((b) => eraOrder.has(b.era))
    .sort((a, b) => eraOrder.get(a.era)!.order - eraOrder.get(b.era)!.order);
  return ordered.find((b) => {
    const level = levels[b.id] ?? 0;
    if (xp < eraOrder.get(b.era)!.unlockXp) return false;
    if (level >= b.maxLevel) return false;
    if (b.requires.some((reqId) => (levels[reqId] ?? 0) < 1)) return false;
    return buildingCostAt(b, level) <= coins;
  });
}

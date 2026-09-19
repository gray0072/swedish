import type { Building, Era } from '@/content/schema';

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

  const pending = unlocked.find((era) =>
    buildings.some((b) => b.era === era.id && (levels[b.id] ?? 0) < b.maxLevel),
  );
  return pending ?? unlocked[unlocked.length - 1];
}

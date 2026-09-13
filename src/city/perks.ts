import type { Perk } from '@/content/schema';
import { getBuilding } from '@/content/registry';

/**
 * Perks — the feedback loop from the city back into learning (SPEC §8.4).
 *
 * Two rules keep this list honest:
 *
 * 1. **Every perk changes a number the learner can see.** A perk that is computed but never
 *    spent is worse than no perk at all: the building card promises something and the game
 *    quietly ignores it. Each field below names the exact place it is consumed.
 * 2. **Perks are numbers, not content.** Unlocking a history card or a lesson pack is a
 *    *content* relationship (`unlockedBy` on the card, see SPEC §12.4), not a perk — that way
 *    an unlock cannot exist without the content it claims to unlock.
 *
 * Pure on purpose: the quiz engine, the review page and the store all read these totals
 * without reaching into the city store (SPEC §8.4).
 */
export interface PerkTotals {
  /** Multiplies quiz XP. 1 = no bonus. Consumed by computeRewards(). */
  xpMultiplier: number;
  /** Multiplies quiz coins. 1 = no bonus. Consumed by computeRewards(). */
  coinMultiplier: number;
  /** Coins granted once a day, on the first visit. Consumed by claimDailyIncome(). */
  dailyIncome: number;
  /** Extra items in one review session, on top of REWARDS.baseReviewSessionSize. */
  extraReviewSlots: number;
  /** Extra coins for finishing a review session, on top of REWARDS.reviewSessionCoins. */
  reviewBonus: number;
  /** Extra streak freezes: raises both the weekly grant and the stored cap. */
  streakFreeze: number;
  /** Free hints available during one quiz run. Consumed by QuizRunner. */
  hintTokens: number;
  /** Extra free retries in one quiz run, on top of the one the rules always give. */
  retryTokens: number;
}

export const NO_PERKS: PerkTotals = {
  xpMultiplier: 1,
  coinMultiplier: 1,
  dailyIncome: 0,
  extraReviewSlots: 0,
  reviewBonus: 0,
  streakFreeze: 0,
  hintTokens: 0,
  retryTokens: 0,
};

/** Pure selector — the quiz engine never reaches into the city store directly (SPEC §8.4). */
export function getActivePerks(buildingLevels: Record<string, number>): PerkTotals {
  const totals: PerkTotals = { ...NO_PERKS };
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
    case 'reviewBonus':
      totals.reviewBonus += perk.valuePerLevel * level;
      break;
    case 'streakFreeze':
      totals.streakFreeze += perk.valuePerLevel * level;
      break;
    case 'hintToken':
      totals.hintTokens += perk.valuePerLevel * level;
      break;
    case 'retryToken':
      totals.retryTokens += perk.valuePerLevel * level;
      break;
    case 'cosmetic':
      // Deliberately nothing: decoration is the whole effect, and the building card says so.
      break;
  }
}

/**
 * What one building contributes at a given level — the number shown on its own card, as
 * opposed to the city-wide totals above.
 */
export function perkValueAtLevel(perk: Perk, level: number): number {
  return perk.type === 'cosmetic' ? 0 : perk.valuePerLevel * Math.max(level, 1);
}

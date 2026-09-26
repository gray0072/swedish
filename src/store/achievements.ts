import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from './appStore';
import type { SaveFile } from './persist';
import { evaluateAchievements, type AchievementStatus } from '@/achievements/metrics';
import { achievementTierCoins } from '@/city/economy';

export type { AchievementStatus } from '@/achievements/metrics';

/**
 * Every achievement's live status (SPEC §8.6). Selects only the slices metrics read, so
 * settings changes do not re-evaluate; the evaluation itself is a few linear passes.
 */
export function useAchievementStatuses(): AchievementStatus[] {
  const slices = useAppStore(
    useShallow((s) => ({
      items: s.items,
      lessons: s.lessons,
      wallet: s.wallet,
      streak: s.streak,
      city: s.city,
      historyRead: s.historyRead,
      dialoguesRead: s.dialoguesRead,
      achievements: s.achievements,
    })),
  );
  return useMemo(() => evaluateAchievements(slices as SaveFile), [slices]);
}

export interface AchievementUnlock {
  id: string;
  /** Tier held before (0 = new medal) and tier just reached. */
  from: number;
  to: number;
  coins: number;
}

/**
 * Claims every tier the current save reaches but has not stored yet, pays its coins, and
 * says what was claimed. Called synchronously where a moment should celebrate its own
 * unlocks (the end of a quiz), and by the app-wide watcher for everything else — whichever
 * runs first claims, so a tier is never announced twice.
 */
export function claimPendingAchievements(): AchievementUnlock[] {
  const state = useAppStore.getState();
  const fresh = evaluateAchievements(state as SaveFile).filter((s) => s.liveTier > s.storedTier);
  if (fresh.length === 0) return [];
  const paid = state.claimAchievementTiers(fresh.map((s) => ({ id: s.achievement.id, tier: s.liveTier })));
  if (paid === 0) return [];
  return fresh.map((s) => {
    let coins = 0;
    for (let tier = s.storedTier + 1; tier <= s.liveTier; tier++) coins += achievementTierCoins(tier);
    return { id: s.achievement.id, from: s.storedTier, to: s.liveTier, coins };
  });
}

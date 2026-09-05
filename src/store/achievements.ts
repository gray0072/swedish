import type { Achievement, AchievementCondition, Era } from '@/content/schema';
import { getAchievements, getAllLessons, getEras } from '@/content/registry';
import { useWordsLearned, useAllLessonProgress } from './progress';
import { useStreak } from './wallet';
import { useCurrentEra, useOwnedBuildingCount } from './city';

export interface AchievementStatus {
  achievement: Achievement;
  unlocked: boolean;
}

interface Stats {
  wordsLearned: number;
  streakCurrent: number;
  lessonsPassed: number;
  totalLessons: number;
  currentEraOrder: number;
  eras: Era[];
  buildingsOwned: number;
}

function checkCondition(condition: AchievementCondition, stats: Stats): boolean {
  switch (condition.type) {
    case 'wordsLearned':
      return stats.wordsLearned >= condition.value;
    case 'streak':
      return stats.streakCurrent >= condition.value;
    case 'lessonsPassed':
      return stats.lessonsPassed >= condition.value;
    case 'allLessonsPassed':
      return stats.totalLessons > 0 && stats.lessonsPassed >= stats.totalLessons;
    case 'eraReached': {
      const era = stats.eras.find((e) => e.id === condition.eraId);
      return Boolean(era) && stats.currentEraOrder >= era!.order;
    }
    case 'buildingsOwned':
      return stats.buildingsOwned >= condition.value;
  }
}

/** Achievements are computed live from existing stats — never persisted separately, so
 * they can never drift out of sync with the numbers that earned them (SPEC §8.5). */
export function useAchievementStatuses(): AchievementStatus[] {
  const wordsLearned = useWordsLearned();
  const streak = useStreak();
  const lessonsProgress = useAllLessonProgress();
  const currentEra = useCurrentEra();
  const buildingsOwned = useOwnedBuildingCount();

  const allLessons = getAllLessons();
  const lessonsPassed = allLessons.filter((l) => lessonsProgress[l.meta.id]?.passed).length;

  const stats: Stats = {
    wordsLearned,
    streakCurrent: streak.current,
    lessonsPassed,
    totalLessons: allLessons.length,
    currentEraOrder: currentEra.order,
    eras: getEras(),
    buildingsOwned,
  };

  return getAchievements().map((achievement) => ({
    achievement,
    unlocked: checkCondition(achievement.condition, stats),
  }));
}

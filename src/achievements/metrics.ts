import type { Achievement, AchievementMetric } from '@/content/schema';
import {
  getAchievements,
  getAllLessons,
  getBuildings,
  getEras,
  getLessonsForLevel,
  getTracks,
} from '@/content/registry';
import { buildingCostAt } from '@/city/economy';
import type { SaveFile } from '@/store/persist';

/**
 * Achievements (SPEC §8.6) — every metric's current value, from a save.
 *
 * Most metrics are derived from what the save already records for its own reasons (SRS
 * boxes, lesson results, wallet, buildings). The rest are event counters that nothing else
 * in the save would keep — those live in `save.achievements.counters` and are written by
 * the store actions in `events.ts`.
 */
export type MetricValues = Record<AchievementMetric, number>;

export function computeMetrics(save: SaveFile): MetricValues {
  const items = Object.values(save.items);
  const lessons = getAllLessons();
  const progress = save.lessons;
  const passed = lessons.filter((l) => progress[l.meta.id]?.passed);

  const levelsCompleted = getTracks()
    .flatMap((t) => t.levels)
    .filter((level) => {
      const inLevel = getLessonsForLevel(level.id);
      return inLevel.length > 0 && inLevel.every((l) => progress[l.meta.id]?.passed);
    }).length;

  let coinsSpent = 0;
  let buildingsOwned = 0;
  let buildingsMaxed = 0;
  for (const building of getBuildings()) {
    const level = save.city.buildings[building.id]?.level ?? 0;
    if (level > 0) buildingsOwned += 1;
    if (level >= building.maxLevel) buildingsMaxed += 1;
    for (let l = 0; l < level; l++) coinsSpent += buildingCostAt(building, l);
  }

  const a = save.achievements;
  const counter = (key: keyof typeof a.counters) => a.counters[key] ?? 0;

  return {
    wordsLearned: items.filter((i) => i.box >= 2).length,
    wordsMastered: items.filter((i) => i.box >= 5).length,
    mistakesFixed: items.filter((i) => i.wrong > 0 && i.box >= 3).length,
    correctAnswers: items.reduce((sum, i) => sum + i.correct, 0),
    lessonsPassed: passed.length,
    // A run is as long as the lesson's questionsPerRun (the loader guarantees the pool has
    // that many), so a best score equal to it is a flawless run.
    perfectLessons: lessons.filter(
      (l) => (progress[l.meta.id]?.bestScore ?? 0) >= l.meta.quiz.questionsPerRun,
    ).length,
    grammarPassed: passed.filter((l) => l.meta.kind === 'grammar').length,
    levelsCompleted,
    curriculumPercent: lessons.length ? Math.floor((passed.length / lessons.length) * 100) : 0,
    streakLongest: Math.max(save.streak.longest, save.streak.current),
    xp: save.wallet.xp,
    coinsHeld: save.wallet.coins,
    coinsSpent,
    erasReached: getEras().filter((e) => save.wallet.xp >= e.unlockXp).length,
    buildingsOwned,
    buildingsMaxed,
    historyRead: save.historyRead.length,
    dialoguesRead: save.dialoguesRead.length,
    daysActive: counter('daysActive'),
    reviewSessions: counter('reviewSessions'),
    bestCombo: counter('bestCombo'),
    bestDay: counter('bestDay'),
    comebacks: counter('comebacks'),
    freezesUsed: counter('freezesUsed'),
    stubbornPasses: counter('stubbornPasses'),
    lagomPasses: counter('lagomPasses'),
    nightSessions: counter('nightSessions'),
    morningSessions: counter('morningSessions'),
    fikaSessions: counter('fikaSessions'),
    weekendSessions: counter('weekendSessions'),
    holidays: a.holidays.length,
    audioPlays: counter('audioPlays'),
  };
}

export interface AchievementStatus {
  achievement: Achievement;
  value: number;
  /** Tiers reached, 0..tiers.length — the stored high-water mark or the live value, whichever is higher. */
  tier: number;
  /** Tiers the live value alone reaches. */
  liveTier: number;
  /** Tiers already stored in the save; liveTier above it is a fresh unlock to claim. */
  storedTier: number;
  unlockedAt: string | null;
  /** Threshold of the next tier, or null once every tier is reached. */
  next: number | null;
  /** Threshold of the tier already held (0 before the first), for a progress bar's start. */
  prev: number;
}

export function tierFor(tiers: number[], value: number): number {
  let tier = 0;
  while (tier < tiers.length && value >= tiers[tier]) tier++;
  return tier;
}

export function evaluateAchievements(save: SaveFile, metrics = computeMetrics(save)): AchievementStatus[] {
  return getAchievements().map((achievement) => {
    const value = metrics[achievement.metric];
    const liveTier = tierFor(achievement.tiers, value);
    const stored = save.achievements.unlocked[achievement.id];
    const storedTier = Math.min(stored?.tier ?? 0, achievement.tiers.length);
    const tier = Math.max(liveTier, storedTier);
    return {
      achievement,
      value,
      tier,
      liveTier,
      storedTier,
      unlockedAt: stored?.at ?? null,
      next: tier < achievement.tiers.length ? achievement.tiers[tier] : null,
      prev: tier > 0 ? achievement.tiers[tier - 1] : 0,
    };
  });
}

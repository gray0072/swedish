import { describe, expect, it } from 'vitest';
import {
  getAchievements,
  getAllLessons,
  getBuildings,
  getDialogues,
  getEras,
  getHistoryCards,
  getTracks,
} from '@/content/registry';
import { computeMetrics, evaluateAchievements, tierFor } from '@/achievements/metrics';
import { onAnswer, onLessonPassed, onNewDay, onStudySession, swedishHoliday } from '@/achievements/events';
import { freshAchievementState, freshSave, type ItemProgress, type SaveFile } from '@/store/persist';
import { mergeSaves } from '@/store/cloudSync';
import { fillCount } from '@/achievements/describe';
import { useAppStore } from '@/store/appStore';
import { achievementTierCoins } from '@/city/economy';
import type { AchievementMetric } from '@/content/schema';

const item = (box: ItemProgress['box'], wrong = 0): ItemProgress => ({
  box,
  dueAt: '2026-01-02T10:00:00.000Z',
  seen: 3,
  correct: 2,
  wrong,
  lastCorrect: true,
  lastSeenAt: '2026-01-01T10:00:00.000Z',
});

const status = (save: SaveFile, id: string) => evaluateAchievements(save).find((s) => s.achievement.id === id)!;

describe('achievement content', () => {
  const achievements = getAchievements();

  it('has unique ids and a sv/en/ru name for each', () => {
    expect(new Set(achievements.map((a) => a.id)).size).toBe(achievements.length);
    for (const a of achievements) {
      expect(a.name.sv && a.name.en && a.name.ru, a.id).toBeTruthy();
      expect(a.description.en && a.description.ru, a.id).toBeTruthy();
    }
  });

  it('names the threshold in every tiered description', () => {
    for (const a of achievements.filter((x) => x.tiers.length > 1)) {
      expect(a.description.en, a.id).toContain('{n}');
      expect(a.description.ru, a.id).toContain('{n}');
    }
  });

  it('never asks for more than the content can give', () => {
    const levels = getTracks().flatMap((t) => t.levels).length;
    const caps: Partial<Record<AchievementMetric, number>> = {
      historyRead: getHistoryCards().length,
      dialoguesRead: getDialogues().length,
      buildingsOwned: getBuildings().length,
      buildingsMaxed: getBuildings().length,
      erasReached: getEras().length,
      levelsCompleted: levels,
      curriculumPercent: 100,
      holidays: 8,
    };
    for (const a of achievements) {
      const cap = caps[a.metric];
      if (cap !== undefined) expect(a.tiers[a.tiers.length - 1], a.id).toBeLessThanOrEqual(cap);
    }
  });
});

describe('achievement descriptions', () => {
  it('picks the plural form for the number', () => {
    expect(fillCount('Pass {n} {n|lesson|lessons}.', 1, 'en')).toBe('Pass 1 lesson.');
    expect(fillCount('Pass {n} {n|lesson|lessons}.', 25, 'en')).toBe('Pass 25 lessons.');
    const ru = 'Пройди {n} {n|урок|урока|уроков}.';
    expect(fillCount(ru, 1, 'ru')).toBe('Пройди 1 урок.');
    expect(fillCount(ru, 3, 'ru')).toBe('Пройди 3 урока.');
    expect(fillCount(ru, 25, 'ru')).toBe('Пройди 25 уроков.');
  });

  it('gives every plural a form per plural category', () => {
    for (const a of getAchievements()) {
      for (const [lang, count] of [['en', 2], ['ru', 3]] as const) {
        for (const m of (a.description[lang] ?? '').matchAll(/\{n\|([^}]*)\}/g)) {
          expect(m[1].split('|').length, `${a.id} ${lang}`).toBe(count);
        }
      }
    }
  });
});

describe('achievement metrics', () => {
  it('starts at zero for a fresh save', () => {
    expect(evaluateAchievements(freshSave()).every((s) => s.tier === 0)).toBe(true);
  });

  it('derives word, lesson and city metrics from the save', () => {
    const lesson = getAllLessons()[0];
    const save: SaveFile = {
      ...freshSave(),
      items: { a: item(2), b: item(5), c: item(3, 1) },
      lessons: {
        [lesson.meta.id]: {
          attempts: 1,
          bestScore: lesson.meta.quiz.questionsPerRun,
          passed: true,
          lastAttemptAt: '',
          rewardedRunsToday: 0,
          rewardedRunsDate: '',
          lastRunQuestionIds: [],
        },
      },
      city: { buildings: { [getBuildings()[0].id]: { level: 1, builtAt: '' } } },
    };
    const m = computeMetrics(save);
    expect(m.wordsLearned).toBe(3);
    expect(m.wordsMastered).toBe(1);
    expect(m.mistakesFixed).toBe(1);
    expect(m.correctAnswers).toBe(6);
    expect(m.lessonsPassed).toBe(1);
    expect(m.perfectLessons).toBe(1);
    expect(m.buildingsOwned).toBe(1);
    expect(m.coinsSpent).toBe(getBuildings()[0].coins);
    expect(m.erasReached).toBe(1);
  });

  it('counts tiers by threshold', () => {
    expect(tierFor([10, 50, 150], 0)).toBe(0);
    expect(tierFor([10, 50, 150], 50)).toBe(2);
    expect(tierFor([10, 50, 150], 999)).toBe(3);
  });

  it('never takes a stored tier back when the live value drops', () => {
    const save: SaveFile = {
      ...freshSave(),
      wallet: { xp: 0, coins: 10 },
      achievements: { ...freshAchievementState(), unlocked: { 'piggy-bank': { tier: 2, at: '2026-01-01' } } },
    };
    const s = status(save, 'piggy-bank');
    expect(s.liveTier).toBe(0);
    expect(s.tier).toBe(2);
    expect(s.next).toBe(5000);
  });
});

describe('achievement events', () => {
  it('counts days, comebacks and spent freezes on a new day', () => {
    const streak = { current: 5, longest: 5, lastActiveDate: '2026-03-01', freezesAvailable: 1 };
    const a = onNewDay(freshAchievementState(), streak, '2026-03-10');
    expect(a.counters).toEqual({ daysActive: 1, comebacks: 1, freezesUsed: 1 });
    expect(onNewDay(a, { ...streak, lastActiveDate: '2026-03-10' }, '2026-03-10')).toBe(a);
  });

  it('keeps the best combo after the run breaks', () => {
    let a = freshAchievementState();
    for (const correct of [true, true, true, false, true]) a = onAnswer(a, correct);
    expect(a.combo).toBe(1);
    expect(a.counters.bestCombo).toBe(3);
  });

  it('counts lessons per local day and the time of day', () => {
    const night = new Date(2026, 2, 3, 2, 0);
    let a = onLessonPassed(freshAchievementState(), night, { failedBefore: true, lagom: false });
    a = onLessonPassed(a, new Date(2026, 2, 3, 15, 30), { failedBefore: false, lagom: true });
    a = onLessonPassed(a, new Date(2026, 2, 4, 10, 0), { failedBefore: false, lagom: false });
    expect(a.counters).toMatchObject({
      bestDay: 2,
      stubbornPasses: 1,
      lagomPasses: 1,
      nightSessions: 1,
      fikaSessions: 1,
    });
    expect(a.day.lessons).toBe(1);
  });

  it('recognises Swedish holidays, midsommarafton included', () => {
    expect(swedishHoliday(new Date(2026, 11, 13))).toBe('lucia');
    expect(swedishHoliday(new Date(2026, 5, 19))).toBe('midsommarafton');
    expect(swedishHoliday(new Date(2026, 5, 20))).toBeNull();
    const a = onStudySession(onStudySession(freshAchievementState(), new Date(2026, 9, 4)), new Date(2026, 9, 4, 18));
    expect(a.holidays).toEqual(['kanelbullens-dag']);
  });
});

describe('claiming achievement tiers', () => {
  it('pays every skipped tier once and is idempotent', () => {
    useAppStore.getState().resetSave();
    const paid = useAppStore.getState().claimAchievementTiers([{ id: 'vocabulary', tier: 3 }]);
    expect(paid).toBe(achievementTierCoins(1) + achievementTierCoins(2) + achievementTierCoins(3));
    expect(useAppStore.getState().wallet.coins).toBe(paid);
    expect(useAppStore.getState().claimAchievementTiers([{ id: 'vocabulary', tier: 3 }])).toBe(0);
    expect(useAppStore.getState().achievements.unlocked.vocabulary.tier).toBe(3);
    useAppStore.getState().resetSave();
  });

  it('merges devices by the higher tier and the larger counter', () => {
    const local = {
      ...freshSave(),
      achievements: {
        ...freshAchievementState(),
        unlocked: { streak: { tier: 1, at: '2026-01-01' } },
        counters: { daysActive: 4, reviewSessions: 9 },
        holidays: ['lucia'],
      },
    };
    const remote = {
      ...freshSave(),
      achievements: {
        ...freshAchievementState(),
        unlocked: { streak: { tier: 2, at: '2026-02-01' }, review: { tier: 1, at: '2026-01-05' } },
        counters: { daysActive: 7 },
        holidays: ['julafton'],
      },
    };
    const merged = mergeSaves(local, remote).achievements;
    expect(merged.unlocked).toEqual(remote.achievements.unlocked);
    expect(merged.counters).toEqual({ daysActive: 7, reviewSessions: 9 });
    expect(merged.holidays.sort()).toEqual(['julafton', 'lucia']);
  });
});

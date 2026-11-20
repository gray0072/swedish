import { describe, expect, it } from 'vitest';
import { mergeSaves } from '@/store/cloudSync';
import { freshSave, type SaveFile } from '@/store/persist';

function saveWith(overrides: Partial<SaveFile>): SaveFile {
  return { ...freshSave(), ...overrides };
}

describe('mergeSaves', () => {
  it('keeps the newer lesson attempt but merges best score and pass state', () => {
    const local = saveWith({
      lessons: {
        l1: {
          attempts: 2,
          bestScore: 0.6,
          passed: false,
          lastAttemptAt: '2026-01-01T10:00:00.000Z',
          rewardedRunsToday: 1,
          rewardedRunsDate: '2026-01-01',
          lastRunQuestionIds: ['a'],
        },
      },
    });
    const remote = saveWith({
      lessons: {
        l1: {
          attempts: 5,
          bestScore: 0.9,
          passed: true,
          lastAttemptAt: '2026-01-02T10:00:00.000Z',
          rewardedRunsToday: 2,
          rewardedRunsDate: '2026-01-02',
          lastRunQuestionIds: ['b'],
        },
      },
    });

    const merged = mergeSaves(local, remote);

    expect(merged.lessons.l1).toEqual({
      attempts: 5,
      bestScore: 0.9,
      passed: true,
      lastAttemptAt: '2026-01-02T10:00:00.000Z',
      rewardedRunsToday: 2,
      rewardedRunsDate: '2026-01-02',
      lastRunQuestionIds: ['b'],
    });
  });

  it('never downgrades a building bought further on one device', () => {
    const local = saveWith({ city: { buildings: { townhall: { level: 3, builtAt: 'a' } } } });
    const remote = saveWith({ city: { buildings: { townhall: { level: 1, builtAt: 'b' } } } });

    expect(mergeSaves(local, remote).city.buildings.townhall.level).toBe(3);
    expect(mergeSaves(remote, local).city.buildings.townhall.level).toBe(3);
  });

  it('takes the max of wallet totals so neither device loses earned currency', () => {
    const local = saveWith({ wallet: { xp: 100, coins: 20, coinsSpent: 0 } });
    const remote = saveWith({ wallet: { xp: 40, coins: 90, coinsSpent: 0 } });

    expect(mergeSaves(local, remote).wallet).toEqual({ xp: 100, coins: 90, coinsSpent: 0 });
  });

  it('keeps a purchase when merging with the cloud copy from before it', () => {
    const local = saveWith({ wallet: { xp: 500, coins: 100, coinsSpent: 900 } });
    const remote = saveWith({ wallet: { xp: 500, coins: 1000, coinsSpent: 0 } });

    expect(mergeSaves(local, remote).wallet).toEqual({ xp: 500, coins: 100, coinsSpent: 900 });
    expect(mergeSaves(remote, local).wallet).toEqual({ xp: 500, coins: 100, coinsSpent: 900 });
  });

  it('keeps coins earned after a purchase on the other device', () => {
    // The laptop bought for 900 and pushed; the phone, still at the pre-purchase cloud copy,
    // then earned 30 more on top of the 1000 it had.
    const phone = saveWith({ wallet: { xp: 530, coins: 1030, coinsSpent: 0 } });
    const cloud = saveWith({ wallet: { xp: 500, coins: 100, coinsSpent: 900 } });

    expect(mergeSaves(phone, cloud).wallet).toEqual({ xp: 530, coins: 130, coinsSpent: 900 });
  });

  it("discards the side whose reset is older, keeping this device's settings", () => {
    const progress = saveWith({ wallet: { xp: 900, coins: 50, coinsSpent: 0 }, historyRead: ['x'] });
    const reset = saveWith({ resetAt: '2026-11-20T10:00:00.000Z' });
    reset.settings = { ...reset.settings, theme: 'dark' };

    expect(mergeSaves(reset, progress)).toEqual(reset);
    const pulled = mergeSaves(progress, reset);
    expect(pulled.wallet.xp).toBe(0);
    expect(pulled.historyRead).toEqual([]);
    expect(pulled.resetAt).toBe(reset.resetAt);
    expect(pulled.settings).toEqual(progress.settings);
  });

  it('unions historyRead entries read on either device', () => {
    const local = saveWith({ historyRead: ['x', 'y'] });
    const remote = saveWith({ historyRead: ['y', 'z'] });

    expect(new Set(mergeSaves(local, remote).historyRead)).toEqual(new Set(['x', 'y', 'z']));
  });

  it('is idempotent: merging a save with itself changes nothing', () => {
    const local = saveWith({
      wallet: { xp: 12, coins: 3, coinsSpent: 0 },
      lessons: {
        l1: {
          attempts: 1,
          bestScore: 0.5,
          passed: false,
          lastAttemptAt: '2026-01-01T00:00:00.000Z',
          rewardedRunsToday: 1,
          rewardedRunsDate: '2026-01-01',
          lastRunQuestionIds: [],
        },
      },
    });

    expect(mergeSaves(local, local)).toEqual(local);
  });

  it('pulls remote settings/language only when the local save is still untouched', () => {
    const freshLocal = saveWith({ language: 'en' });
    const remote = saveWith({
      language: 'ru',
      settings: { theme: 'dark', sound: false, ttsRate: 1, ttsVoice: 'v1' },
    });
    expect(mergeSaves(freshLocal, remote).language).toBe('ru');
    expect(mergeSaves(freshLocal, remote).settings.theme).toBe('dark');

    const usedLocal = saveWith({ language: 'en', wallet: { xp: 1, coins: 0, coinsSpent: 0 } });
    expect(mergeSaves(usedLocal, remote).language).toBe('en');
    expect(mergeSaves(usedLocal, remote).settings.theme).toBe('system');
  });
});

describe('mergeSaves — streak', () => {
  const streak = (s: Partial<SaveFile['streak']>): SaveFile['streak'] => ({
    current: 0,
    longest: 0,
    lastActiveDate: null,
    freezesAvailable: 0,
    ...s,
  });

  it('keeps the cloud streak when an idle device already stamped today on open', () => {
    // The phone was last used three days ago; opening the app reset its streak to 1 for today
    // before the cloud save arrived. The laptop studied yesterday with a 12-day streak.
    const local = saveWith({
      streak: streak({ current: 1, longest: 5, lastActiveDate: '2026-11-20', freezesAvailable: 0 }),
    });
    const remote = saveWith({
      streak: streak({ current: 12, longest: 12, lastActiveDate: '2026-11-19', freezesAvailable: 2 }),
    });
    expect(mergeSaves(local, remote).streak).toEqual({
      current: 13,
      longest: 13,
      lastActiveDate: '2026-11-20',
      freezesAvailable: 2,
    });
  });

  it('keeps the longer streak and its freezes when both devices were active the same day', () => {
    const local = saveWith({
      streak: streak({ current: 3, longest: 3, lastActiveDate: '2026-11-20', freezesAvailable: 0 }),
    });
    const remote = saveWith({
      streak: streak({ current: 20, longest: 20, lastActiveDate: '2026-11-20', freezesAvailable: 1 }),
    });
    expect(mergeSaves(local, remote).streak).toEqual(remote.streak);
    expect(mergeSaves(remote, local).streak).toEqual(remote.streak);
  });

  it('takes the newer streak when the older one has already broken', () => {
    const local = saveWith({
      streak: streak({ current: 2, longest: 30, lastActiveDate: '2026-11-20', freezesAvailable: 0 }),
    });
    const remote = saveWith({
      streak: streak({ current: 30, longest: 30, lastActiveDate: '2026-11-10', freezesAvailable: 0 }),
    });
    expect(mergeSaves(local, remote).streak).toEqual(local.streak);
  });

  it('pulls the cloud streak into a fresh install', () => {
    const remote = saveWith({
      streak: streak({ current: 8, longest: 9, lastActiveDate: '2026-11-19', freezesAvailable: 1 }),
    });
    expect(mergeSaves(freshSave(), remote).streak).toEqual(remote.streak);
  });

  it('is idempotent', () => {
    const local = saveWith({
      streak: streak({ current: 1, longest: 5, lastActiveDate: '2026-11-20' }),
    });
    const remote = saveWith({
      streak: streak({ current: 12, longest: 12, lastActiveDate: '2026-11-19', freezesAvailable: 2 }),
    });
    const once = mergeSaves(local, remote);
    expect(mergeSaves(once, remote).streak).toEqual(once.streak);
  });
});

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
    const local = saveWith({ wallet: { xp: 100, coins: 20 } });
    const remote = saveWith({ wallet: { xp: 40, coins: 90 } });

    expect(mergeSaves(local, remote).wallet).toEqual({ xp: 100, coins: 90 });
  });

  it('unions historyRead entries read on either device', () => {
    const local = saveWith({ historyRead: ['x', 'y'] });
    const remote = saveWith({ historyRead: ['y', 'z'] });

    expect(new Set(mergeSaves(local, remote).historyRead)).toEqual(new Set(['x', 'y', 'z']));
  });

  it('is idempotent: merging a save with itself changes nothing', () => {
    const local = saveWith({
      wallet: { xp: 12, coins: 3 },
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

    const usedLocal = saveWith({ language: 'en', wallet: { xp: 1, coins: 0 } });
    expect(mergeSaves(usedLocal, remote).language).toBe('en');
    expect(mergeSaves(usedLocal, remote).settings.theme).toBe('system');
  });
});

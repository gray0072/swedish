import { describe, expect, it } from 'vitest';
import { getAllLessons, getBuildings, getDialogues, getHistoryCards } from '@/content/registry';
import { freshSave, type ItemProgress, type LessonProgress } from '@/store/persist';
import { pruneUnknownIds } from '@/store/pruneSave';

const lessonProgress = (lastRunQuestionIds: string[]): LessonProgress => ({
  attempts: 1,
  bestScore: 8,
  passed: true,
  lastAttemptAt: '2026-01-01T10:00:00.000Z',
  rewardedRunsToday: 1,
  rewardedRunsDate: '2026-01-01',
  lastRunQuestionIds,
});

const item: ItemProgress = {
  box: 1,
  dueAt: '2026-01-02T10:00:00.000Z',
  seen: 1,
  correct: 1,
  wrong: 0,
  lastCorrect: true,
  lastSeenAt: '2026-01-01T10:00:00.000Z',
};

describe('pruneUnknownIds', () => {
  it('keeps known ids and drops the ones the content no longer has', () => {
    const lesson = getAllLessons()[0];
    const questionId = lesson.pool[0].id;
    const building = getBuildings()[0].id;
    const history = getHistoryCards()[0].id;
    const dialogue = getDialogues()[0].id;

    const pruned = pruneUnknownIds({
      ...freshSave(),
      lessons: {
        [lesson.meta.id]: lessonProgress([questionId, 'q-greet-01']),
        'grammar/old-lesson': lessonProgress([]),
      },
      items: { [questionId]: item, 'q-greet-01': item, 'gen-sfi-a/alphabet-sv2n-bokstav': item },
      city: { buildings: { [building]: { level: 1, builtAt: '' }, 'gone-building': { level: 2, builtAt: '' } } },
      historyRead: [history, 'gone-card'],
      dialoguesRead: [dialogue, 'gone-dialogue'],
    });

    expect(Object.keys(pruned.lessons)).toEqual([lesson.meta.id]);
    expect(pruned.lessons[lesson.meta.id].lastRunQuestionIds).toEqual([questionId]);
    expect(Object.keys(pruned.items)).toEqual([questionId]);
    expect(Object.keys(pruned.city.buildings)).toEqual([building]);
    expect(pruned.historyRead).toEqual([history]);
    expect(pruned.dialoguesRead).toEqual([dialogue]);
  });
});

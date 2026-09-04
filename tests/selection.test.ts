import { describe, expect, it } from 'vitest';
import { selectQuestions, weightFor, type SelectionContext } from '@/quiz/selection';
import type { Question } from '@/content/schema';

function makeQuestion(id: string, difficulty: 1 | 2 | 3 = 1): Question {
  return {
    id,
    type: 'true-false',
    difficulty,
    tags: [],
    generated: false,
    prompt: { ru: id },
    answer: true,
  };
}

describe('weightFor', () => {
  const ctx: SelectionContext = { previousRunIds: [], itemStats: {} };

  it('weights an unseen item highest', () => {
    const unseen = weightFor(makeQuestion('a'), ctx);
    const mastered = weightFor(makeQuestion('b'), {
      ...ctx,
      itemStats: { b: { seen: 5, correct: 4, lastCorrect: true } },
    });
    expect(unseen).toBeGreaterThan(mastered);
  });

  it('weights a recently-wrong item above a mastered one', () => {
    const wrong = weightFor(makeQuestion('a'), {
      ...ctx,
      itemStats: { a: { seen: 2, correct: 0, lastCorrect: false } },
    });
    const mastered = weightFor(makeQuestion('b'), {
      ...ctx,
      itemStats: { b: { seen: 5, correct: 4, lastCorrect: true } },
    });
    expect(wrong).toBeGreaterThan(mastered);
  });
});

describe('selectQuestions', () => {
  const pool = Array.from({ length: 20 }, (_, i) => makeQuestion(`q${i}`));
  const emptyCtx: SelectionContext = { previousRunIds: [], itemStats: {} };

  it('is deterministic for the same seed', () => {
    const a = selectQuestions(pool, 10, 'seed-1', emptyCtx);
    const b = selectQuestions(pool, 10, 'seed-1', emptyCtx);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it('never repeats a question within one run', () => {
    const picked = selectQuestions(pool, 10, 'seed-2', emptyCtx);
    expect(new Set(picked.map((q) => q.id)).size).toBe(10);
  });

  it('excludes the previous run when enough alternatives exist', () => {
    const previousRunIds = pool.slice(0, 10).map((q) => q.id);
    const picked = selectQuestions(pool, 10, 'seed-3', { ...emptyCtx, previousRunIds });
    const overlap = picked.filter((q) => previousRunIds.includes(q.id));
    expect(overlap.length).toBe(0);
  });

  it('falls back to the full pool when exclusion would leave too few items', () => {
    const smallPool = pool.slice(0, 5);
    const previousRunIds = smallPool.map((q) => q.id);
    const picked = selectQuestions(smallPool, 5, 'seed-4', { ...emptyCtx, previousRunIds });
    expect(picked.length).toBe(5);
  });
});

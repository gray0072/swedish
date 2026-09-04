import { describe, expect, it } from 'vitest';
import { computeRewards, type QuizSession } from '@/quiz/engine';

function session(results: QuizSession['results']): QuizSession {
  return { lessonId: 'x', seed: 's', attemptNumber: 1, questions: [], results };
}

const baseInputs = {
  baseXp: 100,
  passScore: 7,
  totalQuestions: 10,
  alreadyPassedBefore: false,
  streakDays: 0,
  perkXpMultiplier: 1,
  perkCoinMultiplier: 1,
};

describe('computeRewards', () => {
  it('awards 0 xp when the score is below the pass threshold', () => {
    const results = Array.from({ length: 6 }, (_, i) => ({ questionId: `q${i}`, correct: true }));
    const reward = computeRewards(session(results), baseInputs);
    expect(reward.passed).toBe(false);
    expect(reward.xp).toBe(0);
    expect(reward.coins).toBe(0);
  });

  it('awards full base xp on a perfect first pass', () => {
    const results = Array.from({ length: 10 }, (_, i) => ({ questionId: `q${i}`, correct: true }));
    const reward = computeRewards(session(results), baseInputs);
    expect(reward.passed).toBe(true);
    expect(reward.perfect).toBe(true);
    // 100 * (10/10) * 1.0 firstPass * 1.25 perfectBonus * 1 * 1 = 125
    expect(reward.xp).toBe(125);
    expect(reward.coins).toBe(Math.round(125 * 0.5));
  });

  it('gives a repeat pass only 30% of the xp', () => {
    const results = Array.from({ length: 10 }, (_, i) => ({ questionId: `q${i}`, correct: true }));
    const reward = computeRewards(session(results), { ...baseInputs, alreadyPassedBefore: true });
    // 100 * 1 * 0.3 * 1.25 = 37.5 -> 38
    expect(reward.xp).toBe(38);
  });

  it('gives half credit for a retried or near-miss answer', () => {
    const results = [
      ...Array.from({ length: 7 }, (_, i) => ({ questionId: `q${i}`, correct: true })),
      { questionId: 'r1', correct: true, retried: true },
      { questionId: 'r2', correct: false },
      { questionId: 'r3', correct: false },
    ];
    const reward = computeRewards(session(results), baseInputs);
    expect(reward.score).toBe(7.5);
    expect(reward.passed).toBe(true);
  });

  it('applies the streak multiplier, capped at 10 days', () => {
    const results = Array.from({ length: 10 }, (_, i) => ({ questionId: `q${i}`, correct: true }));
    const at10 = computeRewards(session(results), { ...baseInputs, streakDays: 10 });
    const at50 = computeRewards(session(results), { ...baseInputs, streakDays: 50 });
    expect(at10.xp).toBe(at50.xp); // multiplier caps at streakDays=10
    expect(at10.xp).toBeGreaterThan(computeRewards(session(results), baseInputs).xp);
  });
});

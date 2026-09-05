import { describe, expect, it } from 'vitest';
import { computeRewards, prepareQuestion, type QuizSession } from '@/quiz/engine';
import { mulberry32 } from '@/quiz/prng';
import type { Question } from '@/content/schema';

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

describe('prepareQuestion', () => {
  // Generated mc/listen questions always author the correct choice at index 0 — without a
  // shuffle, every review/quiz render of them would make the answer "always option 1".
  const mc: Question = {
    id: 'q1',
    type: 'mc',
    difficulty: 1,
    tags: [],
    generated: true,
    prompt: { ru: 'x' },
    choices: ['correct', 'b', 'c', 'd'],
    answer: 0,
  };

  it('remaps the answer index so it still points at the originally-correct choice', () => {
    for (let seed = 0; seed < 20; seed++) {
      const rng = mulberry32(seed);
      const prepared = prepareQuestion(mc, rng);
      if (prepared.type !== 'mc') throw new Error('expected mc');
      expect(prepared.choices[prepared.answer]).toBe('correct');
    }
  });

  it('actually reorders choices at least once across many seeds (not a no-op)', () => {
    const everUnshuffled = Array.from({ length: 20 }, (_, seed) => {
      const prepared = prepareQuestion(mc, mulberry32(seed));
      return prepared.type === 'mc' && prepared.answer === 0;
    });
    expect(everUnshuffled.some((wasFirst) => !wasFirst)).toBe(true);
  });

  it('leaves non-mc/listen question types untouched', () => {
    const tf: Question = {
      id: 'q2',
      type: 'true-false',
      difficulty: 1,
      tags: [],
      generated: false,
      prompt: { ru: 'x' },
      answer: true,
    };
    expect(prepareQuestion(tf, mulberry32(1))).toEqual(tf);
  });
});

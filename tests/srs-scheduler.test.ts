import { describe, expect, it } from 'vitest';
import { BOX_INTERVALS_DAYS, computeDueDate, isDue, nextBox } from '@/srs/scheduler';

describe('nextBox', () => {
  it('moves up one box on a correct answer, capped at 5', () => {
    expect(nextBox(0, true)).toBe(1);
    expect(nextBox(5, true)).toBe(5);
  });
  it('resets to box 0 on a wrong answer', () => {
    expect(nextBox(4, false)).toBe(0);
  });
});

describe('computeDueDate', () => {
  it('adds the interval for the given box', () => {
    const from = new Date('2026-01-01T00:00:00Z');
    const due = computeDueDate(3, from);
    const expected = new Date(from);
    expected.setDate(expected.getDate() + BOX_INTERVALS_DAYS[3]);
    expect(due).toBe(expected.toISOString());
  });
});

describe('isDue', () => {
  it('is true for a past date and false for a future one', () => {
    expect(isDue(new Date(Date.now() - 1000).toISOString())).toBe(true);
    expect(isDue(new Date(Date.now() + 100000).toISOString())).toBe(false);
  });
});

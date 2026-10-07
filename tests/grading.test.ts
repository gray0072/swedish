import { describe, expect, it } from 'vitest';
import { grade } from '@/quiz/grading';
import type { Question } from '@/content/schema';

function mc(overrides: Partial<Question & { type: 'mc' }> = {}): Question {
  return {
    id: 'q1',
    type: 'mc',
    difficulty: 1,
    tags: [],
    generated: false,
    prompt: { ru: 'test' },
    choices: ['a', 'b', 'c'],
    answer: 1,
    ...overrides,
  } as Question;
}

describe('grade — mc', () => {
  it('is correct when the choice index matches', () => {
    expect(grade(mc(), { kind: 'mc', choiceIndex: 1 }).correct).toBe(true);
  });
  it('is incorrect otherwise', () => {
    expect(grade(mc(), { kind: 'mc', choiceIndex: 0 }).correct).toBe(false);
  });
});

describe('grade — type-answer', () => {
  const q: Question = {
    id: 'q2',
    type: 'type-answer',
    difficulty: 1,
    tags: [],
    generated: false,
    prompt: { ru: 'test' },
    answer: ['hej'],
  };

  it('matches exact text', () => {
    expect(grade(q, { kind: 'type-answer', text: 'hej' }).correct).toBe(true);
  });
  it('is case-insensitive and trims whitespace', () => {
    expect(grade(q, { kind: 'type-answer', text: '  HEJ  ' }).correct).toBe(true);
  });
  it('accepts a near-miss (Levenshtein <= 1) as "almost"', () => {
    const result = grade(q, { kind: 'type-answer', text: 'hejj' });
    expect(result.correct).toBe(true);
    expect(result.almost).toBe(true);
  });
  it('rejects answers further than one edit away', () => {
    expect(grade(q, { kind: 'type-answer', text: 'xyzzy' }).correct).toBe(false);
  });
  it('treats å ä ö as real letters — a swapped diaeresis only counts as a 1-edit near-miss', () => {
    const q2: Question = { ...q, answer: ['sjö'] };
    const nearMiss = grade(q2, { kind: 'type-answer', text: 'sjo' });
    expect(nearMiss.correct).toBe(true);
    expect(nearMiss.almost).toBe(true);
    expect(grade(q2, { kind: 'type-answer', text: 'sjö' })).toEqual({ correct: true });
  });
  it('accepts just the missing words when the hint is a frame with a blank', () => {
    const framed: Question = {
      ...q,
      answer: ['Det är viktigt att laga mat.'],
      hint: { ru: 'Det är viktigt att ___', en: 'Det är viktigt att ___' },
    };
    expect(grade(framed, { kind: 'type-answer', text: 'laga mat' })).toEqual({ correct: true });
    expect(grade(framed, { kind: 'type-answer', text: 'Det är viktigt att laga mat' })).toEqual({ correct: true });
    expect(grade(framed, { kind: 'type-answer', text: 'laga' }).correct).toBe(false);
  });
});

describe('grade — order', () => {
  const q: Question = {
    id: 'q3',
    type: 'order',
    difficulty: 1,
    tags: [],
    generated: false,
    prompt: { ru: 'test' },
    tokens: ['heter', 'Jag', 'Anna'],
    answer: [1, 0, 2],
  };
  it('requires the exact sequence', () => {
    expect(grade(q, { kind: 'order', order: [1, 0, 2] }).correct).toBe(true);
    expect(grade(q, { kind: 'order', order: [0, 1, 2] }).correct).toBe(false);
  });
});

describe('grade — true-false', () => {
  const q: Question = {
    id: 'q4',
    type: 'true-false',
    difficulty: 1,
    tags: [],
    generated: false,
    prompt: { ru: 'test' },
    answer: true,
  };
  it('compares booleans', () => {
    expect(grade(q, { kind: 'true-false', value: true }).correct).toBe(true);
    expect(grade(q, { kind: 'true-false', value: false }).correct).toBe(false);
  });
});

describe('grade — match', () => {
  const q: Question = {
    id: 'q5',
    type: 'match',
    difficulty: 1,
    tags: [],
    generated: false,
    prompt: { ru: 'test' },
    pairs: [
      ['bil', 'en'],
      ['hus', 'ett'],
      ['katt', 'en'],
    ],
  };
  it('accepts either copy of a repeated right-hand side', () => {
    const pairs: Array<[number, number]> = [
      [0, 2],
      [1, 1],
      [2, 0],
    ];
    expect(grade(q, { kind: 'match', pairs }).correct).toBe(true);
  });
  it('rejects a wrong pairing', () => {
    const pairs: Array<[number, number]> = [
      [0, 1],
      [1, 0],
      [2, 2],
    ];
    expect(grade(q, { kind: 'match', pairs }).correct).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { generateHistoryQuestions, historyQuestionId } from '@/content/historyQuestions';
import type { HistoryCard } from '@/content/schema';

function card(id: string, vocab: Array<[string, string, string]>): HistoryCard {
  return {
    id,
    era: 'viking',
    unlockedBy: 'longhouse',
    title: { sv: id },
    date: { from: 900 },
    body: { ru: 'x', en: 'x' },
    vocab: vocab.map(([sv, ru, en]) => ({ sv, ru, en })),
    sources: ['test'],
  };
}

describe('generateHistoryQuestions', () => {
  const a = card('a', [
    ['skepp', 'корабль', 'ship'],
    ['hamn', 'гавань', 'harbour'],
    ['silver', 'серебро', 'silver'],
    ['resa', 'путешествие', 'journey'],
    ['handel', 'торговля', 'trade'],
  ]);
  const b = card('b', [
    ['sten', 'камень', 'stone'],
    ['minne', 'память', 'memory'],
  ]);

  it('produces one mc question per vocab word, with 3 distractors', () => {
    const questions = generateHistoryQuestions(a, [a, b]);
    expect(questions).toHaveLength(5);
    for (const q of questions) {
      expect(q.type).toBe('mc');
      if (q.type === 'mc') {
        expect(q.choices).toHaveLength(4);
        expect(q.answer).toBe(0);
      }
    }
  });

  it('ids are deterministic and match historyQuestionId()', () => {
    const questions = generateHistoryQuestions(a, [a, b]);
    expect(questions.map((q) => q.id)).toEqual(
      a.vocab.map((w) => historyQuestionId('a', w.sv)),
    );
  });

  it('never picks the current word (by sv or ru) as one of its own distractors', () => {
    const questions = generateHistoryQuestions(a, [a, b]);
    for (const q of questions) {
      if (q.type !== 'mc') continue;
      const word = a.vocab.find((w) => historyQuestionId('a', w.sv) === q.id)!;
      // choices[0] is the correct answer itself — only the distractors (the rest) must differ.
      for (const choice of q.choices.slice(1)) {
        if (typeof choice === 'string') continue;
        expect(choice.ru === word.ru && choice.en === word.en).toBe(false);
      }
    }
  });

  it('draws distractors from other cards too when the pool is small', () => {
    const questions = generateHistoryQuestions(b, [a, b]);
    // card b only has 2 words of its own — distractors must come from card a.
    expect(questions.every((q) => q.type === 'mc' && q.choices.length === 4)).toBe(true);
  });
});

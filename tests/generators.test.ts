import { describe, expect, it } from 'vitest';
import { expandGenerators } from '@/content/generators';
import type { VocabItem } from '@/content/schema';

const vocab: VocabItem[] = [
  { id: 'hej', sv: 'hej', translations: { ru: 'привет', en: 'hi' }, pos: 'interjection', forms: null },
  { id: 'nej', sv: 'nej', translations: { ru: 'нет', en: 'no' }, pos: 'interjection', forms: null },
  { id: 'ja', sv: 'ja', translations: { ru: 'да', en: 'yes' }, pos: 'interjection', forms: null },
  { id: 'tack', sv: 'tack', translations: { ru: 'спасибо', en: 'thanks' }, pos: 'interjection', forms: null },
  {
    id: 'bok',
    sv: 'bok',
    translations: { ru: 'книга', en: 'book' },
    pos: 'noun',
    gender: 'en',
    forms: { indefSg: 'en bok', defSg: 'boken', indefPl: 'böcker', defPl: 'böckerna' },
  },
];

describe('expandGenerators', () => {
  it('expands a small vocab list into a much larger question pool', () => {
    const generators = [
      { type: 'sv-to-native-mc' as const, from: 'vocab' as const, count: 'all' as const },
      { type: 'native-to-sv-mc' as const, from: 'vocab' as const, count: 'all' as const },
      { type: 'type-answer' as const, from: 'vocab' as const, count: 'all' as const },
    ];
    const out = expandGenerators(generators, vocab, 'test');
    // 3 generators * 5 vocab items = 15 (all have >=3 distractors available)
    expect(out.length).toBe(15);
  });

  it('never reuses the correct answer as a distractor', () => {
    const out = expandGenerators(
      [{ type: 'sv-to-native-mc', from: 'vocab', count: 'all' }],
      vocab,
      'test',
    );
    for (const q of out) {
      if (q.type !== 'mc') continue;
      const correctValue = JSON.stringify(q.choices[q.answer]);
      const dupes = q.choices.filter((c) => JSON.stringify(c) === correctValue);
      expect(dupes.length).toBe(1);
    }
  });

  it('only generates article/plural questions for nouns with the right data', () => {
    const out = expandGenerators(
      [
        { type: 'article', from: 'vocab', count: 'all', filter: { pos: 'noun' } },
        { type: 'plural', from: 'vocab', count: 'all', filter: { pos: 'noun' } },
      ],
      vocab,
      'test',
    );
    // only "bok" is a noun with gender + forms
    expect(out.length).toBe(2);
  });

  it('produces question ids unique per lesson', () => {
    const out = expandGenerators(
      [{ type: 'sv-to-native-mc', from: 'vocab', count: 'all' }],
      vocab,
      'lesson-a',
    );
    const ids = new Set(out.map((q) => q.id));
    expect(ids.size).toBe(out.length);
  });
});

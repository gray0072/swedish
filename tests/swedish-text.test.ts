import { describe, expect, it } from 'vitest';
import { acceptedSpellings, withoutNotes } from '@/content/swedishText';
import { expandGenerators } from '@/content/generators';
import { grade } from '@/quiz/grading';
import { speakableSwedish } from '@/lib/tts';
import type { Question, VocabItem } from '@/content/schema';

function typed(answer: string, text: string) {
  const q = {
    id: 'q', type: 'type-answer', difficulty: 1, tags: [], generated: false,
    prompt: { en: 'p' }, answer: [answer],
  } as unknown as Question;
  return grade(q, { kind: 'type-answer', text });
}

describe('[notes] and (optional Swedish)', () => {
  it('drops notes and placeholders from what is spoken', () => {
    expect(withoutNotes('anden [accent 1]')).toBe('anden');
    expect(speakableSwedish('gå [om buss/tåg]')).toBe('gå');
    expect(speakableSwedish('Kan jag få prata med [namn]?')).toBe('Kan jag få prata med?');
    expect(speakableSwedish('ARN (Allmänna reklamationsnämnden)')).toBe('ARN (Allmänna reklamationsnämnden)');
  });

  it('accepts a typed answer with or without its optional part', () => {
    expect(typed('tacka nej (till)', 'tacka nej').correct).toBe(true);
    expect(typed('tacka nej (till)', 'tacka nej till').correct).toBe(true);
    expect(typed('ARN (Allmänna reklamationsnämnden)', 'ARN').correct).toBe(true);
  });

  it('never makes the learner type a note, and lets a placeholder be anything', () => {
    expect(typed('gå [om buss/tåg]', 'gå').correct).toBe(true);
    expect(typed('Kan jag få prata med [namn]?', 'Kan jag få prata med Anna Lind?').correct).toBe(true);
    expect(typed('Kan jag få prata med [namn]?', 'Kan jag få prata med').correct).toBe(true);
    expect(typed('Kan jag få prata med [namn]?', 'Kan jag få äta').correct).toBe(false);
  });

  it('reads a slash between words as a choice', () => {
    expect(acceptedSpellings('bäste herr/fru')).toEqual(['bäste herr', 'bäste fru']);
    expect(typed('det var ganska spännande/tråkigt', 'det var ganska tråkigt').correct).toBe(true);
    expect(typed('han/hon behöver träna mer på...', 'hon behöver träna mer på').correct).toBe(true);
  });
});

describe('generated choices', () => {
  const item = (id: string, sv: string, en: string): VocabItem => ({
    id, sv, pos: 'noun', translations: { en, ru: en }, forms: null,
  });

  it('never offers a homograph of the answer, or two identical distractors', () => {
    const vocab = [
      item('man-pron', 'man', 'one (people in general)'),
      item('man-noun', 'man', 'a man'),
      item('ens', 'ens', "one's"),
      item('en', 'en', 'a'),
      item('kvinna', 'kvinna', 'a woman'),
      item('barn', 'barn', 'a child'),
    ];
    const qs = expandGenerators([{ type: 'native-to-sv-mc', from: 'vocab', count: 'all' }], vocab, 'x');
    for (const q of qs) {
      if (q.type !== 'mc') continue;
      const choices = q.choices as string[];
      expect(new Set(choices).size, choices.join(' | ')).toBe(choices.length);
    }
  });
});

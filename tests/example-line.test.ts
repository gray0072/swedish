import { describe, expect, it } from 'vitest';
import { exampleBlockProblems, splitExampleLine } from '@/content/exampleLine';
import { speakableSwedish } from '@/lib/tts';

describe('splitExampleLine', () => {
  it('splits at the first spaced em dash, so the translation may contain more', () => {
    expect(splitExampleLine('December är en mörk månad. — Декабрь — тёмный месяц.')).toEqual({
      sv: 'December är en mörk månad.',
      translation: 'Декабрь — тёмный месяц.',
    });
  });

  it('keeps tankstreck and hyphens inside the Swedish side', () => {
    expect(splitExampleLine('– Tack för hjälpen! – Varsågod!')).toEqual({
      sv: '– Tack för hjälpen! – Varsågod!',
      translation: '',
    });
    expect(splitExampleLine('skriva – skrev – skrivit — to write – wrote – written').sv).toBe(
      'skriva – skrev – skrivit',
    );
    expect(splitExampleLine('A-N-N-A. Stort A.').sv).toBe('A-N-N-A. Stort A.');
  });
});

describe('speakableSwedish', () => {
  it('drops the dialogue dash and marks, and turns arrows and series dashes into pauses', () => {
    expect(speakableSwedish('– Tack för hjälpen! – Varsågod!')).toBe('Tack för hjälpen! Varsågod!');
    expect(speakableSwedish('en bil → ingen bil')).toBe('en bil, ingen bil');
    expect(speakableSwedish('✓ Enligt Berg (2023) är det så.')).toBe('Enligt Berg (2023) är det så.');
    expect(speakableSwedish('e-post')).toBe('e-post');
  });
});

describe('exampleBlockProblems', () => {
  const block = (...lines: string[]) => ['Intro.', '', '```example', ...lines, '```'].join('\n');

  it('accepts well-formed lines', () => {
    expect(exampleBlockProblems(block('Hej! — Hi!', '– Tack! – Varsågod!', 'en bil → ingen bil'))).toEqual([]);
  });

  it('flags a dialogue line that starts with an em dash — it leaves no Swedish to speak', () => {
    expect(exampleBlockProblems(block('— Tack för hjälpen! — Varsågod!'))).toHaveLength(1);
  });

  it('flags a hard-wrapped translation', () => {
    expect(exampleBlockProblems(block('Jag kommer sent imorgon. — I will be late', 'tomorrow.'))).toHaveLength(1);
    expect(exampleBlockProblems(block('Jag kommer sent. — Я опоздаю,', 'наверное — на час.'))).toHaveLength(1);
  });

  it('ignores lines outside example blocks', () => {
    expect(exampleBlockProblems('— A dash in prose is fine.\n\n```\n— and in code too\n```')).toEqual([]);
  });
});

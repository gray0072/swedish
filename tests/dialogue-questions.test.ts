import { describe, expect, it } from 'vitest';
import { dialogueQuestionId, generateDialogueQuestions } from '@/content/dialogueQuestions';
import type { Dialogue } from '@/content/schema';

function dialogue(id: string, lines: Array<[string, string, string, string]>, keyPhrases: string[]): Dialogue {
  return {
    id,
    title: { sv: id },
    setting: { en: 'x', ru: 'x' },
    level: 'sfi-a',
    tags: [],
    roles: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
    ],
    lines: lines.map(([role, sv, en, ru]) => ({ role, sv, en, ru })),
    keyPhrases,
  };
}

describe('generateDialogueQuestions', () => {
  const a = dialogue(
    'a',
    [
      ['A', 'Hej, hur mår du?', 'Hi, how are you?', 'Привет, как дела?'],
      ['B', 'Bra, tack! Och du?', 'Good, thanks! And you?', 'Хорошо, спасибо! А ты?'],
    ],
    ['hur mår du', 'Och du'],
  );
  const b = dialogue(
    'b',
    [
      ['A', 'Vad heter du?', 'What is your name?', 'Как тебя зовут?'],
      ['B', 'Jag heter Eva.', 'My name is Eva.', 'Меня зовут Ева.'],
    ],
    ['Vad heter du'],
  );

  it('produces one mc question per keyPhrase, keyed to the line it occurs in', () => {
    const questions = generateDialogueQuestions(a, [a, b]);
    expect(questions).toHaveLength(2);
    for (const q of questions) {
      expect(q.type).toBe('mc');
      if (q.type === 'mc') expect(q.answer).toBe(0);
    }
  });

  it('the correct choice is the translation of the line the phrase occurs in', () => {
    const [first] = generateDialogueQuestions(a, [a, b]);
    expect(first.type).toBe('mc');
    if (first.type === 'mc') {
      expect(first.choices[0]).toEqual({ en: 'Hi, how are you?', ru: 'Привет, как дела?' });
    }
  });

  it('ids are deterministic and match dialogueQuestionId()', () => {
    const questions = generateDialogueQuestions(a, [a, b]);
    expect(questions.map((q) => q.id)).toEqual(a.keyPhrases.map((p) => dialogueQuestionId('a', p)));
  });

  it('draws distractors from other dialogues too when the pool is small', () => {
    const questions = generateDialogueQuestions(b, [a, b]);
    expect(questions.every((q) => q.type === 'mc' && q.choices.length > 1)).toBe(true);
  });

  it('skips a keyPhrase that has no verbatim occurrence instead of crashing', () => {
    const broken = dialogue('c', [['A', 'Hej!', 'Hi!', 'Привет!']], ['not in there']);
    expect(generateDialogueQuestions(broken, [broken])).toHaveLength(0);
  });
});

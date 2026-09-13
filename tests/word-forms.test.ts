import { describe, expect, it } from 'vitest';
import { wordForms } from '@/content/forms';
import { getAllLessons } from '@/content/registry';
import type { VocabItem } from '@/content/schema';

const base = {
  id: 'x',
  translations: { ru: 'ж', en: 'w' },
} as const;

function noun(sv: string, forms: Record<string, string>): VocabItem {
  return { ...base, sv, pos: 'noun', gender: 'en', forms } as VocabItem;
}

function verb(sv: string, forms: Record<string, string>): VocabItem {
  return { ...base, sv, pos: 'verb', forms } as VocabItem;
}

describe('wordForms', () => {
  it('prints a noun paradigm without repeating the headword', () => {
    const item = noun('kvinna', {
      indefSg: 'en kvinna',
      defSg: 'kvinnan',
      indefPl: 'kvinnor',
      defPl: 'kvinnorna',
    });
    expect(wordForms(item).map((f) => f.value)).toEqual(['kvinnan', 'kvinnor', 'kvinnorna']);
  });

  it('keeps an indefinite singular that is not just the headword with an article', () => {
    const item = noun('människa', {
      indefSg: 'en människa',
      defSg: 'människan',
      indefPl: 'människor',
      defPl: 'människorna',
    });
    expect(wordForms(item)).toHaveLength(3);
  });

  it('drops a verb form that repeats the headword, imperative included', () => {
    const item = verb('Lyssna!', {
      infinitive: 'lyssna',
      present: 'lyssnar',
      past: 'lyssnade',
      supine: 'lyssnat',
      imperative: 'lyssna',
    });
    expect(wordForms(item).map((f) => f.value)).toEqual(['lyssnar', 'lyssnade', 'lyssnat']);
  });

  it('keeps an imperative that differs from every form already shown', () => {
    const item = verb('springa', {
      infinitive: 'springa',
      present: 'springer',
      past: 'sprang',
      supine: 'sprungit',
      imperative: 'spring',
    });
    expect(wordForms(item).map((f) => f.value)).toEqual([
      'springer',
      'sprang',
      'sprungit',
      'spring',
    ]);
  });

  it('labels every form with an i18n key and returns nothing without forms', () => {
    const item = noun('bok', { indefSg: 'en bok', defSg: 'boken', indefPl: 'böcker', defPl: 'böckerna' });
    expect(wordForms(item).map((f) => f.labelKey)).toEqual([
      'lesson.forms.defSg',
      'lesson.forms.indefPl',
      'lesson.forms.defPl',
    ]);
    expect(wordForms({ ...base, sv: 'hej', pos: 'phrase', forms: null } as VocabItem)).toEqual([]);
  });

  it('never leaves an item that has forms in the content with an empty line', () => {
    for (const lesson of getAllLessons()) {
      for (const item of lesson.vocab) {
        if (item.forms) expect(wordForms(item).length).toBeGreaterThan(0);
      }
    }
  });
});

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

  it('never crashes on a real content item, and only returns an empty line for a genuinely invariant word', () => {
    // A real word can be fully invariant — "gratis", an abbreviation like "CSN", an agency
    // name like "Skatteverket" — in which case every form legitimately equals the headword
    // (once articles are stripped, same as `wordForms` does internally) and an empty result
    // is correct, not a content bug.
    const strip = (v: string) => v.trim().toLowerCase().replace(/^(en|ett|att)\s+/, '');
    for (const lesson of getAllLessons()) {
      for (const item of lesson.vocab) {
        if (!item.forms) continue;
        const forms = wordForms(item);
        if (forms.length > 0) continue;
        const headword = strip(item.sv);
        const isInvariant = Object.values(item.forms).every((v) => !v || strip(v) === headword);
        expect(isInvariant).toBe(true);
      }
    }
  });
});

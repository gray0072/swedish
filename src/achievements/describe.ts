import { resolveLocalized, type Achievement, type StudyLanguage } from '@/content/schema';

const PLURAL_ORDER: Record<StudyLanguage, Intl.LDMLPluralRule[]> = {
  en: ['one', 'other'],
  ru: ['one', 'few', 'many'],
};

function formatCount(n: number, lang: StudyLanguage): string {
  return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US').format(n);
}

/**
 * Fills an achievement description for one threshold: `{n}` becomes the number, and
 * `{n|form|form…}` picks the plural form for it — `one|other` in English,
 * `one|few|many` in Russian ("1 урок", "3 урока", "5 уроков").
 */
export function fillCount(template: string, n: number, lang: StudyLanguage): string {
  const rule = new Intl.PluralRules(lang === 'ru' ? 'ru-RU' : 'en-US').select(n);
  return template
    .replace(/\{n\|([^}]*)\}/g, (_, forms: string) => {
      const list = forms.split('|');
      const index = PLURAL_ORDER[lang].indexOf(rule);
      return list[index >= 0 ? index : list.length - 1] ?? list[list.length - 1];
    })
    .replace(/\{n\}/g, formatCount(n, lang));
}

/** The goal a card describes: the next tier, or the last one once every tier is done. */
export function describeAchievement(achievement: Achievement, tier: number, lang: StudyLanguage): string {
  const target = achievement.tiers[Math.min(tier, achievement.tiers.length - 1)];
  return fillCount(resolveLocalized(achievement.description, lang), target, lang);
}

export { formatCount };

import ru from './locales/ru.json';
import en from './locales/en.json';
import { useLanguage } from '@/store/settings';

const dictionaries = { ru, en } as const;
type Key = keyof typeof ru;

function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function useT() {
  const lang = useLanguage();
  const dict = dictionaries[lang];
  return (key: Key, vars?: Record<string, string | number>) =>
    format(dict[key] ?? dictionaries.en[key] ?? key, vars);
}

export type { Key as I18nKey };

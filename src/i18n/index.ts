import en from './locales/en.json';
import ru from './locales/ru.json';
import { useLanguage } from '@/store/settings';

const dictionaries = { en, ru } as const;
// English is the primary language of the project (see AGENTS.md): en.json defines the
// key set, and ru.json is a translation that must carry exactly the same keys.
type Key = keyof typeof en;

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

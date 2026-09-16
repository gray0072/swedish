import type { VocabItem } from './schema';

/** Every key here exists in `src/i18n/locales/en.json`, so `labelKey` fits `useT()`. */
type FormKey = (typeof NOUN_ORDER)[number] | (typeof VERB_ORDER)[number] | (typeof ADJ_ORDER)[number];

export type WordForm = { key: FormKey; labelKey: `lesson.forms.${FormKey}`; value: string };

/** Dictionary order: `en kvinna – kvinnan – kvinnor – kvinnorna`. */
const NOUN_ORDER = ['indefSg', 'defSg', 'indefPl', 'defPl'] as const;
/** Dictionary order: `äta – äter – åt – ätit`. */
const VERB_ORDER = ['infinitive', 'present', 'past', 'supine', 'imperative'] as const;
/** Dictionary order: `stor – stort – stora – större – störst`. */
const ADJ_ORDER = ['neuter', 'plural', 'comparative', 'superlative'] as const;

/** Compare forms the way a reader does: article, case and a trailing `!` do not count. */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^(en|ett|att)\s+/, '')
    .replace(/[!?.]+$/, '');
}

/**
 * The forms worth printing next to the headword — in dictionary order, and without the
 * one that merely repeats the headword itself (`kvinna` for `en kvinna`, `lyssna` for
 * the imperative `Lyssna!`) or a form already shown (group 1 verbs: infinitive and
 * imperative are the same word).
 */
export function wordForms(item: VocabItem): WordForm[] {
  const forms = item.forms;
  if (!forms) return [];
  const order = 'infinitive' in forms ? VERB_ORDER : 'positive' in forms ? ADJ_ORDER : NOUN_ORDER;
  const values = forms as Record<string, string | undefined>;
  const seen = new Set([normalize(item.sv)]);
  const out: WordForm[] = [];
  for (const key of order) {
    const value = values[key]?.trim();
    if (!value) continue;
    const normalized = normalize(value);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push({ key, labelKey: `lesson.forms.${key}`, value });
  }
  return out;
}

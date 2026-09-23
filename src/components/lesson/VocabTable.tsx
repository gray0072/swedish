import type { VocabItem } from '@/content/schema';
import { resolveLocalized, type StudyLanguage } from '@/content/schema';
import { wordForms } from '@/content/forms';
import AudioButton from './AudioButton';
import { speakSwedish } from '@/lib/tts';
import { useT } from '@/i18n';

function GenderTag({ gender }: { gender: 'en' | 'ett' | null | undefined }) {
  const t = useT();
  if (!gender) return null;
  return (
    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-semibold text-falu dark:text-gold">
      {gender === 'en' ? t('lesson.gender.en') : t('lesson.gender.ett')}
    </span>
  );
}

/** The rest of the paradigm under the headword: `kvinnan · kvinnor · kvinnorna`. */
function WordForms({ item }: { item: VocabItem }) {
  const t = useT();
  const forms = wordForms(item);
  if (forms.length === 0) return null;
  return (
    <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 pl-8 text-xs text-granite/90 dark:text-birch/50">
      {forms.map((form, index) => (
        // The separator travels with the form it precedes, so a wrapped line never
        // leaves a dot dangling at the end of the previous one.
        <span key={form.key} className="flex items-baseline gap-x-1.5">
          {index > 0 && (
            <span aria-hidden className="text-granite/40 dark:text-birch/25">
              ·
            </span>
          )}
          <span className="sv-word" title={t(form.labelKey)}>
            {form.value}
          </span>
        </span>
      ))}
    </p>
  );
}

export default function VocabTable({ items, lang }: { items: VocabItem[]; lang: StudyLanguage }) {
  const t = useT();
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="card !p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AudioButton text={item.sv} />
              <span className="sv-word text-base">{item.sv}</span>
              <GenderTag gender={item.gender} />
            </div>
          </div>
          <WordForms item={item} />
          <p className="mt-1 pl-8 text-sm text-granite dark:text-birch/70">
            {resolveLocalized(item.translations, lang)}
          </p>
          {item.example && (
            <div className="mt-2 flex items-start gap-1.5 border-t border-granite/10 pl-8 pt-2 text-xs text-granite dark:border-white/10 dark:text-birch/60">
              <span className="italic">
                {t('lesson.vocab.example')}:{' '}
                <button
                  type="button"
                  onClick={() => speakSwedish(item.example!.sv)}
                  title={`Lyssna: ${item.example.sv}`}
                  className="sv-word text-left italic underline decoration-dotted decoration-granite/40 underline-offset-2 hover:text-falu dark:decoration-birch/30 dark:hover:text-gold"
                >
                  {item.example.sv}
                </button>
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

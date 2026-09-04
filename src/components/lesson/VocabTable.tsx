import type { VocabItem } from '@/content/schema';
import { resolveLocalized, type StudyLanguage } from '@/content/schema';
import AudioButton from './AudioButton';
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
          <p className="mt-1 pl-8 text-sm text-granite dark:text-birch/70">
            {resolveLocalized(item.translations, lang)}
          </p>
          {item.example && (
            <div className="mt-2 flex items-start gap-1.5 border-t border-granite/10 pl-8 pt-2 text-xs text-granite dark:border-white/10 dark:text-birch/60">
              <span className="italic">
                {t('lesson.vocab.example')}: {item.example.sv}
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

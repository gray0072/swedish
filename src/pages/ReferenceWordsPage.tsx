import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { resolveLocalized, type StudyLanguage } from '@/content/schema';
import { getWordBank, type WordBankRow, type WordBankSectionKey } from '@/content/registry';
import AudioButton from '@/components/lesson/AudioButton';
import SwedishText from '@/components/lesson/SwedishText';

const SECTIONS: WordBankSectionKey[] = ['verbs', 'nouns', 'adjectives', 'other'];

function matchesQuery(row: WordBankRow, query: string): boolean {
  return (
    row.vocab.sv.toLowerCase().includes(query) ||
    row.vocab.translations.ru.toLowerCase().includes(query) ||
    row.vocab.translations.en.toLowerCase().includes(query)
  );
}

function Cell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-3 py-2 text-sm ${className}`}>{children}</td>;
}

function Dash() {
  return <span className="text-granite/40 dark:text-birch/30">—</span>;
}

function LessonLink({ row, lang }: { row: WordBankRow; lang: StudyLanguage }) {
  return (
    <Link
      to={`/lesson/${row.lessonId}`}
      className="text-falu hover:underline dark:text-gold"
    >
      {resolveLocalized(row.lessonTitle, lang)}
    </Link>
  );
}

function SvHead({ row }: { row: WordBankRow }) {
  return (
    <span className="flex items-center gap-1.5">
      <AudioButton text={row.vocab.sv} />
      <span className="sv-word"><SwedishText text={row.vocab.sv} /></span>
    </span>
  );
}

/**
 * One wide table per REFERENCE.md §5.2 — verbs/nouns/adjectives get their own paradigm
 * columns, everything else gets a part-of-speech column instead. This is the only
 * horizontally-scrolling element in the app (SPEC §10 makes an explicit exception for it).
 */
function WordTable({
  section,
  rows,
  lang,
}: {
  section: WordBankSectionKey;
  rows: WordBankRow[];
  lang: StudyLanguage;
}) {
  const t = useT();

  const headers: string[] =
    section === 'verbs'
      ? [
          t('lesson.forms.infinitive'),
          t('lesson.forms.present'),
          t('lesson.forms.past'),
          t('lesson.forms.supine'),
          t('lesson.forms.imperative'),
          t('reference.words.col.group'),
          t('reference.words.col.translation'),
          t('reference.words.col.lesson'),
        ]
      : section === 'nouns'
        ? [
            t('lesson.forms.indefSg'),
            t('lesson.forms.defSg'),
            t('lesson.forms.indefPl'),
            t('lesson.forms.defPl'),
            t('reference.words.col.translation'),
            t('reference.words.col.lesson'),
          ]
        : section === 'adjectives'
          ? [
              t('reference.words.col.positiveEn'),
              t('reference.words.col.positiveEtt'),
              t('reference.words.col.plural'),
              t('reference.words.col.comparative'),
              t('reference.words.col.superlative'),
              t('reference.words.col.translation'),
              t('reference.words.col.lesson'),
            ]
          : [
              t('reference.words.col.word'),
              t('reference.words.col.partOfSpeech'),
              t('reference.words.col.translation'),
              t('reference.words.col.example'),
              t('reference.words.col.lesson'),
            ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-granite/15 text-xs font-semibold uppercase tracking-wide text-granite/70 dark:border-white/10 dark:text-birch/50">
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-granite/10 dark:divide-white/10">
          {rows.map((row) => (
            <Row key={`${row.vocab.pos}:${row.vocab.sv}`} section={section} row={row} lang={lang} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  section,
  row,
  lang,
}: {
  section: WordBankSectionKey;
  row: WordBankRow;
  lang: StudyLanguage;
}) {
  const t = useT();
  const translation = resolveLocalized(row.vocab.translations, lang);

  if (section === 'verbs') {
    const forms = row.vocab.forms && 'infinitive' in row.vocab.forms ? row.vocab.forms : null;
    return (
      <tr>
        <Cell>
          <SvHead row={row} />
        </Cell>
        <Cell>{forms?.present ?? <Dash />}</Cell>
        <Cell>{forms?.past ?? <Dash />}</Cell>
        <Cell>{forms?.supine ?? <Dash />}</Cell>
        <Cell>{forms?.imperative ?? <Dash />}</Cell>
        <Cell>{row.vocab.verbGroup ?? <Dash />}</Cell>
        <Cell>{translation}</Cell>
        <Cell>
          <LessonLink row={row} lang={lang} />
        </Cell>
      </tr>
    );
  }

  if (section === 'nouns') {
    const forms = row.vocab.forms && 'indefSg' in row.vocab.forms ? row.vocab.forms : null;
    return (
      <tr>
        <Cell>
          <SvHead row={row} />
        </Cell>
        <Cell>{forms?.defSg ?? <Dash />}</Cell>
        <Cell>{forms?.indefPl ?? <Dash />}</Cell>
        <Cell>{forms?.defPl ?? <Dash />}</Cell>
        <Cell>{translation}</Cell>
        <Cell>
          <LessonLink row={row} lang={lang} />
        </Cell>
      </tr>
    );
  }

  if (section === 'adjectives') {
    const forms = row.vocab.forms && 'positive' in row.vocab.forms ? row.vocab.forms : null;
    return (
      <tr>
        <Cell>
          <SvHead row={row} />
        </Cell>
        <Cell>{forms?.neuter ?? <Dash />}</Cell>
        <Cell>{forms?.plural ?? <Dash />}</Cell>
        <Cell>{forms?.comparative ?? <Dash />}</Cell>
        <Cell>{forms?.superlative ?? <Dash />}</Cell>
        <Cell>{translation}</Cell>
        <Cell>
          <LessonLink row={row} lang={lang} />
        </Cell>
      </tr>
    );
  }

  return (
    <tr>
      <Cell>
        <SvHead row={row} />
      </Cell>
      <Cell>{t(`reference.words.posLabel.${row.vocab.pos}` as never)}</Cell>
      <Cell>{translation}</Cell>
      <Cell className="max-w-xs truncate">{row.vocab.example?.sv ?? <Dash />}</Cell>
      <Cell>
        <LessonLink row={row} lang={lang} />
      </Cell>
    </tr>
  );
}

export default function ReferenceWordsPage() {
  const t = useT();
  const lang = useLanguage();
  const [section, setSection] = useState<WordBankSectionKey>('verbs');
  const [query, setQuery] = useState('');
  const [openBands, setOpenBands] = useState<Set<number>>(new Set([0]));

  const wordBank = useMemo(() => getWordBank(), []);
  const activeSection = wordBank.find((s) => s.key === section);

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const filteredRows = useMemo(() => {
    if (!isSearching || !activeSection) return [];
    return activeSection.bands.flatMap((b) => b.rows).filter((r) => matchesQuery(r, trimmedQuery));
  }, [activeSection, isSearching, trimmedQuery]);

  function switchSection(next: WordBankSectionKey) {
    setSection(next);
    setOpenBands(new Set([0]));
  }

  if (!activeSection) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => switchSection(key)}
            className={
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors ' +
              (section === key
                ? 'bg-falu text-birch dark:bg-gold dark:text-midnight'
                : 'bg-granite/10 text-granite hover:bg-granite/20 dark:bg-white/10 dark:text-birch/70')
            }
          >
            {t(`reference.words.pos.${key}` as never)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-granite/50 dark:text-birch/40"
          size={16}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('reference.words.searchPlaceholder')}
          className="w-full rounded-xl border border-granite/20 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-falu dark:border-white/15"
        />
      </div>

      {!isSearching && (
        <p className="text-xs text-granite/70 dark:text-birch/50">{t('reference.words.frequencyNote')}</p>
      )}

      {isSearching ? (
        filteredRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-granite dark:text-birch/60">
            {t('reference.words.noResults', { query })}
          </p>
        ) : (
          <div className="card !p-3">
            <WordTable section={section} rows={filteredRows} lang={lang} />
          </div>
        )
      ) : (
        <div className="space-y-3">
          {activeSection.bands.map((b, i) => {
            const isOpen = openBands.has(i);
            return (
              <details
                key={i}
                open={isOpen}
                onToggle={(e) => {
                  const nowOpen = (e.target as HTMLDetailsElement).open;
                  setOpenBands((prev) => {
                    const next = new Set(prev);
                    if (nowOpen) next.add(i);
                    else next.delete(i);
                    return next;
                  });
                }}
                className="card p-0"
              >
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-falu dark:text-gold">
                  {t('reference.words.band', { from: b.from, to: b.to })}
                </summary>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <WordTable section={section} rows={b.rows} lang={lang} />
                  </div>
                )}
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { HistoryCard as HistoryCardData } from '@/content/schema';
import { resolveLocalized } from '@/content/schema';
import { useLanguage } from '@/store/settings';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { getHistoryQuestionIdsForCard } from '@/content/registry';
import AudioButton from '@/components/lesson/AudioButton';

const READ_REWARD = 15;

export default function HistoryCard({ card }: { card: HistoryCardData }) {
  const t = useT();
  const lang = useLanguage();
  const [open, setOpen] = useState(false);
  const isRead = useAppStore((s) => s.historyRead.includes(card.id));
  const markHistoryRead = useAppStore((s) => s.markHistoryRead);
  const seedReviewItems = useAppStore((s) => s.seedReviewItems);

  const years = card.date.to ? `${card.date.from}–${card.date.to}` : `${card.date.from}`;

  return (
    <div className="card border-l-4 !border-l-falu">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!isRead) {
            markHistoryRead(card.id, READ_REWARD);
            seedReviewItems(getHistoryQuestionIdsForCard(card.id));
          }
        }}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="font-display text-lg font-semibold">{resolveLocalized(card.title, lang)}</p>
          <p className="text-xs text-granite dark:text-birch/50">{years}</p>
        </div>
        {isRead ? (
          <span className="text-xs font-semibold text-pine dark:text-aurora">✓ {t('city.history.read')}</span>
        ) : (
          <span className="text-xs font-semibold text-falu dark:text-gold">
            {t('city.history.reward', { coins: READ_REWARD })}
          </span>
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-granite/10 pt-3 text-sm dark:border-white/10">
          <p>{resolveLocalized({ ru: card.body.ru, en: card.body.en }, lang)}</p>
          <ul className="flex flex-wrap gap-1.5">
            {card.vocab.map((w) => (
              <li
                key={w.sv}
                className="flex items-center gap-1 rounded-full bg-granite/10 py-0.5 pl-1 pr-2.5 text-xs dark:bg-white/10"
              >
                <AudioButton text={w.sv} />
                <span className="sv-word">{w.sv}</span>
                <span className="text-granite/70 dark:text-birch/50">— {resolveLocalized(w, lang)}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-granite/60 dark:text-birch/40">
            {t('city.history.readMore')}: {card.sources.join(' · ')}
          </p>
        </div>
      )}
    </div>
  );
}

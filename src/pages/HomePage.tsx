import { Link } from 'react-router-dom';
import { Flame, Landmark, RotateCcw } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { useWallet, useStreak } from '@/store/wallet';
import { useAllLessonProgress, useDueReviewCount } from '@/store/progress';
import { useCurrentEra, useOwnedBuildingCount, totalBuildingsCount } from '@/store/city';
import { getAllLessons } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { formatNumber } from '@/lib/format';

export default function HomePage() {
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const streak = useStreak();
  const dueCount = useDueReviewCount();
  const lessonsProgress = useAllLessonProgress();
  const era = useCurrentEra();
  const ownedBuildings = useOwnedBuildingCount();

  const allLessons = getAllLessons();
  const nextLesson = allLessons.find((l) => !lessonsProgress[l.meta.id]?.passed) ?? allLessons[0];

  return (
    <div className="space-y-6">
      <section className="card !bg-falu/5 dark:!bg-falu/10">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t('home.hero.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-granite dark:text-birch/70">
          {t('home.hero.subtitle')}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <span className="text-gold">★</span> {formatNumber(wallet.xp)} {t('home.wallet.xp')}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <span>🪙</span> {formatNumber(wallet.coins)} {t('home.wallet.coins')}
          </div>
          {streak.current > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-falu dark:text-gold">
              <Flame size={16} aria-hidden="true" /> {streak.current} {t('home.streak.days')}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {nextLesson && (
          <Link to={`/lesson/${nextLesson.meta.levels[0]}/${nextLesson.meta.slug}`} className="card block hover:border-falu/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-granite dark:text-birch/50">
              {t('home.continue')}
            </p>
            <p className="mt-1 text-lg font-semibold">{resolveLocalized(nextLesson.meta.title, lang)}</p>
            <p className="mt-1 text-sm text-granite dark:text-birch/70">
              {resolveLocalized(nextLesson.meta.summary, lang)}
            </p>
          </Link>
        )}

        <Link to="/review" className="card block hover:border-falu/40">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-granite dark:text-birch/50">
            <RotateCcw size={13} aria-hidden="true" /> {t('home.dueReviews.title')}
          </p>
          {dueCount > 0 ? (
            <>
              <p className="mt-1 text-lg font-semibold">
                {dueCount} {t('home.dueReviews.count')}
              </p>
              <span className="mt-1 inline-block text-sm font-semibold text-falu dark:text-gold">
                {t('home.dueReviews.cta')} →
              </span>
            </>
          ) : (
            <p className="mt-1 text-sm text-granite dark:text-birch/70">{t('home.dueReviews.empty')}</p>
          )}
        </Link>
      </div>

      <Link to="/city" className="card flex items-center justify-between hover:border-falu/40">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-granite dark:text-birch/50">
            <Landmark size={13} aria-hidden="true" /> {t('home.city.title')}
          </p>
          <p className="mt-1 text-lg font-semibold">{resolveLocalized(era.name, lang)}</p>
          <p className="mt-1 text-sm text-granite dark:text-birch/70">
            {ownedBuildings}/{totalBuildingsCount()}
          </p>
        </div>
        <span className="text-sm font-semibold text-falu dark:text-gold">{t('home.city.cta')} →</span>
      </Link>

      <Link to="/tracks" className="block text-center text-sm font-semibold text-falu hover:underline dark:text-gold">
        {t('home.browseTracks')} →
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Landmark, RotateCcw } from 'lucide-react';
import { useT } from '@/i18n';
import { SECONDARY_NAV } from '@/components/layout/secondaryNav';
import { useLanguage } from '@/store/settings';
import { useAllLessonProgress, useDueReviewCount } from '@/store/progress';
import { useCurrentEra, useOwnedBuildingCount, totalBuildingsCount } from '@/store/city';
import { getAllLessons } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import WalletBar from '@/components/ui/WalletBar';
import PerkPanel from '@/components/city/PerkDisplay';

export default function HomePage() {
  const t = useT();
  const lang = useLanguage();
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
      </section>

      <WalletBar />
      <PerkPanel />

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

      {/* The way in to everything the header no longer carries (`secondaryNav.ts`), repeated
          here so it is reachable from the first screen and not only from Topics. */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-sm font-semibold text-falu dark:text-gold">
        <Link to="/tracks" className="hover:underline">
          {t('home.browseTracks')} →
        </Link>
        {SECONDARY_NAV.map(({ to, key }) => (
          <Link key={to} to={to} className="hover:underline">
            {t(key)} →
          </Link>
        ))}
      </div>
    </div>
  );
}

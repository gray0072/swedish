import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useT } from '@/i18n';
import { SECONDARY_NAV } from '@/components/layout/secondaryNav';
import { useDueReviewCount } from '@/store/progress';
import WalletBar from '@/components/ui/WalletBar';
import PerkPanel from '@/components/city/PerkDisplay';
import NextLessonCard from '@/components/lesson/NextLessonCard';
import CityGoalCard from '@/components/city/CityGoalCard';

export default function HomePage() {
  const t = useT();
  const dueCount = useDueReviewCount();

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
        <NextLessonCard />

        <Link to="/review" className="card card-hover block hover:border-falu/40">
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

      <CityGoalCard />

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

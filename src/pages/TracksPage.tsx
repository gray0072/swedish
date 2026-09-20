import { Link } from 'react-router-dom';
import { useT } from '@/i18n';
import { SECONDARY_NAV } from '@/components/layout/secondaryNav';
import { useLanguage } from '@/store/settings';
import { getTracks, getLessonsForLevel } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { useAllLessonProgress } from '@/store/progress';
import ProgressBar from '@/components/ui/ProgressBar';

export default function TracksPage() {
  const t = useT();
  const lang = useLanguage();
  const tracks = getTracks();
  const lessonsProgress = useAllLessonProgress();

  return (
    <div className="space-y-8">
      {/* Review, stats and the reference used to be header tabs; the header could not hold
          seven of them, so they live here — next to the reference link that was already here
          (`secondaryNav.ts`). */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="text-2xl font-semibold">{t('tracks.title')}</h1>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {SECONDARY_NAV.map(({ to, icon: Icon, key }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1.5 text-sm font-semibold text-falu hover:underline dark:text-gold"
            >
              <Icon size={15} aria-hidden="true" />
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
      {tracks.map((track) => (
        <section key={track.id}>
          <h2 className="mb-1 text-lg font-semibold">{resolveLocalized(track.title, lang)}</h2>
          {track.note && (
            <p className="mb-3 text-xs text-granite dark:text-birch/50">
              {resolveLocalized(track.note, lang)}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {track.levels.map((level) => {
              const lessons = getLessonsForLevel(level.id);
              const passed = lessons.filter((l) => lessonsProgress[l.meta.id]?.passed).length;
              return (
                <Link
                  key={level.id}
                  to={`/tracks/${track.id}/${level.id}`}
                  className="card block hover:border-falu/40"
                >
                  <p className="font-semibold">{resolveLocalized(level.title, lang)}</p>
                  <p className="mt-1 text-xs text-granite dark:text-birch/60">
                    {passed > 0 ? `${passed} / ${lessons.length}` : lessons.length}{' '}
                    {t('level.lessonsCount')}
                  </p>
                  {lessons.length > 0 && (
                    <div className="mt-2">
                      <ProgressBar value={passed} max={lessons.length} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

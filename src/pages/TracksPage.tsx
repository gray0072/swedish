import { Link } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { useT } from '@/i18n';
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('tracks.title')}</h1>
        <Link
          to="/grammar"
          className="flex items-center gap-1.5 text-sm font-semibold text-falu hover:underline dark:text-gold"
        >
          <ScrollText size={15} aria-hidden="true" />
          {t('tracks.grammarLink')}
        </Link>
      </div>
      {tracks.map((track) => (
        <section key={track.id}>
          <h2 className="mb-1 text-lg font-semibold">{resolveLocalized(track.title, lang)}</h2>
          {track.id === 'sfi' && (
            <p className="mb-3 text-xs text-granite dark:text-birch/50">{t('tracks.sfi.note')}</p>
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
                    {lessons.length} {t('level.lessonsCount')}
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

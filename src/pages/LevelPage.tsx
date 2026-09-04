import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getLevel, getLessonsForLevel, groupLessonsForList } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { useAllLessonProgress } from '@/store/progress';
import { CheckCircle2 } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

export default function LevelPage() {
  const { trackId = '', levelId = '' } = useParams();
  const t = useT();
  const lang = useLanguage();
  const level = getLevel(trackId, levelId);
  const lessons = getLessonsForLevel(levelId);
  const groups = groupLessonsForList(lessons);
  const progress = useAllLessonProgress();

  if (!level) return <NotFoundPage />;

  return (
    <div className="space-y-4">
      <Link to="/tracks" className="text-sm text-granite hover:underline dark:text-birch/60">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-semibold">{resolveLocalized(level.title, lang)}</h1>

      <ul className="space-y-2">
        {groups.map((group) => {
          const first = group.lessons[0];
          const allPassed = group.lessons.every((l) => progress[l.meta.id]?.passed);
          const target = `/lesson/${levelId}/${first.meta.slug}`;
          return (
            <li key={group.key}>
              <Link to={target} className="card flex items-center justify-between hover:border-falu/40">
                <div>
                  <p className="font-semibold">
                    {resolveLocalized(first.meta.title, lang)}
                    {group.series && (
                      <span className="ml-2 text-xs font-normal text-granite dark:text-birch/50">
                        · {group.lessons.length} {t('level.part')}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-granite dark:text-birch/60">
                    {first.meta.estimatedMinutes} {t('level.minutes')}
                  </p>
                </div>
                {allPassed && <CheckCircle2 className="text-pine dark:text-aurora" size={20} aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

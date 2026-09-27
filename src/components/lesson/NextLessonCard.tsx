import { Link } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { useAllLessonProgress } from '@/store/progress';
import { findNextOpenLesson, lessonPath } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';

/**
 * "Continue": the first lesson on the ladder not yet passed (`findNextOpenLesson`). Shown on
 * the home page and at the foot of the city, where spending coins naturally leads back to
 * earning them. Renders nothing once every lesson is passed.
 */
export default function NextLessonCard({ className = '' }: { className?: string }) {
  const t = useT();
  const lang = useLanguage();
  const progress = useAllLessonProgress();
  const lesson = findNextOpenLesson((id) => Boolean(progress[id]?.passed));
  if (!lesson) return null;

  return (
    <Link to={lessonPath(lesson)} className={`card card-hover block hover:border-falu/40 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-granite dark:text-birch/50">
        {t('home.continue')}
      </p>
      <p className="mt-1 text-lg font-semibold">{resolveLocalized(lesson.meta.title, lang)}</p>
      <p className="mt-1 text-sm text-granite dark:text-birch/70">{resolveLocalized(lesson.meta.summary, lang)}</p>
    </Link>
  );
}

import { BookOpen } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { resolveLocalized } from '@/content/schema';
import { getReferenceArticle, getLessonsBySlug } from '@/content/registry';
import { getLessonSlugsForArticle } from '@/content/referenceLinks';
import TheoryView from '@/components/lesson/TheoryView';
import NotFoundPage from './NotFoundPage';

export default function ReferenceArticlePage() {
  const { slug = '' } = useParams();
  const t = useT();
  const lang = useLanguage();
  const article = getReferenceArticle(slug);

  if (!article) return <NotFoundPage />;

  const body = lang === 'ru' && article.bodyRu ? article.bodyRu : article.bodyEn;
  // The lessons that drill this article's point (REFERENCE.md §6.4) — a grammar point
  // repeats across neighbouring levels, so one lesson slug can resolve to several lessons.
  const drilledBy = getLessonSlugsForArticle(slug).flatMap((lessonSlug) => getLessonsBySlug(lessonSlug));

  return (
    <div className="space-y-4">
      <Link
        to="/reference/summaries"
        className="text-sm text-granite hover:underline dark:text-birch/60"
      >
        ← {t('common.back')}
      </Link>
      <TheoryView markdown={body} />
      {drilledBy.length > 0 && (
        <div className="border-t border-granite/10 pt-3 dark:border-white/10">
          <p className="mb-2 text-sm font-semibold text-granite dark:text-birch/70">
            {t('reference.drilledBy')}
          </p>
          <ul className="flex flex-wrap gap-2">
            {drilledBy.map((lesson) => (
              <li key={lesson.meta.id}>
                <Link
                  to={`/lesson/${lesson.meta.id}`}
                  className="flex items-center gap-1.5 rounded-full bg-granite/10 px-3 py-1.5 text-sm text-granite hover:bg-granite/20 dark:bg-white/10 dark:text-birch/70 dark:hover:bg-white/20"
                >
                  <BookOpen size={14} aria-hidden="true" />
                  {resolveLocalized(lesson.meta.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

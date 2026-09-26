import { useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getLesson } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { getArticleSlugForLessonSlug } from '@/content/referenceLinks';
import { useLessonProgress } from '@/store/progress';
import TheoryView from '@/components/lesson/TheoryView';
import VocabTable from '@/components/lesson/VocabTable';
import { displayTags } from '@/content/tags';
import { KindBadge, TagChips } from '@/components/lesson/LessonBadges';
import NotFoundPage from './NotFoundPage';

export default function LessonPage() {
  const { levelId = '', slug = '' } = useParams();
  const lessonId = `${levelId}/${slug}`;
  const t = useT();
  const lang = useLanguage();
  const lesson = getLesson(lessonId);
  const progress = useLessonProgress(lessonId);

  // A lesson is read top-down: opening one from a scrolled course list starts at its title.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [lessonId]);

  if (!lesson) return <NotFoundPage />;

  const articleSlug =
    lesson.meta.kind === 'grammar' ? getArticleSlugForLessonSlug(lesson.meta.slug) : undefined;

  return (
    <div className="space-y-6">
      <Link to="/tracks" className="text-sm text-granite hover:underline dark:text-birch/60">
        ← {t('common.back')}
      </Link>

      <div>
        <KindBadge kind={lesson.meta.kind} className="mb-1.5" />
        <h1 className="text-2xl font-semibold">{resolveLocalized(lesson.meta.title, lang)}</h1>
        {lesson.meta.summary && (
          <p className="mt-1 text-sm text-granite dark:text-birch/70">
            {resolveLocalized(lesson.meta.summary, lang)}
          </p>
        )}
        <TagChips tags={displayTags(lesson.meta)} className="mt-3" />
        {progress?.passed && (
          <p className="mt-2 text-sm font-semibold text-pine dark:text-aurora">
            ✓ {t('lesson.passed')} · {t('lesson.bestScore')}: {progress.bestScore}/
            {lesson.meta.quiz.questionsPerRun}
          </p>
        )}
      </div>

      {(() => {
        const theory = (lang === 'ru' ? lesson.theoryRu : lesson.theoryEn) ?? lesson.theoryEn ?? lesson.theoryRu;
        return (
          theory && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">{t('lesson.theory')}</h2>
              <TheoryView markdown={theory} />
              {articleSlug && (
                <Link
                  to={`/reference/summaries/${articleSlug}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-falu hover:underline dark:text-gold"
                >
                  <ScrollText size={15} aria-hidden="true" />
                  {t('reference.seeWholeSystem')}
                </Link>
              )}
            </section>
          )
        );
      })()}

      {lesson.vocab.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">{t('lesson.vocab')}</h2>
          <VocabTable items={lesson.vocab} lang={lang} />
        </section>
      )}

      <Link to={`/lesson/${levelId}/${slug}/quiz`} className="btn-primary w-full sm:w-auto">
        {progress?.passed ? t('lesson.retakeQuiz') : t('lesson.startQuiz')}
      </Link>
    </div>
  );
}

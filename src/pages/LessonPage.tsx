import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getLesson } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { useLessonProgress } from '@/store/progress';
import TheoryView from '@/components/lesson/TheoryView';
import VocabTable from '@/components/lesson/VocabTable';
import NotFoundPage from './NotFoundPage';

export default function LessonPage() {
  const { levelId = '', slug = '' } = useParams();
  const lessonId = `${levelId}/${slug}`;
  const t = useT();
  const lang = useLanguage();
  const lesson = getLesson(lessonId);
  const progress = useLessonProgress(lessonId);

  if (!lesson) return <NotFoundPage />;

  return (
    <div className="space-y-6">
      <Link to="/tracks" className="text-sm text-granite hover:underline dark:text-birch/60">
        ← {t('common.back')}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{resolveLocalized(lesson.meta.title, lang)}</h1>
        {lesson.meta.summary && (
          <p className="mt-1 text-sm text-granite dark:text-birch/70">
            {resolveLocalized(lesson.meta.summary, lang)}
          </p>
        )}
        {progress?.passed && (
          <p className="mt-2 text-sm font-semibold text-pine dark:text-aurora">
            ✓ {t('lesson.passed')} · {t('lesson.bestScore')}: {progress.bestScore}/
            {lesson.meta.quiz.questionsPerRun}
          </p>
        )}
      </div>

      {(() => {
        const theory = (lang === 'en' ? lesson.theoryEn : lesson.theory) ?? lesson.theory ?? lesson.theoryEn;
        return (
          theory && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">{t('lesson.theory')}</h2>
              <TheoryView markdown={theory} />
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

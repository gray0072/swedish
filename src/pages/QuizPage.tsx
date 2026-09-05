import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLesson } from '@/content/registry';
import { useT } from '@/i18n';
import type { RewardResult } from '@/quiz/engine';
import QuizRunner from '@/components/quiz/QuizRunner';
import NotFoundPage from './NotFoundPage';

export default function QuizPage() {
  const { levelId = '', slug = '' } = useParams();
  const lessonId = `${levelId}/${slug}`;
  const navigate = useNavigate();
  const t = useT();
  const lesson = getLesson(lessonId);

  const handleFinish = useCallback(
    (reward: RewardResult) => {
      navigate(`/lesson/${levelId}/${slug}/result`, { state: { reward }, replace: true });
    },
    [navigate, levelId, slug],
  );

  if (!lesson) return <NotFoundPage />;

  const handleQuit = () => {
    if (window.confirm(t('quiz.confirmQuit'))) {
      navigate(`/lesson/${levelId}/${slug}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={handleQuit} className="btn-ghost text-xs">
          {t('quiz.quit')}
        </button>
      </div>
      {/* key forces a full remount on lesson change — QuizRunner's session lives in a lazy
          useState initializer that only runs once, so without this a client-side navigation
          straight from one lesson's quiz to another's would keep the old session. */}
      <QuizRunner key={lesson.meta.id} lesson={lesson} onFinish={handleFinish} />
    </div>
  );
}

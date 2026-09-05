import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { usePerks } from '@/store/city';
import { isDue } from '@/srs/scheduler';
import { findAnyQuestionById } from '@/content/registry';
import { grade, type Answer, type GradeResult } from '@/quiz/grading';
import { prepareQuestion } from '@/quiz/engine';
import { hashSeed, mulberry32 } from '@/quiz/prng';
import type { Question } from '@/content/schema';
import QuestionRenderer from '@/components/quiz/QuestionRenderer';
import ProgressBar from '@/components/ui/ProgressBar';
import DalaHorse from '@/components/ui/DalaHorse';

const BASE_REVIEW_CAP = 20;
const REVIEW_COIN_BONUS = 20;

export default function ReviewPage() {
  const t = useT();
  const items = useAppStore((s) => s.items);
  const recordItemAnswer = useAppStore((s) => s.recordItemAnswer);
  const touchDailyActivity = useAppStore((s) => s.touchDailyActivity);
  const addCoins = useAppStore((s) => s.addCoins);
  const perks = usePerks();

  const dueQuestions = useMemo(() => {
    const cap = BASE_REVIEW_CAP + perks.extraReviewSlots;
    const due = Object.entries(items)
      .filter(([, stat]) => isDue(stat.dueAt))
      .sort((a, b) => new Date(a[1].dueAt).getTime() - new Date(b[1].dueAt).getTime())
      .slice(0, cap);
    const rng = mulberry32(hashSeed(`review:${Date.now()}`));
    return due
      .map(([id]) => findAnyQuestionById(id))
      .filter((q): q is Question => Boolean(q))
      // Generated questions always author the correct choice first — without this, the
      // review deck would make every mc/listen question "always pick option 1".
      .map((q) => prepareQuestion(q, rng));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<GradeResult | null>(null);
  const [done, setDone] = useState(false);
  const [resetTick, setResetTick] = useState(0);

  if (dueQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-semibold">{t('review.title')}</h1>
        <DalaHorse className="mx-auto h-24 w-auto opacity-80" />
        <p className="text-granite dark:text-birch/70">{t('review.empty')}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <PartyPopper className="mx-auto text-gold" size={40} aria-hidden="true" />
        <h1 className="text-xl font-semibold">{t('review.done.title')}</h1>
        <p className="text-sm text-granite dark:text-birch/70">{t('review.done.subtitle')}</p>
        <p className="text-sm font-semibold text-falu dark:text-gold">+{REVIEW_COIN_BONUS} 🪙</p>
        <Link to="/" className="btn-primary">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const question = dueQuestions[index];
  const isLast = index === dueQuestions.length - 1;

  function handleCheck() {
    if (!draft) return;
    const result = grade(question, draft);
    setFeedback(result);
    recordItemAnswer(question.id, result.correct);
  }

  function handleNext() {
    if (isLast) {
      touchDailyActivity();
      addCoins(REVIEW_COIN_BONUS);
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setDraft(null);
    setFeedback(null);
    setResetTick((n) => n + 1);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{t('review.title')}</h1>
        <p className="text-sm text-granite dark:text-birch/60">{t('review.subtitle')}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-sm font-medium text-granite dark:text-birch/60">
          {index + 1}/{dueQuestions.length}
        </span>
        <ProgressBar value={index} max={dueQuestions.length} />
      </div>

      <div className="card">
        <QuestionRenderer
          key={`${question.id}-${resetTick}`}
          question={question}
          disabled={Boolean(feedback)}
          onChange={setDraft}
          resetKey={resetTick}
        />
        {feedback && (
          <div
            className={
              'mt-4 rounded-xl border p-3 text-sm ' +
              (feedback.correct
                ? 'border-pine/30 bg-pine/10 text-pine dark:text-aurora'
                : 'border-lingon/30 bg-lingon/10 text-lingon')
            }
          >
            {feedback.correct ? (feedback.almost ? t('quiz.almost') : t('quiz.correct')) : t('quiz.incorrect')}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {!feedback ? (
          <button className="btn-primary" disabled={!draft} onClick={handleCheck}>
            {t('quiz.check')}
          </button>
        ) : (
          <button className="btn-primary" onClick={handleNext}>
            {isLast ? t('quiz.finish') : t('quiz.next')}
          </button>
        )}
      </div>
    </div>
  );
}

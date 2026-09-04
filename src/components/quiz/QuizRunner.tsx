import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, LogOut } from 'lucide-react';
import type { LessonContent } from '@/content/loader';
import { createSession, recordResult, computeRewards, type RewardResult } from '@/quiz/engine';
import { grade, type Answer, type GradeResult } from '@/quiz/grading';
import { resolveLocalized, type Question, type StudyLanguage } from '@/content/schema';
import { useLanguage } from '@/store/settings';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useLessonProgress, usePreviousRunQuestionIds, useSelectionContext } from '@/store/progress';
import { usePerks } from '@/store/city';
import { useStreak } from '@/store/wallet';
import ProgressBar from '@/components/ui/ProgressBar';
import QuestionRenderer from './QuestionRenderer';

type Phase = 'answering' | 'feedback';

export default function QuizRunner({
  lesson,
  onFinish,
}: {
  lesson: LessonContent;
  onFinish: (reward: RewardResult) => void;
}) {
  const t = useT();
  const lang = useLanguage();
  const progress = useLessonProgress(lesson.meta.id);
  const previousRunIds = usePreviousRunQuestionIds(lesson.meta.id);
  const selectionCtx = useSelectionContext(previousRunIds);
  const perks = usePerks();
  const streak = useStreak();
  const recordAttempt = useAppStore((s) => s.recordAttempt);
  const recordItemAnswer = useAppStore((s) => s.recordItemAnswer);

  // Session is created once per mount — recreating on every render would reshuffle mid-quiz.
  const [session] = useState(() =>
    createSession(lesson, (progress?.attempts ?? 0) + 1, selectionCtx),
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [draft, setDraft] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<GradeResult | null>(null);
  // The one free retry is per RUN, not per question (SPEC §6.2) — retryUsed never resets
  // between questions, only isRetryAttempt (this question is being re-answered) does.
  const [retryUsed, setRetryUsed] = useState(false);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const [awaitingRetryDecision, setAwaitingRetryDecision] = useState(false);
  const [resetTick, setResetTick] = useState(0);

  const question = session.questions[index];
  const isLast = index === session.questions.length - 1;

  const finalizeAndAdvance = useCallback(() => {
    if (isLast) {
      const reward = computeRewards(session, {
        baseXp: lesson.meta.xp.base,
        passScore: lesson.meta.quiz.passScore,
        totalQuestions: session.questions.length,
        alreadyPassedBefore: progress?.passed ?? false,
        streakDays: streak.current,
        perkXpMultiplier: perks.xpMultiplier,
        perkCoinMultiplier: perks.coinMultiplier,
      });
      const finalReward = recordAttempt(
        lesson.meta.id,
        reward,
        session.questions.map((q) => q.id),
      );
      onFinish(finalReward);
      return;
    }
    setIndex((i) => i + 1);
    setPhase('answering');
    setDraft(null);
    setFeedback(null);
    setIsRetryAttempt(false);
    setAwaitingRetryDecision(false);
    setResetTick((n) => n + 1);
  }, [isLast, session, lesson, progress, streak, perks, recordAttempt, onFinish]);

  const handleCheck = useCallback(() => {
    if (!draft) return;
    const result = grade(question, draft);
    setFeedback(result);
    setPhase('feedback');

    const offerRetry = !result.correct && !retryUsed && !isRetryAttempt;
    if (offerRetry) {
      setRetryUsed(true);
      setAwaitingRetryDecision(true);
    } else {
      setAwaitingRetryDecision(false);
      recordResult(session, question.id, result, isRetryAttempt);
      recordItemAnswer(question.id, result.correct);
    }
  }, [draft, question, retryUsed, isRetryAttempt, session, recordItemAnswer]);

  const handleRetry = useCallback(() => {
    setIsRetryAttempt(true);
    setAwaitingRetryDecision(false);
    setPhase('answering');
    setDraft(null);
    setFeedback(null);
    setResetTick((n) => n + 1);
  }, []);

  // Keyboard: Enter checks the current answer, or advances/retries once feedback is shown.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'answering' && draft) handleCheck();
        else if (phase === 'feedback') {
          if (awaitingRetryDecision) handleRetry();
          else finalizeAndAdvance();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, draft, awaitingRetryDecision, handleCheck, handleRetry, finalizeAndAdvance]);

  const wasJustOfferedRetry = phase === 'feedback' && awaitingRetryDecision;

  const promptPreview = useMemo(() => resolveLocalized(question.prompt, lang), [question, lang]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="whitespace-nowrap text-sm font-medium text-granite dark:text-birch/60">
          {t('quiz.question')} {index + 1}/{session.questions.length}
        </span>
        <ProgressBar value={index + (phase === 'feedback' ? 1 : 0)} max={session.questions.length} />
      </div>

      <div className="card" aria-live="polite">
        <QuestionRenderer
          key={`${question.id}-${resetTick}`}
          question={question}
          disabled={phase === 'feedback'}
          onChange={setDraft}
          resetKey={resetTick}
        />

        {phase === 'feedback' && feedback && (
          <div
            className={
              'mt-4 rounded-xl border p-3 text-sm ' +
              (feedback.correct
                ? 'border-pine/30 bg-pine/10 text-pine dark:text-aurora'
                : 'border-lingon/30 bg-lingon/10 text-lingon')
            }
          >
            <p className="font-semibold">
              {feedback.correct
                ? feedback.almost
                  ? t('quiz.almost')
                  : t('quiz.correct')
                : t('quiz.incorrect')}
            </p>
            {!feedback.correct && !wasJustOfferedRetry && (
              <p className="mt-1 text-granite dark:text-birch/70">
                {t('quiz.correctAnswerWas')}: {answerPreview(question, lang)}
              </p>
            )}
            {question.explanation && (
              <p className="mt-1 text-granite dark:text-birch/70">
                {resolveLocalized(question.explanation, lang)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="sr-only">{promptPreview}</span>
        <div />
        {phase === 'answering' ? (
          <button className="btn-primary" disabled={!draft} onClick={handleCheck}>
            <Check size={16} aria-hidden="true" />
            {t('quiz.check')}
          </button>
        ) : wasJustOfferedRetry ? (
          <button className="btn-primary" onClick={handleRetry}>
            {t('quiz.retry')}
          </button>
        ) : (
          <button className="btn-primary" onClick={finalizeAndAdvance}>
            {isLast ? t('quiz.finish') : t('quiz.next')}
            <LogOut size={16} className="rotate-180" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

function answerPreview(question: Question, lang: StudyLanguage): string {
  switch (question.type) {
    case 'mc':
    case 'listen': {
      const c = question.choices[question.answer];
      return typeof c === 'string' ? c : resolveLocalized(c, lang);
    }
    case 'type-answer':
    case 'gap':
      return question.answer[0];
    case 'true-false':
      return question.answer ? 'True' : 'False';
    case 'order':
      return question.answer.map((i) => question.tokens[i]).join(' ');
    case 'match':
      return question.pairs.map(([a, b]) => `${a} = ${b}`).join(', ');
  }
}

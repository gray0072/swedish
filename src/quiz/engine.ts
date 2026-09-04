import type { Question } from '@/content/schema';
import type { LessonContent } from '@/content/loader';
import { hashSeed, mulberry32, shuffle } from './prng';
import { selectQuestions, type SelectionContext } from './selection';
import type { GradeResult } from './grading';

export interface SessionQuestionResult {
  questionId: string;
  correct: boolean;
  almost?: boolean;
  retried?: boolean;
}

export interface QuizSession {
  lessonId: string;
  seed: string;
  attemptNumber: number;
  questions: Question[];
  results: SessionQuestionResult[];
}

/** For mc/listen, shuffle the choice order and remap the answer index for this session only. */
function prepareQuestion(question: Question, rng: () => number): Question {
  if (question.type === 'mc' || question.type === 'listen') {
    const order = shuffle(
      question.choices.map((_, i) => i),
      rng,
    );
    return {
      ...question,
      choices: order.map((i) => question.choices[i]),
      answer: order.indexOf(question.answer),
    } as Question;
  }
  return question;
}

export function createSession(
  lesson: LessonContent,
  attemptNumber: number,
  selectionCtx: SelectionContext,
): QuizSession {
  const seed = `${lesson.meta.id}:${attemptNumber}:${Date.now()}`;
  const rng = mulberry32(hashSeed(seed));
  const picked = selectQuestions(
    lesson.pool,
    lesson.meta.quiz.questionsPerRun,
    seed,
    selectionCtx,
  );
  const questions = picked.map((q) => prepareQuestion(q, rng));
  return { lessonId: lesson.meta.id, seed, attemptNumber, questions, results: [] };
}

export type { Answer, GradeResult } from './grading';

/**
 * Pushes the FINAL outcome for one question into the session (exactly once per question —
 * a wrong first try that gets retried is never pushed, only the retry's outcome is).
 */
export function recordResult(
  session: QuizSession,
  questionId: string,
  result: GradeResult,
  retried: boolean,
): void {
  session.results.push({
    questionId,
    correct: result.correct,
    almost: result.almost,
    retried,
  });
}

export interface RewardInputs {
  baseXp: number;
  passScore: number;
  totalQuestions: number;
  alreadyPassedBefore: boolean;
  streakDays: number;
  perkXpMultiplier: number;
  perkCoinMultiplier: number;
}

export interface RewardResult {
  score: number;
  total: number;
  passed: boolean;
  xp: number;
  coins: number;
  perfect: boolean;
}

/** Scoring & reward formulas per SPEC.md §6.3. */
export function computeRewards(session: QuizSession, inputs: RewardInputs): RewardResult {
  const total = inputs.totalQuestions;
  let score = 0;
  for (const r of session.results) {
    if (!r.correct) continue;
    score += r.almost || r.retried ? 0.5 : 1;
  }
  const passed = score >= inputs.passScore;
  const perfect = score === total;

  const firstPassMultiplier = inputs.alreadyPassedBefore ? 0.3 : 1.0;
  const perfectBonus = perfect ? 1.25 : 1.0;
  const streakMultiplier = 1 + Math.min(inputs.streakDays, 10) * 0.02;

  const rawXp = passed
    ? inputs.baseXp *
      (score / total) *
      firstPassMultiplier *
      perfectBonus *
      inputs.perkXpMultiplier *
      streakMultiplier
    : 0;
  const xp = Math.round(rawXp);
  const coins = Math.round(xp * 0.5 * inputs.perkCoinMultiplier);

  return { score, total, passed, xp, coins, perfect };
}

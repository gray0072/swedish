import type { Question } from '@/content/schema';
import type { LessonContent } from '@/content/loader';
import { hashSeed, mulberry32, shuffle, weightedSample } from './prng';
import { selectQuestions, weightFor, type SelectionContext } from './selection';
import type { GradeResult } from './grading';
import { REWARDS } from '@/city/economy';

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

/**
 * For mc/listen, shuffle the choice order and remap the answer index for this session only.
 * Exported so any question-answering surface (quiz sessions, the review deck) can reuse it —
 * generated questions always author the correct choice first, so skipping this makes the
 * correct answer trivially "always option 1".
 */
export function prepareQuestion(question: Question, rng: () => number): Question {
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

/**
 * "Can't listen now": every listening question from `fromIndex` on is swapped for an unused
 * non-listening question from the pool, so the run keeps its length. When the pool runs out
 * of those, the remaining listening questions are dropped and the run gets shorter.
 * Mutates the session in place.
 */
export function skipListening(
  session: QuizSession,
  fromIndex: number,
  pool: Question[],
  selectionCtx: SelectionContext,
): void {
  const head = session.questions.slice(0, fromIndex);
  const tail = session.questions.slice(fromIndex);
  const listenCount = tail.filter((q) => q.type === 'listen').length;
  if (listenCount === 0) return;

  const used = new Set(session.questions.map((q) => q.id));
  const rng = mulberry32(hashSeed(`${session.seed}:no-listen:${fromIndex}`));
  const spare = pool.filter((q) => q.type !== 'listen' && !used.has(q.id));
  const replacements = weightedSample(spare, (q) => weightFor(q, selectionCtx), listenCount, rng)
    .map((q) => prepareQuestion(q, rng));

  const next: Question[] = [];
  for (const q of tail) {
    if (q.type !== 'listen') next.push(q);
    else {
      const replacement = replacements.shift();
      if (replacement) next.push(replacement);
    }
  }
  session.questions = [...head, ...next];
}

/** The pass threshold for a run shortened by skipped listening, kept in proportion. */
export function scaledPassScore(passScore: number, runLength: number, plannedLength: number): number {
  if (runLength >= plannedLength) return passScore;
  return Math.max(1, Math.ceil((passScore * runLength) / plannedLength));
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

  const firstPassMultiplier = inputs.alreadyPassedBefore ? REWARDS.repeatXpMultiplier : 1.0;
  const perfectBonus = perfect ? REWARDS.perfectBonus : 1.0;
  const streakMultiplier =
    1 + Math.min(inputs.streakDays, REWARDS.streakBonusCapDays) * REWARDS.streakBonusPerDay;

  const rawXp = passed
    ? inputs.baseXp *
      (score / total) *
      firstPassMultiplier *
      perfectBonus *
      inputs.perkXpMultiplier *
      streakMultiplier
    : 0;
  const xp = Math.round(rawXp);
  const coins = Math.round(xp * REWARDS.coinsPerXp * inputs.perkCoinMultiplier);

  return { score, total, passed, xp, coins, perfect };
}

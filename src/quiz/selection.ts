import type { Question } from '@/content/schema';
import { hashSeed, mulberry32, weightedSample } from './prng';

export interface ItemStat {
  seen: number;
  correct: number;
  lastCorrect: boolean | null;
}

export interface SelectionContext {
  /** Question ids shown in the immediately previous attempt of this same lesson. */
  previousRunIds: string[];
  /** Global per-question stats, keyed by question id. */
  itemStats: Record<string, ItemStat>;
}

const DIFFICULTY_MULTIPLIER: Record<number, number> = { 1: 0.9, 2: 1.0, 3: 1.15 };

export function weightFor(question: Question, ctx: SelectionContext): number {
  const stat = ctx.itemStats[question.id];
  let base: number;
  if (!stat || stat.seen === 0) base = 3.0;
  else if (stat.lastCorrect === false) base = 2.5;
  else if (stat.correct >= 3) base = 0.4;
  else base = 1.0;
  return base * (DIFFICULTY_MULTIPLIER[question.difficulty] ?? 1.0);
}

/**
 * Picks `count` questions from `pool` using weighted sampling without replacement.
 * Excludes items from the previous run unless that would leave too few to choose from
 * (see SPEC.md §6.1).
 */
export function selectQuestions(
  pool: Question[],
  count: number,
  seed: string,
  ctx: SelectionContext,
): Question[] {
  const rng = mulberry32(hashSeed(seed));
  const withoutPrevious = pool.filter((q) => !ctx.previousRunIds.includes(q.id));
  const eligible = withoutPrevious.length >= count ? withoutPrevious : pool;
  return weightedSample(eligible, (q) => weightFor(q, ctx), Math.min(count, eligible.length), rng);
}

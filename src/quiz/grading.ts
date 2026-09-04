import type { Question } from '@/content/schema';

export type Answer =
  | { kind: 'mc'; choiceIndex: number }
  | { kind: 'listen'; choiceIndex: number }
  | { kind: 'type-answer'; text: string }
  | { kind: 'gap'; text: string }
  | { kind: 'order'; order: number[] }
  | { kind: 'match'; pairs: Array<[number, number]> }
  | { kind: 'true-false'; value: boolean };

export interface GradeResult {
  correct: boolean;
  /** True when accepted via near-miss spelling (Levenshtein <= 1) — reduced credit. */
  almost?: boolean;
}

/** trim, case-fold, drop punctuation. å ä ö are preserved — they are not punctuation. */
function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"()\-]/g, '')
    .replace(/\s+/g, ' ');
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function matchesAny(input: string, candidates: string[]): GradeResult {
  const normInput = normalize(input);
  if (candidates.some((c) => normalize(c) === normInput)) return { correct: true };
  const nearMiss = candidates.some((c) => levenshtein(normalize(c), normInput) <= 1);
  if (nearMiss) return { correct: true, almost: true };
  return { correct: false };
}

export function grade(question: Question, answer: Answer): GradeResult {
  switch (question.type) {
    case 'mc':
      if (answer.kind !== 'mc') return { correct: false };
      return { correct: answer.choiceIndex === question.answer };

    case 'listen':
      if (answer.kind !== 'listen') return { correct: false };
      return { correct: answer.choiceIndex === question.answer };

    case 'type-answer':
      if (answer.kind !== 'type-answer') return { correct: false };
      return matchesAny(answer.text, question.answer);

    case 'gap':
      if (answer.kind !== 'gap') return { correct: false };
      return matchesAny(answer.text, [...question.answer, ...question.acceptAlso]);

    case 'order':
      if (answer.kind !== 'order') return { correct: false };
      return {
        correct:
          answer.order.length === question.answer.length &&
          answer.order.every((v, i) => v === question.answer[i]),
      };

    case 'match':
      if (answer.kind !== 'match') return { correct: false };
      return {
        correct:
          answer.pairs.length === question.pairs.length &&
          answer.pairs.every(([left, right]) => left === right),
      };

    case 'true-false':
      if (answer.kind !== 'true-false') return { correct: false };
      return { correct: answer.value === question.answer };
  }
}

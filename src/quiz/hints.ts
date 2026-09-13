import type { Question } from '@/content/schema';

/**
 * What spending one hint token does to the question in front of the learner (SPEC §8.4).
 * A hint never answers the question — it narrows it, which keeps the reward honest while
 * still being worth the building that granted it.
 */
export interface Hint {
  /** Choice indices to cross out — mc and listen only. */
  eliminated: number[];
  /** A sentence to show under the question, already resolved to the study language. */
  messageKey: HintMessageKey | null;
  messageValue: string;
}

export type HintMessageKey =
  | 'quiz.hint.startsWith'
  | 'quiz.hint.firstToken'
  | 'quiz.hint.onePair'
  | 'quiz.hint.eliminated';

/**
 * True/false is the one type with no honest hint: crossing out one of two options *is* the
 * answer, so the button is hidden rather than wasting a token on nothing.
 */
export function hasHint(question: Question): boolean {
  return question.type !== 'true-false';
}

export function buildHint(question: Question): Hint | null {
  switch (question.type) {
    case 'mc':
    case 'listen': {
      const wrong = question.choices.map((_, i) => i).filter((i) => i !== question.answer);
      // Remove half the wrong options (at least one), never the last remaining distractor:
      // a hint that leaves a single choice would just hand over the answer.
      const toRemove = Math.max(1, Math.floor(wrong.length / 2));
      return {
        eliminated: wrong.slice(0, Math.min(toRemove, wrong.length - 1)),
        messageKey: 'quiz.hint.eliminated',
        messageValue: '',
      };
    }
    case 'type-answer':
    case 'gap': {
      const answer = question.answer[0] ?? '';
      const reveal = answer.slice(0, Math.max(1, Math.ceil(answer.length / 3)));
      return { eliminated: [], messageKey: 'quiz.hint.startsWith', messageValue: reveal };
    }
    case 'order': {
      const first = question.tokens[question.answer[0]] ?? '';
      return { eliminated: [], messageKey: 'quiz.hint.firstToken', messageValue: first };
    }
    case 'match': {
      const [sv, native] = question.pairs[0];
      return {
        eliminated: [],
        messageKey: 'quiz.hint.onePair',
        messageValue: `${sv} = ${native}`,
      };
    }
    case 'true-false':
      return null;
  }
}

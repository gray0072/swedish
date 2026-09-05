import type { HistoryCard, HistoryVocabWord, Question } from './schema';

/**
 * Turns a history card's vocabulary into real quiz questions (mirrors the vocab->quiz
 * generators in generators.ts, but distractors are drawn from every card's words, since a
 * single card only has ~5). This is what lets "reading history for fun" quietly become
 * something the SRS deck re-tests later (SPEC.md §12.4).
 */
export function generateHistoryQuestions(card: HistoryCard, allCards: HistoryCard[]): Question[] {
  const globalPool = allCards.flatMap((c) => c.vocab);
  return card.vocab.map((word) => {
    const distractors = pickDistractors(globalPool, word, 3);
    return {
      id: historyQuestionId(card.id, word.sv),
      type: 'mc' as const,
      difficulty: 2,
      tags: ['history', card.id],
      generated: true,
      prompt: { ru: `Как переводится «${word.sv}»?`, en: `What does "${word.sv}" mean?` },
      choices: [
        { ru: word.ru, en: word.en },
        ...distractors.map((d) => ({ ru: d.ru, en: d.en })),
      ],
      answer: 0,
    };
  });
}

export function historyQuestionId(cardId: string, sv: string): string {
  return `hist-${cardId}-${sv.replace(/\s+/g, '-')}`;
}

function pickDistractors(
  pool: HistoryVocabWord[],
  current: HistoryVocabWord,
  count: number,
): HistoryVocabWord[] {
  const others = pool.filter((w) => w.sv !== current.sv && w.ru !== current.ru);
  return [...others]
    .sort((a, b) => Math.abs(a.sv.length - current.sv.length) - Math.abs(b.sv.length - current.sv.length))
    .slice(0, count);
}

import type { Dialogue, DialogueLine, Question } from './schema';

/**
 * Turns a dialogue's keyPhrases into real quiz questions (mirrors historyQuestions.ts): each
 * phrase is asked against the line it occurs in, with distractors drawn from every dialogue's
 * lines. This is what lets "reading a dialogue for fun" quietly become SRS review material
 * (DIALOGUES.md §3).
 */
export function generateDialogueQuestions(dialogue: Dialogue, allDialogues: Dialogue[]): Question[] {
  const globalLines = allDialogues.flatMap((d) => d.lines);
  const questions: Question[] = [];
  for (const phrase of dialogue.keyPhrases) {
    const line = dialogue.lines.find((l) => l.sv.includes(phrase));
    // Missing verbatim occurrence is a content error caught by validate-content.ts — skip
    // rather than crash the app on a save that predates a since-fixed content file.
    if (!line) continue;
    const distractors = pickDistractorLines(globalLines, line, 3);
    questions.push({
      id: dialogueQuestionId(dialogue.id, phrase),
      type: 'mc',
      difficulty: 2,
      tags: ['dialogue', dialogue.id],
      generated: true,
      prompt: { ru: `Что означает «${phrase}»?`, en: `What does "${phrase}" mean?` },
      choices: [
        { ru: line.ru, en: line.en },
        ...distractors.map((d) => ({ ru: d.ru, en: d.en })),
      ],
      answer: 0,
    });
  }
  return questions;
}

export function dialogueQuestionId(dialogueId: string, phrase: string): string {
  const slug = phrase
    .toLowerCase()
    .replace(/[^a-z0-9åäöéèü\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-');
  return `dial-${dialogueId}-${slug}`;
}

function pickDistractorLines(pool: DialogueLine[], current: DialogueLine, count: number): DialogueLine[] {
  const others = pool.filter((l) => l.sv !== current.sv && l.en !== current.en);
  return [...others]
    .sort((a, b) => Math.abs(a.sv.length - current.sv.length) - Math.abs(b.sv.length - current.sv.length))
    .slice(0, count);
}

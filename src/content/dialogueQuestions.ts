import type { Dialogue, Question } from './schema';

/**
 * Turns a dialogue's keyPhrases into real quiz questions (mirrors historyQuestions.ts): each
 * phrase is blanked out of the line it occurs in, the line's translation is shown as the clue,
 * and the learner picks the missing Swedish from the phrase and keyPhrases of other dialogues.
 * This is what lets "reading a dialogue for fun" quietly become SRS review material
 * (DIALOGUES.md §3).
 *
 * A gap, not "what does X mean?": keyPhrases carry no translation of their own, so a meaning
 * question could only offer whole-line translations — and with those drawn from unrelated
 * scenes, the answer gave itself away on one word and the phrase was never practised.
 */
export function generateDialogueQuestions(dialogue: Dialogue, allDialogues: Dialogue[]): Question[] {
  const questions: Question[] = [];
  for (const phrase of dialogue.keyPhrases) {
    const line = dialogue.lines.find((l) => l.sv.includes(phrase));
    // Missing verbatim occurrence is a content error caught by validate-content.ts — skip
    // rather than crash the app on a save that predates a since-fixed content file.
    if (!line) continue;
    const gapped = line.sv.replace(phrase, '___');
    const distractors = pickDistractorPhrases(allDialogues, dialogue.id, phrase, line.sv, 3);
    questions.push({
      id: dialogueQuestionId(dialogue.id, phrase),
      type: 'mc',
      difficulty: 2,
      tags: ['dialogue', dialogue.id],
      generated: true,
      prompt: {
        ru: `Вставь пропущенное: «${gapped}» — ${line.ru}`,
        en: `Fill in the gap: "${gapped}" — ${line.en}`,
      },
      choices: [phrase, ...distractors],
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

/**
 * Other dialogues' keyPhrases, closest in length first so no option stands out by size. The
 * phrase's own dialogue is left out — its other phrases might fit the gap just as well — and
 * so is anything already in the line, which would read as correct.
 */
function pickDistractorPhrases(
  dialogues: Dialogue[],
  ownId: string,
  phrase: string,
  line: string,
  count: number,
): string[] {
  const key = (s: string) => s.trim().toLowerCase();
  const seen = new Set([key(phrase)]);
  const pool: string[] = [];
  for (const d of dialogues) {
    if (d.id === ownId) continue;
    for (const p of d.keyPhrases) {
      if (seen.has(key(p)) || line.includes(p)) continue;
      seen.add(key(p));
      pool.push(p);
    }
  }
  return pool
    .sort((a, b) => Math.abs(a.length - phrase.length) - Math.abs(b.length - phrase.length))
    .slice(0, count)
    .map((p) => matchInitialCase(p, phrase));
}

/**
 * A gap mid-sentence takes a lower-case phrase and one at the start a capital, so an option
 * cased the other way would give itself away. An acronym ("QA …") is left as it is.
 */
function matchInitialCase(option: string, answer: string): string {
  if (option.length > 1 && option[1] !== option[1].toLowerCase()) return option;
  const upper = answer[0] !== answer[0].toLowerCase();
  return (upper ? option[0].toUpperCase() : option[0].toLowerCase()) + option.slice(1);
}

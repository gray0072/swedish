/**
 * Brackets in Swedish content fields (`sv` of vocab, examples, theory) mean two different
 * things, and the difference is whether the text is Swedish speech (SPEC §5.3):
 *
 * - `[…]` — a note or a placeholder: shown, never spoken. In a typed answer it stands for
 *   "anything or nothing": `Kan jag få prata med [namn]?` accepts any name, `anden [accent 1]`
 *   accepts plain "anden".
 * - `(…)` — real Swedish that is optional or explanatory: shown AND spoken, and a typed
 *   answer is right with or without it. `tacka nej (till)`, `Boken (som) jag läste var bra.`
 *
 * A slash between two words without spaces is a choice: `bäste herr/fru` accepts
 * "bäste herr" and "bäste fru".
 */
export function withoutNotes(text: string): string {
  return text
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s+([?!.,])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Where a `[…]` stood in an accepted spelling; grading matches it against a few free words. */
export const PLACEHOLDER = '[]';

const MAX_SPELLINGS = 16;

/** Every spelling a learner may type for a Swedish answer (see the rules above). */
export function acceptedSpellings(text: string): string[] {
  const base = text.replace(/\[[^\]]*\]/g, PLACEHOLDER).replace(/\s{2,}/g, ' ').trim();
  const optional = [base];
  const withoutOptional = base.replace(/\s*\([^)]*\)/g, '').trim();
  if (withoutOptional && withoutOptional !== base) optional.push(withoutOptional);

  let spellings: string[] = [];
  for (const spelling of optional) {
    let expanded = [''];
    for (const word of spelling.split(' ')) {
      const choices = /^[^/\s]+(\/[^/\s]+)+$/.test(word) ? word.split('/') : [word];
      expanded = expanded.flatMap((head) => choices.map((c) => (head ? `${head} ${c}` : c)));
      if (expanded.length > MAX_SPELLINGS) {
        expanded = [spelling];
        break;
      }
    }
    spellings.push(...expanded);
  }
  spellings = [...new Set(spellings)];
  return spellings;
}

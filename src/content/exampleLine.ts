/**
 * One line of a ```example block in theory markdown is `Swedish — translation` (SPEC §5.3),
 * split at the FIRST spaced em dash. That only works because of one typography rule:
 *
 * - the Swedish side never contains an em dash. A dash inside Swedish is the tankstreck "–"
 *   (en dash), as Swedish typesetting uses it anyway — dialogue replies ("– Tack! – Varsågod!"),
 *   asides, and form series ("skriva – skrev – skrivit"); a word-internal hyphen stays "-";
 * - the translation may contain anything, em dashes included;
 * - one example is one source line — never hard-wrapped, or the tail becomes its own row.
 *
 * `scripts/validate-content.ts` enforces the parts of this a machine can check.
 */
export const EXAMPLE_SEPARATOR = ' — ';

export function splitExampleLine(line: string): { sv: string; translation: string } {
  const at = line.indexOf(EXAMPLE_SEPARATOR);
  if (at < 0) return { sv: line.trim(), translation: '' };
  return { sv: line.slice(0, at).trim(), translation: line.slice(at + EXAMPLE_SEPARATOR.length).trim() };
}

const CYRILLIC_START = /^\(?[А-Яа-яЁё]/;
const ENDS_SENTENCE = /[.!?…:)"»]$/;

/**
 * The rules above that a machine can check, run over every ```example block of one theory
 * file. Returns human-readable problems with 1-based line numbers; empty means clean.
 */
export function exampleBlockProblems(markdown: string): string[] {
  const problems: string[] = [];
  let inBlock = false;
  let prevHadTranslation = false;
  let prevLine = '';
  markdown.split('\n').forEach((raw, index) => {
    const line = raw.trim();
    const where = `line ${index + 1}`;
    if (line.startsWith('```')) {
      inBlock = !inBlock && line === '```example';
      prevHadTranslation = false;
      return;
    }
    if (!inBlock || !line) return;
    const { sv, translation } = splitExampleLine(line);
    if (line.startsWith('—')) {
      problems.push(`${where}: starts with an em dash — a Swedish dialogue dash is "–"`);
    } else if (CYRILLIC_START.test(sv)) {
      problems.push(`${where}: no Swedish before " — " — a wrapped translation? "${line}"`);
    } else if (!translation && prevHadTranslation && (!ENDS_SENTENCE.test(prevLine) || /^\p{Ll}/u.test(line))) {
      problems.push(`${where}: no translation right after a line with one — hard-wrapped? "${line}"`);
    }
    prevHadTranslation = Boolean(translation);
    prevLine = line;
  });
  return problems;
}

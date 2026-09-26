import { getContentRegistry, type DialogueEntry, type LessonContent } from './loader';
import { generateHistoryQuestions, historyQuestionId } from './historyQuestions';
import { dialogueQuestionId, generateDialogueQuestions } from './dialogueQuestions';
import type { LocalizedString, Question, VocabItem } from './schema';

export function getTracks() {
  return getContentRegistry().tracks;
}

export function getTrack(trackId: string) {
  return getContentRegistry().tracks.find((t) => t.id === trackId);
}

export function getLevel(trackId: string, levelId: string) {
  return getTrack(trackId)?.levels.find((l) => l.id === levelId);
}

export function getLesson(lessonId: string): LessonContent | undefined {
  return getContentRegistry().lessons.get(lessonId);
}

/** All lessons that belong to a given level id, across whichever track it's viewed from. */
export function getLessonsForLevel(levelId: string): LessonContent[] {
  return [...getContentRegistry().lessons.values()]
    .filter((l) => l.meta.levels.includes(levelId))
    .sort((a, b) => a.meta.order - b.meta.order);
}

export function getAllLessons(): LessonContent[] {
  return [...getContentRegistry().lessons.values()].sort((a, b) => a.meta.order - b.meta.order);
}

/** Every lesson sharing a folder slug, across whichever levels repeat that grammar point. */
export function getLessonsBySlug(slug: string): LessonContent[] {
  return getAllLessons().filter((l) => l.meta.slug === slug);
}

export function getCurriculum(id: string): LessonContent[] {
  const ids = getContentRegistry().curricula.get(id) ?? [];
  return ids.map((id) => getLesson(id)).filter((l): l is LessonContent => Boolean(l));
}

/**
 * Every lesson, in the order the single ladder actually teaches it (SPEC §5, the "single
 * ladder" — SFI kurs A through D, then SVA grund delkurs 1 through 4). `getAllLessons()`
 * sorts by `meta.order` alone, which only holds within one level (each level restarts at
 * 10, 20, 30…), so it interleaves levels; this walks tracks and levels first.
 */
export function getLessonsInCurriculumOrder(): LessonContent[] {
  const result: LessonContent[] = [];
  for (const track of getTracks()) {
    for (const level of [...track.levels].sort((a, b) => a.order - b.order)) {
      result.push(...getLessonsForLevel(level.id));
    }
  }
  return result;
}

// -- Word bank (REFERENCE.md §5) -------------------------------------------
// A generated view over every vocab.json in the app — never authored, so it always stays in
// sync with the lesson content it mirrors.

export type WordBankSectionKey = 'verbs' | 'nouns' | 'adjectives' | 'other';

export interface WordBankRow {
  vocab: VocabItem;
  lessonId: string;
  lessonTitle: LocalizedString;
}

export interface WordBankBand {
  from: number;
  to: number;
  rows: WordBankRow[];
}

export interface WordBankSection {
  key: WordBankSectionKey;
  bands: WordBankBand[];
}

/** Bands of this size keep any one group small enough to scan (REFERENCE.md §5.4). */
const WORD_BANK_BAND_SIZE = 50;

function sectionKeyFor(pos: VocabItem['pos']): WordBankSectionKey {
  if (pos === 'verb') return 'verbs';
  if (pos === 'noun') return 'nouns';
  if (pos === 'adj') return 'adjectives';
  return 'other';
}

function band(rows: WordBankRow[]): WordBankBand[] {
  const bands: WordBankBand[] = [];
  for (let i = 0; i < rows.length; i += WORD_BANK_BAND_SIZE) {
    bands.push({ from: i + 1, to: Math.min(i + WORD_BANK_BAND_SIZE, rows.length), rows: rows.slice(i, i + WORD_BANK_BAND_SIZE) });
  }
  return bands;
}

let wordBankCache: WordBankSection[] | null = null;

/**
 * Deduplicated by (part of speech, lowercased Swedish word) — a word taught in several
 * lessons keeps one row, pointing at the first (i.e. most basic) lesson that teaches it.
 * Rows stay in curriculum order within each part-of-speech bucket, which is this app's
 * only available proxy for "how common a word is" (there is no real frequency corpus here) —
 * a word introduced in SFI kurs A is assumed more basic/frequent than one introduced in SVA
 * grund delkurs 4. Banding into groups of ~50 turns that ordering into the "most common
 * first, in digestible chunks" list REFERENCE.md §5.4 asks for.
 */
export function getWordBank(): WordBankSection[] {
  if (wordBankCache) return wordBankCache;

  const seen = new Set<string>();
  const buckets: Record<WordBankSectionKey, WordBankRow[]> = {
    verbs: [],
    nouns: [],
    adjectives: [],
    other: [],
  };

  for (const lesson of getLessonsInCurriculumOrder()) {
    for (const item of lesson.vocab) {
      const key = `${item.pos}:${item.sv.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      buckets[sectionKeyFor(item.pos)].push({
        vocab: item,
        lessonId: lesson.meta.id,
        lessonTitle: lesson.meta.title,
      });
    }
  }

  wordBankCache = (['verbs', 'nouns', 'adjectives', 'other'] as const).map((key) => ({
    key,
    bands: band(buckets[key]),
  }));
  return wordBankCache;
}

export function getEras() {
  return getContentRegistry().eras;
}

export function getBuildings() {
  return getContentRegistry().buildings;
}

export function getBuildingsForEra(eraId: string) {
  return getContentRegistry().buildings.filter((b) => b.era === eraId);
}

export function getBuilding(id: string) {
  return getContentRegistry().buildings.find((b) => b.id === id);
}

export function getHistoryCards() {
  return getContentRegistry().history;
}

export function getHistoryCardsForEra(eraId: string) {
  return getContentRegistry().history.filter((h) => h.era === eraId);
}

/** Finds a question by id across every lesson's pool — used to resolve the SRS review deck. */
export function findQuestionById(id: string) {
  for (const lesson of getContentRegistry().lessons.values()) {
    const question = lesson.pool.find((q) => q.id === id);
    if (question) return question;
  }
  return undefined;
}

let historyQuestionCache: Map<string, Question> | null = null;

function getHistoryQuestionIndex(): Map<string, Question> {
  if (!historyQuestionCache) {
    const cards = getContentRegistry().history;
    historyQuestionCache = new Map();
    for (const card of cards) {
      for (const q of generateHistoryQuestions(card, cards)) {
        historyQuestionCache.set(q.id, q);
      }
    }
  }
  return historyQuestionCache;
}

/** The question ids a history card's vocabulary seeds into the SRS deck once it's read. */
export function getHistoryQuestionIdsForCard(cardId: string): string[] {
  const card = getContentRegistry().history.find((c) => c.id === cardId);
  if (!card) return [];
  return card.vocab.map((w) => historyQuestionId(cardId, w.sv));
}

let dialogueQuestionCache: Map<string, Question> | null = null;

function getDialogueQuestionIndex(): Map<string, Question> {
  if (!dialogueQuestionCache) {
    const dialogues = getContentRegistry().dialogues;
    dialogueQuestionCache = new Map();
    for (const dialogue of dialogues) {
      for (const q of generateDialogueQuestions(dialogue, dialogues)) {
        dialogueQuestionCache.set(q.id, q);
      }
    }
  }
  return dialogueQuestionCache;
}

/** The question ids a dialogue's keyPhrases seed into the SRS deck once it's read. */
export function getDialogueQuestionIdsFor(dialogueId: string): string[] {
  const dialogue = getContentRegistry().dialogues.find((d) => d.id === dialogueId);
  if (!dialogue) return [];
  return dialogue.keyPhrases.map((phrase) => dialogueQuestionId(dialogueId, phrase));
}

/** Looks a question up across lesson pools, history- and dialogue-derived questions. */
export function findAnyQuestionById(id: string): Question | undefined {
  return findQuestionById(id) ?? getHistoryQuestionIndex().get(id) ?? getDialogueQuestionIndex().get(id);
}

let allQuestionIdsCache: Set<string> | null = null;

/** Every question id the app knows — lesson pools plus history- and dialogue-derived ones. */
export function getAllQuestionIds(): Set<string> {
  if (!allQuestionIdsCache) {
    allQuestionIdsCache = new Set([...getHistoryQuestionIndex().keys(), ...getDialogueQuestionIndex().keys()]);
    for (const lesson of getContentRegistry().lessons.values()) {
      for (const q of lesson.pool) allQuestionIdsCache.add(q.id);
    }
  }
  return allQuestionIdsCache;
}

export function getDialogues(): DialogueEntry[] {
  return getContentRegistry().dialogues;
}

export function getDialogue(id: string): DialogueEntry | undefined {
  return getContentRegistry().dialogues.find((d) => d.id === id);
}

/** Groups dialogues by section, in index order (DIALOGUES.md §5/§6) — mirrors the reference tab. */
export function getDialoguesGrouped() {
  const groups = new Map<string, DialogueEntry[]>();
  for (const dialogue of getDialogues()) {
    const arr = groups.get(dialogue.group) ?? [];
    arr.push(dialogue);
    groups.set(dialogue.group, arr);
  }
  return [...groups.entries()].map(([group, dialogues]) => ({ group, dialogues }));
}

export function getAchievements() {
  return getContentRegistry().achievements;
}

export function getReferenceArticles() {
  return getContentRegistry().reference;
}

export function getReferenceArticle(slug: string) {
  return getContentRegistry().reference.find((a) => a.slug === slug);
}

/** Groups the reference articles in index order, for the summaries tab (REFERENCE.md §6.3). */
export function getReferenceArticlesGrouped() {
  const groups = new Map<string, ReturnType<typeof getReferenceArticles>>();
  for (const article of getReferenceArticles()) {
    const arr = groups.get(article.group) ?? [];
    arr.push(article);
    groups.set(article.group, arr);
  }
  return [...groups.entries()].map(([group, articles]) => ({ group, articles }));
}

export function getContentErrors() {
  return getContentRegistry().errors;
}

/** Groups lessons into a display series when they share meta.part.series. */
export interface LessonListEntry {
  key: string;
  series: string | null;
  lessons: LessonContent[];
}

export function groupLessonsForList(lessons: LessonContent[]): LessonListEntry[] {
  const bySeries = new Map<string, LessonContent[]>();
  const standalone: LessonListEntry[] = [];
  for (const lesson of lessons) {
    const part = lesson.meta.part;
    if (!part) {
      standalone.push({ key: lesson.meta.id, series: null, lessons: [lesson] });
      continue;
    }
    const arr = bySeries.get(part.series) ?? [];
    arr.push(lesson);
    bySeries.set(part.series, arr);
  }
  const grouped: LessonListEntry[] = [...bySeries.entries()].map(([series, group]) => ({
    key: `series:${series}`,
    series,
    lessons: group.sort((a, b) => (a.meta.part?.index ?? 0) - (b.meta.part?.index ?? 0)),
  }));
  return [...standalone, ...grouped].sort(
    (a, b) => a.lessons[0].meta.order - b.lessons[0].meta.order,
  );
}

import { getContentRegistry, type LessonContent } from './loader';
import { generateHistoryQuestions, historyQuestionId } from './historyQuestions';
import type { Question } from './schema';

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

export function getCurriculum(id: string): LessonContent[] {
  const ids = getContentRegistry().curricula.get(id) ?? [];
  return ids.map((id) => getLesson(id)).filter((l): l is LessonContent => Boolean(l));
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

/** Looks a question up across BOTH lesson pools and history-derived questions. */
export function findAnyQuestionById(id: string): Question | undefined {
  return findQuestionById(id) ?? getHistoryQuestionIndex().get(id);
}

export function getAchievements() {
  return getContentRegistry().achievements;
}

export function getGrammarArticles() {
  return getContentRegistry().grammar;
}

export function getGrammarArticle(slug: string) {
  return getContentRegistry().grammar.find((a) => a.slug === slug);
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

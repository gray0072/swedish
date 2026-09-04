import { useAppStore } from './appStore';
import { isDue } from '@/srs/scheduler';
import type { ItemStat, SelectionContext } from '@/quiz/selection';

export function useLessonProgress(lessonId: string) {
  return useAppStore((s) => s.lessons[lessonId]);
}

export function useAllLessonProgress() {
  return useAppStore((s) => s.lessons);
}

// A stable reference for the "no previous run yet" case — returning a fresh `[]` from a
// zustand selector would make useSyncExternalStore see a new snapshot every render and loop.
const EMPTY_IDS: string[] = [];

export function usePreviousRunQuestionIds(lessonId: string): string[] {
  return useAppStore((s) => s.lessons[lessonId]?.lastRunQuestionIds ?? EMPTY_IDS);
}

/** Builds the weighting context the quiz engine needs, from stored per-item stats. */
export function useSelectionContext(previousRunIds: string[]): SelectionContext {
  const items = useAppStore((s) => s.items);
  const itemStats: Record<string, ItemStat> = {};
  for (const [id, item] of Object.entries(items)) {
    itemStats[id] = { seen: item.seen, correct: item.correct, lastCorrect: item.lastCorrect };
  }
  return { previousRunIds, itemStats };
}

export function useDueReviewCount(): number {
  const items = useAppStore((s) => s.items);
  return Object.values(items).filter((i) => isDue(i.dueAt)).length;
}

export function useWordsLearned(): number {
  const items = useAppStore((s) => s.items);
  return Object.values(items).filter((i) => i.box >= 2).length;
}

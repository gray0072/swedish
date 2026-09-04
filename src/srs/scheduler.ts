/** Leitner-box spaced repetition. Boxes 0-5 map to increasing review intervals. */
export const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 16, 35] as const;
export type Box = 0 | 1 | 2 | 3 | 4 | 5;

export function nextBox(current: Box, correct: boolean): Box {
  if (!correct) return 0;
  return Math.min(current + 1, 5) as Box;
}

export function computeDueDate(box: Box, from: Date = new Date()): string {
  const days = BOX_INTERVALS_DAYS[box] ?? 35;
  const due = new Date(from);
  due.setDate(due.getDate() + days);
  return due.toISOString();
}

export function isDue(dueAtIso: string, now: Date = new Date()): boolean {
  return new Date(dueAtIso).getTime() <= now.getTime();
}

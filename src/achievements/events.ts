import type { AchievementCounter, AchievementState, SaveFile } from '@/store/persist';
import { localDateStr } from '@/store/persist';

/**
 * Event counters for achievements (SPEC §8.6) — pure updates of `save.achievements`, called
 * from the store actions at the moment the event happens. Only facts nothing else in the
 * save records belong here; anything derivable is computed in `metrics.ts` instead.
 *
 * Times are the learner's local clock: "a lesson at midnight" means their midnight.
 */

/** Swedish holidays the `holidays` achievement counts, by id. */
export function swedishHoliday(d: Date): string | null {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 1 && day === 1) return 'nyarsdagen';
  if (m === 3 && day === 25) return 'vaffeldagen';
  if (m === 4 && day === 30) return 'valborg';
  if (m === 6 && day === 6) return 'nationaldagen';
  // Midsommarafton is the Friday between 19 and 25 June.
  if (m === 6 && day >= 19 && day <= 25 && d.getDay() === 5) return 'midsommarafton';
  if (m === 10 && day === 4) return 'kanelbullens-dag';
  if (m === 12 && day === 13) return 'lucia';
  if (m === 12 && day === 24) return 'julafton';
  return null;
}

function bump(a: AchievementState, key: AchievementCounter, by = 1): AchievementState {
  return { ...a, counters: { ...a.counters, [key]: (a.counters[key] ?? 0) + by } };
}

function raise(a: AchievementState, key: AchievementCounter, value: number): AchievementState {
  if ((a.counters[key] ?? 0) >= value) return a;
  return { ...a, counters: { ...a.counters, [key]: value } };
}

export function countEvent(a: AchievementState, key: AchievementCounter): AchievementState {
  return bump(a, key);
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86_400_000);
}

/**
 * A new active day, called with the streak as it was before `applyStreak` moved it on.
 * `today` is the same UTC date string the streak uses, so the two can never disagree.
 */
export function onNewDay(a: AchievementState, before: SaveFile['streak'], today: string): AchievementState {
  if (before.lastActiveDate === today) return a;
  let next = bump(a, 'daysActive');
  if (before.lastActiveDate) {
    const gap = daysBetween(before.lastActiveDate, today);
    if (gap >= 7) next = bump(next, 'comebacks');
    // Mirrors applyStreak: a missed day with a freeze in stock spends the freeze.
    if (gap > 1 && before.freezesAvailable > 0) next = bump(next, 'freezesUsed');
  }
  return next;
}

/** A finished lesson run that passed, or a finished review session. */
export function onStudySession(a: AchievementState, now: Date): AchievementState {
  let next = a;
  const h = now.getHours();
  if (h < 5) next = bump(next, 'nightSessions');
  else if (h < 8) next = bump(next, 'morningSessions');
  else if (h === 15) next = bump(next, 'fikaSessions');
  const weekday = now.getDay();
  if (weekday === 0 || weekday === 6) next = bump(next, 'weekendSessions');
  const holiday = swedishHoliday(now);
  if (holiday && !next.holidays.includes(holiday)) next = { ...next, holidays: [...next.holidays, holiday] };
  return next;
}

export interface PassedRun {
  /** The lesson had been attempted before and never passed. */
  failedBefore: boolean;
  /** The score landed exactly on the pass mark. */
  lagom: boolean;
}

export function onLessonPassed(a: AchievementState, now: Date, run: PassedRun): AchievementState {
  const date = localDateStr(now);
  const lessons = a.day.date === date ? a.day.lessons + 1 : 1;
  let next: AchievementState = { ...a, day: { date, lessons } };
  next = raise(next, 'bestDay', lessons);
  if (run.failedBefore) next = bump(next, 'stubbornPasses');
  if (run.lagom) next = bump(next, 'lagomPasses');
  return onStudySession(next, now);
}

export function onReviewSession(a: AchievementState, now: Date): AchievementState {
  return onStudySession(bump(a, 'reviewSessions'), now);
}

export function onAnswer(a: AchievementState, correct: boolean): AchievementState {
  const combo = correct ? a.combo + 1 : 0;
  return raise({ ...a, combo }, 'bestCombo', combo);
}

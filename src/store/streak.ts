import { STREAK } from '@/city/economy';
import type { SaveFile } from './persist';

type Streak = SaveFile['streak'];

export function dateAddDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Moves the streak to `today`. `extraFreezes` is the city's `streakFreeze` perk total: it raises
 * the number of freezes that can be *stored*, while the weekly grant stays at one. Scaling the
 * grant instead would hand a fully-built city five freezes a week and make the streak
 * unloseable — the perk is meant to be a deeper safety net, not an off switch.
 */
export function applyStreak(streak: Streak, today: string, extraFreezes: number): Streak {
  if (streak.lastActiveDate === today) return streak;

  const yesterday = dateAddDays(today, -1);
  const maxFreezes = STREAK.maxFreezes + extraFreezes;
  let current: number;
  let freezesAvailable = streak.freezesAvailable;

  if (streak.lastActiveDate === null) {
    current = 1;
  } else if (streak.lastActiveDate === yesterday) {
    current = streak.current + 1;
  } else if (freezesAvailable > 0) {
    // Missed a day, but a streak freeze absorbs it instead of resetting to zero.
    current = streak.current + 1;
    freezesAvailable -= 1;
  } else {
    current = 1;
  }

  if (current > 0 && current % STREAK.freezeEveryDays === 0) {
    freezesAvailable = Math.min(freezesAvailable + 1, maxFreezes);
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: today,
    freezesAvailable,
  };
}

/**
 * Merges the streaks of two devices. Taking the record with the later `lastActiveDate` alone is
 * wrong: the app moves the local streak to today as soon as it opens, before the cloud save has
 * arrived, so a device that sat idle for a few days shows up with "today, 1 day, no freezes" and
 * would overwrite the real streak from the other device. Instead the older record is played
 * forward to the newer date (exactly as if this device had opened the app on it) and the longer
 * of the two streaks wins, together with its freezes.
 */
export function mergeStreaks(local: Streak, remote: Streak, extraFreezes: number): Streak {
  const longest = Math.max(local.longest, remote.longest);
  if (local.lastActiveDate === null && remote.lastActiveDate === null) {
    return { ...local, longest };
  }
  if (local.lastActiveDate === null) return { ...remote, longest };
  if (remote.lastActiveDate === null) return { ...local, longest };

  const date = local.lastActiveDate >= remote.lastActiveDate ? local.lastActiveDate : remote.lastActiveDate;
  const a = applyStreak(local, date, extraFreezes);
  const b = applyStreak(remote, date, extraFreezes);
  const winner =
    a.current !== b.current
      ? a.current > b.current ? a : b
      : a.freezesAvailable >= b.freezesAvailable ? a : b;
  return { ...winner, longest: Math.max(longest, winner.longest) };
}

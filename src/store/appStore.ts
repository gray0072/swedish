import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import {
  freshSave,
  migrateSave,
  SAVE_KEY,
  SAVE_VERSION,
  todayStr,
  type AchievementCounter,
  type BuildingState,
  type ItemProgress,
  type LessonProgress,
  type SaveFile,
} from './persist';
import { computeDueDate, nextBox, type Box } from '@/srs/scheduler';
import type { RewardResult } from '@/quiz/engine';
import type { StudyLanguage } from '@/content/schema';
import { achievementTierCoins, REWARDS, STREAK } from '@/city/economy';
import { getActivePerks } from '@/city/perks';
import { mergeSaves } from './cloudSync';
import { pruneUnknownIds } from './pruneSave';
import { getLesson } from '@/content/registry';
import { countEvent, onAnswer, onLessonPassed, onNewDay, onReviewSession } from '@/achievements/events';

function dateAddDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * `extraFreezes` is the city's `streakFreeze` perk total: it raises the number of freezes
 * that can be *stored*, while the weekly grant stays at one. Scaling the grant instead would
 * hand a fully-built city five freezes a week and make the streak unloseable — the perk is
 * meant to be a deeper safety net, not an off switch.
 */
function applyStreak(
  streak: SaveFile['streak'],
  today: string,
  extraFreezes: number,
): SaveFile['streak'] {
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

/** The day's first activity moves the streak and the achievement day counters together. */
function startDay(s: SaveFile, today: string): Pick<SaveFile, 'streak' | 'achievements'> {
  return {
    streak: applyStreak(s.streak, today, perksOf(s).streakFreeze),
    achievements: onNewDay(s.achievements, s.streak, today),
  };
}

/** Perk totals straight off a save's buildings — the non-hook path into the same selector. */
function perksOf(state: SaveFile) {
  const levels: Record<string, number> = {};
  for (const [id, b] of Object.entries(state.city.buildings)) levels[id] = b.level;
  return getActivePerks(levels);
}

interface AppState extends SaveFile {
  setLanguage: (lang: StudyLanguage) => void;
  touchDailyActivity: () => void;
  /** Pays the city's dailyIncome perk if it hasn't been paid today. Returns coins paid. */
  claimDailyIncome: () => number;
  recordItemAnswer: (questionId: string, correct: boolean) => void;
  isRewardEligible: (lessonId: string) => boolean;
  recordAttempt: (lessonId: string, reward: RewardResult, questionIds: string[]) => RewardResult;
  buyBuilding: (buildingId: string, cost: number, maxLevel: number) => boolean;
  markHistoryRead: (id: string, coinReward: number) => void;
  markDialogueRead: (id: string, coinReward: number) => void;
  addCoins: (amount: number) => void;
  /** Counts a finished due-review session towards achievements. */
  recordReviewSession: () => void;
  countAchievementEvent: (key: AchievementCounter) => void;
  /** Stores newly reached achievement tiers and pays their coins. Returns coins paid. */
  claimAchievementTiers: (claims: { id: string; tier: number }[]) => number;
  seedReviewItems: (ids: string[]) => void;
  setTheme: (theme: SaveFile['settings']['theme']) => void;
  setSound: (enabled: boolean) => void;
  setTtsVoice: (voiceURI: string | null) => void;
  setCityMotion: (tier: NonNullable<SaveFile['settings']['cityMotion']>) => void;
  resetSave: () => void;
  importSave: (raw: unknown) => boolean;
  /** Merges a cloud save into the current local state (see cloudSync.ts) and returns the result. */
  mergeWithCloud: (remote: unknown) => SaveFile | null;
}

/** Strips the store's actions off, leaving just the persisted save shape. */
export function toSaveFile(state: AppState): SaveFile {
  const {
    version,
    createdAt,
    language,
    wallet,
    streak,
    lessons,
    items,
    city,
    historyRead,
    dialoguesRead,
    dailyIncomeClaimedOn,
    achievements,
    settings,
  } = state;
  return {
    version,
    createdAt,
    language,
    wallet,
    streak,
    lessons,
    items,
    city,
    historyRead,
    dialoguesRead,
    dailyIncomeClaimedOn,
    achievements,
    settings,
  };
}

// zustand's `persist` JSON-serializes state on every write and parses on load; we route both
// through migrateSave() so a save from an older app version upgrades instead of getting dropped,
// then pruneUnknownIds() so ids the current content no longer has are dropped.
const storage: PersistStorage<AppState> = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsedOuter = JSON.parse(raw) as { state: unknown; version: number };
      const migrated = pruneUnknownIds(migrateSave(parsedOuter.state));
      return { state: migrated, version: SAVE_VERSION } as StorageValue<AppState>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Storage full or unavailable (private browsing) — in-memory state still works this session.
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...freshSave(),

      setLanguage: (lang) => set({ language: lang }),

      touchDailyActivity: () => {
        set((s) => startDay(s, todayStr()));
      },

      // Called once when the app shell mounts. Idempotent within a day, so re-opening the
      // app or refreshing the page can't be farmed for a second payout.
      claimDailyIncome: () => {
        const s = get();
        const today = todayStr();
        if (s.dailyIncomeClaimedOn === today) return 0;
        const amount = Math.round(perksOf(s).dailyIncome);
        if (amount <= 0) {
          // Still stamp the date: with no income buildings there is nothing to pay, and
          // leaving it null would re-run this check on every navigation.
          set({ dailyIncomeClaimedOn: today });
          return 0;
        }
        set({
          dailyIncomeClaimedOn: today,
          wallet: { ...s.wallet, coins: s.wallet.coins + amount },
        });
        return amount;
      },

      recordItemAnswer: (questionId, correct) => {
        set((s) => {
          const prev: ItemProgress = s.items[questionId] ?? {
            box: 0,
            dueAt: new Date().toISOString(),
            seen: 0,
            correct: 0,
            wrong: 0,
            lastCorrect: null,
            lastSeenAt: new Date().toISOString(),
          };
          const box: Box = nextBox(prev.box, correct);
          const updated: ItemProgress = {
            box,
            dueAt: computeDueDate(box),
            seen: prev.seen + 1,
            correct: prev.correct + (correct ? 1 : 0),
            wrong: prev.wrong + (correct ? 0 : 1),
            lastCorrect: correct,
            lastSeenAt: new Date().toISOString(),
          };
          return {
            items: { ...s.items, [questionId]: updated },
            achievements: onAnswer(s.achievements, correct),
          };
        });
      },

      isRewardEligible: (lessonId) => {
        const lp = get().lessons[lessonId];
        if (!lp) return true;
        const today = todayStr();
        const runsToday = lp.rewardedRunsDate === today ? lp.rewardedRunsToday : 0;
        return runsToday < REWARDS.dailyRewardedRunsPerLesson;
      },

      recordAttempt: (lessonId, reward, questionIds) => {
        const today = todayStr();
        const eligible = get().isRewardEligible(lessonId);
        const finalReward: RewardResult = eligible ? reward : { ...reward, xp: 0, coins: 0 };

        set((s) => {
          const prev: LessonProgress = s.lessons[lessonId] ?? {
            attempts: 0,
            bestScore: 0,
            passed: false,
            lastAttemptAt: new Date().toISOString(),
            rewardedRunsToday: 0,
            rewardedRunsDate: today,
            lastRunQuestionIds: [],
          };
          const runsToday = prev.rewardedRunsDate === today ? prev.rewardedRunsToday : 0;
          const day = startDay(s, today);
          const passScore = getLesson(lessonId)?.meta.quiz.passScore;
          const achievements = reward.passed
            ? onLessonPassed(day.achievements, new Date(), {
                failedBefore: prev.attempts > 0 && !prev.passed,
                lagom: reward.score === passScore && reward.score < reward.total,
              })
            : day.achievements;
          const lessons: Record<string, LessonProgress> = {
            ...s.lessons,
            [lessonId]: {
              attempts: prev.attempts + 1,
              bestScore: Math.max(prev.bestScore, reward.score),
              passed: prev.passed || reward.passed,
              lastAttemptAt: new Date().toISOString(),
              rewardedRunsToday:
                eligible && reward.passed ? runsToday + 1 : runsToday,
              rewardedRunsDate: today,
              lastRunQuestionIds: questionIds,
            },
          };
          return {
            lessons,
            wallet: {
              xp: s.wallet.xp + finalReward.xp,
              coins: s.wallet.coins + finalReward.coins,
            },
            streak: day.streak,
            achievements,
          };
        });

        return finalReward;
      },

      buyBuilding: (buildingId, cost, maxLevel) => {
        const s = get();
        const current: BuildingState = s.city.buildings[buildingId] ?? {
          level: 0,
          builtAt: '',
        };
        if (current.level >= maxLevel) return false;
        if (s.wallet.coins < cost) return false;
        set({
          wallet: { ...s.wallet, coins: s.wallet.coins - cost },
          city: {
            buildings: {
              ...s.city.buildings,
              [buildingId]: { level: current.level + 1, builtAt: new Date().toISOString() },
            },
          },
        });
        return true;
      },

      markHistoryRead: (id, coinReward) => {
        const s = get();
        if (s.historyRead.includes(id)) return;
        set({
          historyRead: [...s.historyRead, id],
          wallet: { ...s.wallet, coins: s.wallet.coins + coinReward },
        });
      },

      markDialogueRead: (id, coinReward) => {
        const s = get();
        if (s.dialoguesRead.includes(id)) return;
        set({
          dialoguesRead: [...s.dialoguesRead, id],
          wallet: { ...s.wallet, coins: s.wallet.coins + coinReward },
        });
      },

      addCoins: (amount) => set((s) => ({ wallet: { ...s.wallet, coins: s.wallet.coins + amount } })),

      recordReviewSession: () =>
        set((s) => ({ achievements: onReviewSession(s.achievements, new Date()) })),

      countAchievementEvent: (key) => set((s) => ({ achievements: countEvent(s.achievements, key) })),

      claimAchievementTiers: (claims) => {
        const s = get();
        const unlocked = { ...s.achievements.unlocked };
        const at = new Date().toISOString();
        let coins = 0;
        let changed = false;
        for (const { id, tier } of claims) {
          const had = unlocked[id]?.tier ?? 0;
          if (tier <= had) continue;
          changed = true;
          // Every tier skipped over pays too: a save that jumps from none to tier 3 at once
          // (an old save meeting this feature, a merge from another device) gets all three.
          for (let t = had + 1; t <= tier; t++) coins += achievementTierCoins(t);
          unlocked[id] = { tier, at };
        }
        if (!changed) return 0;
        set({
          achievements: { ...s.achievements, unlocked },
          wallet: { ...s.wallet, coins: s.wallet.coins + coins },
        });
        return coins;
      },

      // Seeds brand-new SRS items as "due now" — never touches an id already being tracked,
      // so re-reading a history card doesn't reset progress on words you've already reviewed.
      seedReviewItems: (ids) => {
        set((s) => {
          const now = new Date().toISOString();
          const items = { ...s.items };
          let changed = false;
          for (const id of ids) {
            if (items[id]) continue;
            items[id] = {
              box: 0,
              dueAt: now,
              seen: 0,
              correct: 0,
              wrong: 0,
              lastCorrect: null,
              lastSeenAt: now,
            };
            changed = true;
          }
          return changed ? { items } : {};
        });
      },

      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      setSound: (sound) => set((s) => ({ settings: { ...s.settings, sound } })),
      setTtsVoice: (ttsVoice) => set((s) => ({ settings: { ...s.settings, ttsVoice } })),
      setCityMotion: (cityMotion) => set((s) => ({ settings: { ...s.settings, cityMotion } })),

      resetSave: () => set(freshSave()),

      importSave: (raw) => {
        try {
          const migrated = pruneUnknownIds(migrateSave(raw));
          set(migrated);
          return true;
        } catch {
          return false;
        }
      },

      mergeWithCloud: (remote) => {
        try {
          const merged = mergeSaves(toSaveFile(get()), pruneUnknownIds(migrateSave(remote)));
          set(merged);
          return merged;
        } catch {
          return null;
        }
      },
    }),
    { name: SAVE_KEY, version: SAVE_VERSION, storage },
  ),
);

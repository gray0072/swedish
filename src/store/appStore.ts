import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import {
  freshSave,
  migrateSave,
  SAVE_KEY,
  SAVE_VERSION,
  todayStr,
  type BuildingState,
  type ItemProgress,
  type LessonProgress,
  type SaveFile,
} from './persist';
import { computeDueDate, nextBox, type Box } from '@/srs/scheduler';
import type { RewardResult } from '@/quiz/engine';
import type { StudyLanguage } from '@/content/schema';

const DAILY_REWARD_CAP = 2;

function dateAddDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function applyStreak(streak: SaveFile['streak'], today: string): SaveFile['streak'] {
  if (streak.lastActiveDate === today) return streak;

  const yesterday = dateAddDays(today, -1);
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

  if (current > 0 && current % 7 === 0 && freezesAvailable < 2) {
    freezesAvailable += 1;
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: today,
    freezesAvailable,
  };
}

interface AppState extends SaveFile {
  setLanguage: (lang: StudyLanguage) => void;
  touchDailyActivity: () => void;
  recordItemAnswer: (questionId: string, correct: boolean) => void;
  isRewardEligible: (lessonId: string) => boolean;
  recordAttempt: (lessonId: string, reward: RewardResult, questionIds: string[]) => RewardResult;
  buyBuilding: (buildingId: string, cost: number, maxLevel: number) => boolean;
  markHistoryRead: (id: string, coinReward: number) => void;
  addCoins: (amount: number) => void;
  setTheme: (theme: SaveFile['settings']['theme']) => void;
  setSound: (enabled: boolean) => void;
  resetSave: () => void;
  importSave: (raw: unknown) => boolean;
}

// zustand's `persist` JSON-serializes state on every write and parses on load; we route both
// through migrateSave() so a save from an older app version upgrades instead of getting dropped.
const storage: PersistStorage<AppState> = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsedOuter = JSON.parse(raw) as { state: unknown; version: number };
      const migrated = migrateSave(parsedOuter.state);
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
        set((s) => ({ streak: applyStreak(s.streak, todayStr()) }));
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
          return { items: { ...s.items, [questionId]: updated } };
        });
      },

      isRewardEligible: (lessonId) => {
        const lp = get().lessons[lessonId];
        if (!lp) return true;
        const today = todayStr();
        const runsToday = lp.rewardedRunsDate === today ? lp.rewardedRunsToday : 0;
        return runsToday < DAILY_REWARD_CAP;
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
            streak: applyStreak(s.streak, today),
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

      addCoins: (amount) => set((s) => ({ wallet: { ...s.wallet, coins: s.wallet.coins + amount } })),

      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      setSound: (sound) => set((s) => ({ settings: { ...s.settings, sound } })),

      resetSave: () => set(freshSave()),

      importSave: (raw) => {
        try {
          const migrated = migrateSave(raw);
          set(migrated);
          return true;
        } catch {
          return false;
        }
      },
    }),
    { name: SAVE_KEY, version: SAVE_VERSION, storage },
  ),
);

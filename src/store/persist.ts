import { z } from 'zod';
import type { Box } from '@/srs/scheduler';

// ---------------------------------------------------------------------------
// Save file shape — SPEC.md §7. Everything lives under one versioned key so
// export/import is a single JSON file (the backup story for a backend-free app).
// ---------------------------------------------------------------------------

export const SAVE_KEY = 'swedish-app';
export const SAVE_VERSION = 1 as const;

export interface ItemProgress {
  box: Box;
  dueAt: string;
  seen: number;
  correct: number;
  wrong: number;
  lastCorrect: boolean | null;
  lastSeenAt: string;
}

export interface LessonProgress {
  attempts: number;
  bestScore: number;
  passed: boolean;
  lastAttemptAt: string;
  rewardedRunsToday: number;
  rewardedRunsDate: string; // yyyy-mm-dd, resets the counter above when it changes
  /** Question ids shown in the most recent attempt — excluded from the next run's pool. */
  lastRunQuestionIds: string[];
}

export interface BuildingState {
  level: number;
  builtAt: string;
}

/**
 * Event counters for achievements whose metric the rest of the save cannot answer — how many
 * days you studied, how many reviews you finished, what time of day you did it. Everything
 * else an achievement measures is derived live from the save (store/achievements.ts), so it
 * can never drift from the numbers that earned it. Counters only ever grow.
 */
export type AchievementCounter =
  | 'daysActive'
  | 'reviewSessions'
  | 'bestCombo'
  | 'bestDay'
  | 'comebacks'
  | 'freezesUsed'
  | 'stubbornPasses'
  | 'lagomPasses'
  | 'nightSessions'
  | 'morningSessions'
  | 'fikaSessions'
  | 'weekendSessions'
  | 'audioPlays';

export interface AchievementState {
  /** Highest tier (1-based) ever reached per achievement id. Never lowered: a streak that
   * breaks or coins that get spent do not take a medal back, and each tier pays out once. */
  unlocked: Record<string, { tier: number; at: string }>;
  counters: Partial<Record<AchievementCounter, number>>;
  /** Ids of the Swedish holidays (achievements.ts) a lesson or review was finished on. */
  holidays: string[];
  /** Consecutive correct answers right now, across lessons and reviews. */
  combo: number;
  /** Lessons passed on `date` (local yyyy-mm-dd) — feeds the bestDay counter. */
  day: { date: string; lessons: number };
}

export function freshAchievementState(): AchievementState {
  return { unlocked: {}, counters: {}, holidays: [], combo: 0, day: { date: '', lessons: 0 } };
}

export interface SaveFile {
  version: 1;
  createdAt: string;
  language: 'ru' | 'en';
  wallet: { xp: number; coins: number };
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null; // yyyy-mm-dd
    freezesAvailable: number;
  };
  lessons: Record<string, LessonProgress>;
  items: Record<string, ItemProgress>;
  city: { buildings: Record<string, BuildingState> };
  historyRead: string[];
  /** Dialogue ids read at least once — like historyRead, this is what seeds keyPhrases (see
   * dialogueQuestions.ts) into the SRS deck and gates the one-time coin reward. */
  dialoguesRead: string[];
  /**
   * yyyy-mm-dd of the last day the `dailyIncome` perk was paid out, or null if never.
   * Optional in the parsed schema on purpose: a save written before daily income existed
   * simply has no field, and is defaulted below rather than needing a version migration.
   */
  dailyIncomeClaimedOn: string | null;
  /** Optional in the parsed schema for the same reason as dailyIncomeClaimedOn. */
  achievements: AchievementState;
  settings: {
    theme: 'system' | 'light' | 'dark';
    sound: boolean;
    ttsRate: number;
    /** speechSynthesis voiceURI of the preferred sv-SE voice, or null = auto-pick. */
    ttsVoice: string | null;
    /** The city scene's ambient motion tier (CITY_VISUALS_MOTION.md §4). `prefers-reduced-motion`
     * always overrides this to `off` regardless of what is saved here. Optional in the type for
     * the same reason as `ttsVoice` below: fixtures and saves written before this setting
     * existed don't have it, and `migrateSave`/`freshSave` are what guarantee a real value at
     * runtime — callers should still read it as `settings.cityMotion ?? 'full'`. */
    cityMotion?: 'full' | 'calm' | 'off';
  };
}

export function freshSave(): SaveFile {
  return {
    version: SAVE_VERSION,
    createdAt: new Date().toISOString(),
    language: 'en',
    wallet: { xp: 0, coins: 0 },
    streak: { current: 0, longest: 0, lastActiveDate: null, freezesAvailable: 0 },
    lessons: {},
    items: {},
    city: { buildings: {} },
    historyRead: [],
    dialoguesRead: [],
    dailyIncomeClaimedOn: null,
    achievements: freshAchievementState(),
    settings: { theme: 'system', sound: true, ttsRate: 0.95, ttsVoice: null, cityMotion: 'full' },
  };
}

// A permissive schema — only what's needed to catch a corrupted/foreign save file.
// Unknown/extra fields are tolerated so older saves keep working across minor additions.
export const saveFileSchema = z
  .object({
    version: z.number(),
    createdAt: z.string(),
    language: z.enum(['ru', 'en']),
    wallet: z.object({ xp: z.number(), coins: z.number() }),
    streak: z.object({
      current: z.number(),
      longest: z.number(),
      lastActiveDate: z.string().nullable(),
      freezesAvailable: z.number(),
    }),
    lessons: z.record(z.string(), z.any()),
    items: z.record(z.string(), z.any()),
    city: z.object({ buildings: z.record(z.string(), z.any()) }),
    historyRead: z.array(z.string()),
    // Optional for the same reason as dailyIncomeClaimedOn below: a save from before dialogues
    // existed has no field, and "nothing read yet" is the right reading.
    dialoguesRead: z.array(z.string()).optional(),
    // Optional for the same reason as settings.ttsVoice below: saves from before the perk
    // was granted don't have it, and "never claimed" is the right reading.
    dailyIncomeClaimedOn: z.string().nullable().optional(),
    // Optional: a save from before tiered achievements has none — the watcher then grants
    // every tier the save already qualifies for on first load.
    achievements: z
      .object({
        unlocked: z.record(z.string(), z.object({ tier: z.number(), at: z.string() })),
        counters: z.record(z.string(), z.number()),
        holidays: z.array(z.string()),
        combo: z.number(),
        day: z.object({ date: z.string(), lessons: z.number() }),
      })
      .optional(),
    settings: z.object({
      theme: z.enum(['system', 'light', 'dark']),
      sound: z.boolean(),
      ttsRate: z.number(),
      // Optional: saves from before the voice picker was added won't have it yet — treated
      // as "auto-pick" (see migrateSave's post-parse defaulting below).
      ttsVoice: z.string().nullable().optional(),
      // Optional for the same reason: a save from before cityMotion existed defaults to 'full'
      // below, matching every other motion-affecting toggle's off-by-default-means-on stance.
      cityMotion: z.enum(['full', 'calm', 'off']).optional(),
    }),
  })
  .passthrough();

type Migration = (old: unknown) => unknown;

/** version -> function that migrates a save FROM that version TO version+1. */
export const migrations: Record<number, Migration> = {
  // 1 -> 2 would go here once the schema changes.
};

export function migrateSave(raw: unknown): SaveFile {
  let data = raw as { version?: number };
  let version = typeof data.version === 'number' ? data.version : 0;
  while (version < SAVE_VERSION && migrations[version]) {
    data = migrations[version](data) as { version?: number };
    version = data.version ?? version + 1;
  }
  const parsed = saveFileSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Corrupted save file: ${parsed.error.message}`);
  }
  const save = parsed.data as SaveFile;
  // A save from before the voice picker existed won't have settings.ttsVoice at all —
  // treat that the same as "auto-pick" rather than leaving it undefined.
  if (save.settings.ttsVoice === undefined) save.settings.ttsVoice = null;
  if (save.settings.cityMotion === undefined) save.settings.cityMotion = 'full';
  // Same for daily income: an older save has never been paid, so it gets paid today.
  if (save.dailyIncomeClaimedOn === undefined) save.dailyIncomeClaimedOn = null;
  if (save.dialoguesRead === undefined) save.dialoguesRead = [];
  if (save.achievements === undefined) save.achievements = freshAchievementState();
  return save;
}

export function loadSave(): SaveFile {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    return migrateSave(JSON.parse(raw));
  } catch {
    return freshSave();
  }
}

export function writeSave(save: SaveFile) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Storage full or unavailable (private mode) — fail silently, in-memory state still works.
  }
}

export function exportSaveToFile(save: SaveFile) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `swedish-progress-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function todayStr(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** yyyy-mm-dd in the learner's own time zone — for "what day was it for you", not streaks. */
export function localDateStr(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

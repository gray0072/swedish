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
  settings: { theme: 'system' | 'light' | 'dark'; sound: boolean; ttsRate: number };
}

export function freshSave(): SaveFile {
  return {
    version: SAVE_VERSION,
    createdAt: new Date().toISOString(),
    language: 'ru',
    wallet: { xp: 0, coins: 0 },
    streak: { current: 0, longest: 0, lastActiveDate: null, freezesAvailable: 0 },
    lessons: {},
    items: {},
    city: { buildings: {} },
    historyRead: [],
    settings: { theme: 'system', sound: true, ttsRate: 0.95 },
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
    settings: z.object({
      theme: z.enum(['system', 'light', 'dark']),
      sound: z.boolean(),
      ttsRate: z.number(),
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
  return parsed.data as SaveFile;
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

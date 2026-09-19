import { supabase } from './supabaseClient';
import { migrateSave, type SaveFile, type ItemProgress, type LessonProgress, type BuildingState } from './persist';

export function isCloudSyncAvailable(): boolean {
  return supabase !== null;
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href },
  });
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export interface CloudUser {
  id: string;
  email: string | null;
}

function toCloudUser(session: { user: { id: string; email?: string } } | null): CloudUser | null {
  return session ? { id: session.user.id, email: session.user.email ?? null } : null;
}

export function onAuthStateChange(cb: (user: CloudUser | null) => void): () => void {
  if (!supabase) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => cb(toCloudUser(session)));
  return () => subscription.unsubscribe();
}

export async function getCurrentUser(): Promise<CloudUser | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return toCloudUser(data.session);
}

/**
 * `null` means "this user genuinely has no cloud save yet" — the safe case where pushing the
 * local save up is correct because there is nothing to lose. A Supabase error (RLS denial,
 * network failure, a row whose `data` doesn't parse) is a DIFFERENT case and must never be
 * treated the same way: silently returning `null` there previously made a fetch failure look
 * identical to "no save exists yet", so the caller (useCloudSync.ts) would push the current
 * (possibly empty, freshly-installed) local state over whatever was actually in the cloud —
 * overwriting real progress while still reporting "synced". Throwing here instead makes that
 * whole sync attempt fail loudly (status: 'error') rather than quietly destroying data.
 */
export async function fetchCloudSave(userId: string): Promise<SaveFile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('saves').select('data').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null; // no error AND no row: this user has never synced before — genuinely empty.
  return migrateSave(data.data); // a corrupted row is also a real failure, not "no save".
}

export async function pushCloudSave(userId: string, save: SaveFile): Promise<void> {
  if (!supabase) return;
  // supabase-js resolves with { data, error } instead of throwing on a failed request (an RLS
  // denial, a network error, …), so awaiting it alone proves nothing. Without checking `error`
  // here, a failed upsert was indistinguishable from a successful one to every caller, which is
  // how this app could report "synced" while the cloud row never actually existed.
  const { error } = await supabase
    .from('saves')
    .upsert({ user_id: userId, data: save, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Merge — combines a local and a cloud save so progress made on either device
// survives, instead of one device's session clobbering the other's on sync.
// ---------------------------------------------------------------------------

/** A save that has never left freshSave()'s defaults — used to gate settings/language pull. */
function isLocalFresh(save: SaveFile): boolean {
  return (
    Object.keys(save.lessons).length === 0 &&
    Object.keys(save.items).length === 0 &&
    save.wallet.xp === 0 &&
    save.wallet.coins === 0
  );
}

function mergeLessons(
  a: Record<string, LessonProgress>,
  b: Record<string, LessonProgress>,
): Record<string, LessonProgress> {
  const out: Record<string, LessonProgress> = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id];
    const y = b[id];
    if (!x || !y) {
      out[id] = x ?? y;
      continue;
    }
    // Counters are monotonic and merged with max so re-running the merge (e.g. syncing
    // again before the other device has moved on) stays idempotent instead of double-counting.
    const newer = x.lastAttemptAt >= y.lastAttemptAt ? x : y;
    out[id] = {
      attempts: Math.max(x.attempts, y.attempts),
      bestScore: Math.max(x.bestScore, y.bestScore),
      passed: x.passed || y.passed,
      lastAttemptAt: newer.lastAttemptAt,
      rewardedRunsToday: newer.rewardedRunsToday,
      rewardedRunsDate: newer.rewardedRunsDate,
      lastRunQuestionIds: newer.lastRunQuestionIds,
    };
  }
  return out;
}

function mergeItems(
  a: Record<string, ItemProgress>,
  b: Record<string, ItemProgress>,
): Record<string, ItemProgress> {
  const out: Record<string, ItemProgress> = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id];
    const y = b[id];
    if (!x || !y) {
      out[id] = x ?? y;
      continue;
    }
    // SRS state (box/dueAt) is sequential, so it comes from whichever side reviewed the
    // item more recently; the seen/correct/wrong counters merge with max, same reasoning as lessons.
    const newer = x.lastSeenAt >= y.lastSeenAt ? x : y;
    out[id] = {
      box: newer.box,
      dueAt: newer.dueAt,
      lastCorrect: newer.lastCorrect,
      lastSeenAt: newer.lastSeenAt,
      seen: Math.max(x.seen, y.seen),
      correct: Math.max(x.correct, y.correct),
      wrong: Math.max(x.wrong, y.wrong),
    };
  }
  return out;
}

function mergeBuildings(
  a: Record<string, BuildingState>,
  b: Record<string, BuildingState>,
): Record<string, BuildingState> {
  const out: Record<string, BuildingState> = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id];
    const y = b[id];
    // A building is never downgraded on merge: whichever device bought it further up wins.
    out[id] = !x || !y ? (x ?? y) : x.level >= y.level ? x : y;
  }
  return out;
}

export function mergeSaves(local: SaveFile, remote: SaveFile): SaveFile {
  const preferRemoteSettings = isLocalFresh(local);
  const localDate = local.streak.lastActiveDate;
  const remoteDate = remote.streak.lastActiveDate;
  const streakBase = localDate && (!remoteDate || localDate >= remoteDate) ? local.streak : remote.streak;

  return {
    version: local.version,
    createdAt: local.createdAt < remote.createdAt ? local.createdAt : remote.createdAt,
    language: preferRemoteSettings ? remote.language : local.language,
    wallet: {
      // Earned currency only grows: max avoids losing coins/XP earned on the other device
      // between syncs (at the cost of not summing gains made independently on both at once —
      // an acceptable trade-off for a single-player save).
      xp: Math.max(local.wallet.xp, remote.wallet.xp),
      coins: Math.max(local.wallet.coins, remote.wallet.coins),
    },
    streak: {
      ...streakBase,
      longest: Math.max(local.streak.longest, remote.streak.longest),
    },
    lessons: mergeLessons(local.lessons, remote.lessons),
    items: mergeItems(local.items, remote.items),
    city: { buildings: mergeBuildings(local.city.buildings, remote.city.buildings) },
    historyRead: Array.from(new Set([...local.historyRead, ...remote.historyRead])),
    dialoguesRead: Array.from(new Set([...local.dialoguesRead, ...remote.dialoguesRead])),
    dailyIncomeClaimedOn:
      (local.dailyIncomeClaimedOn ?? '') >= (remote.dailyIncomeClaimedOn ?? '')
        ? local.dailyIncomeClaimedOn
        : remote.dailyIncomeClaimedOn,
    settings: preferRemoteSettings ? remote.settings : local.settings,
  };
}

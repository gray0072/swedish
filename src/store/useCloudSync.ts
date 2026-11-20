import { useEffect } from 'react';
import { useAppStore } from './appStore';
import { useCloudSyncStatusStore } from './cloudSyncStatus';
import {
  fetchCloudSave,
  isCloudSyncAvailable,
  onAuthStateChange,
  pushCloudSave,
  type CloudUser,
} from './cloudSync';

// Local edits accumulate for this long before a sync — long enough that a whole quiz run's
// worth of store updates collapses into one round trip.
const SYNC_DEBOUNCE_MS = 10_000;
// After a failed sync (offline, a server error) the next attempt comes this much later.
const RETRY_MS = 30_000;
// The day starts (AppShell) even if the first sync hangs this long.
const INITIAL_SYNC_TIMEOUT_MS = 8_000;

/**
 * Mounted once (in AppShell). While signed in, every sync is the same three steps: pull the
 * cloud save, merge it into the local state (mergeSaves), push the merge. Nothing is ever pushed
 * without the pull and merge before it, so a push can't overwrite progress another device made
 * since this one last looked — and a failed pull (offline, an RLS error) blocks the push instead
 * of letting an unmerged local copy replace the cloud one.
 *
 * A sync runs on sign-in (including "already signed in" on load), 10 s after local changes, as
 * soon as the app is hidden with changes still pending (a phone app is often closed right after
 * a quiz), when it comes back to the foreground (another device may have moved on meanwhile),
 * when the network comes back, and 30 s after a failure. UI reads the status via
 * useCloudSyncStatus() instead of calling this again.
 */
export function useCloudSync(): void {
  useEffect(() => {
    const { setStatus, setUser, markInitialSyncDone } = useCloudSyncStatusStore.getState();
    if (!isCloudSyncAvailable()) {
      markInitialSyncDone();
      return;
    }
    let disposed = false;
    let user: CloudUser | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let running: Promise<void> | null = null;
    let again = false;
    // True while a merge writes to the store, so that write doesn't schedule yet another sync.
    let applyingMerge = false;

    const initialTimeout = setTimeout(markInitialSyncDone, INITIAL_SYNC_TIMEOUT_MS);

    function schedule(delayMs: number) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void sync();
      }, delayMs);
    }

    async function syncOnce(): Promise<void> {
      const u = user;
      if (!u || disposed) return;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      setStatus('syncing');
      try {
        // Throws on a real failure; null only when this account has never synced.
        const remote = await fetchCloudSave(u.id);
        if (disposed || user?.id !== u.id) return;
        applyingMerge = true;
        let merged;
        try {
          merged = useAppStore.getState().mergeWithCloud(remote);
        } finally {
          applyingMerge = false;
        }
        if (!merged) throw new Error('The cloud save could not be merged');
        await pushCloudSave(u.id, merged);
        if (!disposed && user?.id === u.id) setStatus('synced');
      } catch {
        if (!disposed && user?.id === u.id) {
          setStatus('error');
          schedule(RETRY_MS);
        }
      }
    }

    /** Runs one sync at a time; a request made during a sync runs right after it. */
    function sync(): Promise<void> {
      if (running) {
        again = true;
        return running;
      }
      running = (async () => {
        try {
          do {
            again = false;
            await syncOnce();
          } while (again && !disposed);
        } finally {
          running = null;
        }
      })();
      return running;
    }

    // Supabase fires this once right away with the current session, then on every auth event
    // (sign-in, sign-out, the hourly token refresh) — only a change of account needs a sync.
    const unsubscribeAuth = onAuthStateChange((u) => {
      const changed = user?.id !== u?.id;
      user = u;
      setUser(u);
      if (!u) {
        if (timer) clearTimeout(timer);
        timer = null;
        setStatus('signedOut');
        markInitialSyncDone();
        return;
      }
      if (changed) void sync().finally(markInitialSyncDone);
    });

    const unsubscribeStore = useAppStore.subscribe(() => {
      if (!user || applyingMerge) return;
      schedule(SYNC_DEBOUNCE_MS);
    });

    function onVisibilityChange() {
      if (!user) return;
      if (document.visibilityState === 'visible') void sync();
      else if (timer) void sync(); // flush pending changes before the app may be killed
    }
    function onOnline() {
      if (user) void sync();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);

    return () => {
      disposed = true;
      clearTimeout(initialTimeout);
      if (timer) clearTimeout(timer);
      unsubscribeAuth();
      unsubscribeStore();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
    };
  }, []);
}

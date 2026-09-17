import { useEffect } from 'react';
import { toSaveFile, useAppStore } from './appStore';
import { useCloudSyncStatusStore } from './cloudSyncStatus';
import {
  fetchCloudSave,
  isCloudSyncAvailable,
  onAuthStateChange,
  pushCloudSave,
  type CloudUser,
} from './cloudSync';

// Local edits accumulate for this long before being pushed to the cloud — long enough that
// a whole quiz run's worth of store updates collapses into one upsert, short enough that
// switching devices soon after rarely finds a stale cloud save.
const PUSH_DEBOUNCE_MS = 10_000;

/**
 * Mounted once (in AppShell). Pulls the cloud save and merges it in on sign-in, then keeps
 * pushing local changes to the cloud (debounced) for as long as the session stays signed in.
 * UI reads the resulting status via useCloudSyncStatus() instead of calling this again.
 */
export function useCloudSync(): void {
  useEffect(() => {
    if (!isCloudSyncAvailable()) return;
    const { setStatus, setUser } = useCloudSyncStatusStore.getState();
    let cancelled = false;
    const userRef: { current: CloudUser | null } = { current: null };
    const pushTimer: { current: ReturnType<typeof setTimeout> | null } = { current: null };

    async function handleSignedIn(u: CloudUser) {
      setStatus('syncing');
      try {
        const remote = await fetchCloudSave(u.id);
        const merged = remote
          ? useAppStore.getState().mergeWithCloud(remote)
          : toSaveFile(useAppStore.getState());
        if (merged) await pushCloudSave(u.id, merged);
        if (!cancelled) setStatus('synced');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    // Supabase fires this once immediately with the current session, then again on every
    // sign-in/sign-out — so this alone covers both "already signed in on load" and later changes.
    const unsubscribeAuth = onAuthStateChange((u) => {
      userRef.current = u;
      setUser(u);
      if (u) void handleSignedIn(u);
      else setStatus('signedOut');
    });

    // Any further local change, while signed in, is pushed after a short debounce.
    const unsubscribeStore = useAppStore.subscribe((state) => {
      const currentUser = userRef.current;
      if (!currentUser) return;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        pushCloudSave(currentUser.id, toSaveFile(state)).then(
          () => !cancelled && setStatus('synced'),
          () => !cancelled && setStatus('error'),
        );
      }, PUSH_DEBOUNCE_MS);
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      unsubscribeStore();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, []);
}

import { create } from 'zustand';
import { isCloudSyncAvailable, signInWithGoogle, signOut, type CloudUser } from './cloudSync';

export type CloudSyncStatus = 'unavailable' | 'signedOut' | 'syncing' | 'synced' | 'error';

interface CloudSyncStatusState {
  status: CloudSyncStatus;
  user: CloudUser | null;
  /**
   * The first sync of this app session has finished (or failed, or there is no account to sync).
   * AppShell starts the day — streak, daily income, achievement day counters — only after it, so
   * a device that sat idle does not move its stale local copy first and lose the update to the
   * merge.
   */
  initialSyncDone: boolean;
  markInitialSyncDone: () => void;
  setStatus: (status: CloudSyncStatus) => void;
  setUser: (user: CloudUser | null) => void;
}

// Not persisted: this only mirrors the current session/sync state for UI (SettingsPage),
// while useCloudSync (mounted once in AppShell) is the only thing that writes to it.
export const useCloudSyncStatusStore = create<CloudSyncStatusState>((set) => ({
  status: isCloudSyncAvailable() ? 'signedOut' : 'unavailable',
  user: null,
  initialSyncDone: !isCloudSyncAvailable(),
  markInitialSyncDone: () => set({ initialSyncDone: true }),
  setStatus: (status) => set({ status }),
  setUser: (user) => set({ user }),
}));

/** Read-only view for UI, plus the sign-in/out actions — safe to call from any component. */
export function useCloudSyncStatus() {
  const status = useCloudSyncStatusStore((s) => s.status);
  const user = useCloudSyncStatusStore((s) => s.user);
  return {
    status,
    user,
    available: isCloudSyncAvailable(),
    signIn: () => void signInWithGoogle(),
    signOut: () => void signOut(),
  };
}

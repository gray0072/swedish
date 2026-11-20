import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { CloudUser } from '@/store/cloudSync';
import type { SaveFile } from '@/store/persist';

// The engine (useCloudSync) is tested against a fake cloud: fetch/push and the auth callback are
// mocked, mergeSaves and the store are the real ones.
const fetchCloudSave = vi.fn<(id: string) => Promise<SaveFile | null>>();
const pushCloudSave = vi.fn<(id: string, save: SaveFile) => Promise<void>>();
let authCallback: ((u: CloudUser | null) => void) | null = null;

vi.mock('@/store/cloudSync', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/cloudSync')>()),
  isCloudSyncAvailable: () => true,
  fetchCloudSave: (id: string) => fetchCloudSave(id),
  pushCloudSave: (id: string, save: SaveFile) => pushCloudSave(id, save),
  onAuthStateChange: (cb: (u: CloudUser | null) => void) => {
    authCallback = cb;
    return () => {
      authCallback = null;
    };
  },
}));

const { useCloudSync } = await import('@/store/useCloudSync');
const { useAppStore } = await import('@/store/appStore');
const { useCloudSyncStatusStore } = await import('@/store/cloudSyncStatus');
const { freshSave } = await import('@/store/persist');

const USER: CloudUser = { id: 'u1', email: null };

function cloudWith(overrides: Partial<SaveFile>): SaveFile {
  return { ...freshSave(), ...overrides };
}

async function signIn() {
  await act(async () => {
    authCallback?.(USER);
    await vi.advanceTimersByTimeAsync(0);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  fetchCloudSave.mockReset();
  pushCloudSave.mockReset();
  pushCloudSave.mockResolvedValue(undefined);
  useAppStore.setState(freshSave());
  useCloudSyncStatusStore.setState({ status: 'signedOut', user: null, initialSyncDone: false });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCloudSync', () => {
  it('never pushes after a failed pull, and retries the whole sync later', async () => {
    fetchCloudSave.mockRejectedValue(new Error('offline'));
    renderHook(() => useCloudSync());
    await signIn();
    expect(useCloudSyncStatusStore.getState().status).toBe('error');

    act(() => useAppStore.getState().addCoins(5));
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(fetchCloudSave.mock.calls.length).toBeGreaterThan(1);
    expect(pushCloudSave).not.toHaveBeenCalled();

    fetchCloudSave.mockResolvedValue(cloudWith({ historyRead: ['birka'] }));
    await act(() => vi.advanceTimersByTimeAsync(30_000));
    expect(pushCloudSave).toHaveBeenCalled();
    const pushed = pushCloudSave.mock.calls.at(-1)![1];
    expect(pushed.historyRead).toContain('birka');
    expect(pushed.wallet.coins).toBe(5);
    expect(useCloudSyncStatusStore.getState().status).toBe('synced');
  });

  it('pulls and merges before every push, so progress from another device survives', async () => {
    fetchCloudSave.mockResolvedValue(null);
    renderHook(() => useCloudSync());
    await signIn();
    expect(pushCloudSave).toHaveBeenCalledTimes(1);

    // Meanwhile another device read a history card and pushed it.
    fetchCloudSave.mockResolvedValue(cloudWith({ historyRead: ['birka'] }));
    act(() => useAppStore.getState().addCoins(7));
    await act(() => vi.advanceTimersByTimeAsync(10_000));

    expect(fetchCloudSave).toHaveBeenCalledTimes(2);
    const pushed = pushCloudSave.mock.calls.at(-1)![1];
    expect(pushed.historyRead).toContain('birka');
    expect(pushed.wallet.coins).toBe(7);
    expect(useAppStore.getState().historyRead).toContain('birka');
  });

  it('flushes pending changes as soon as the app is hidden', async () => {
    fetchCloudSave.mockResolvedValue(null);
    renderHook(() => useCloudSync());
    await signIn();
    pushCloudSave.mockClear();

    act(() => useAppStore.getState().addCoins(3));
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(0);
    });
    visibility.mockRestore();

    expect(pushCloudSave).toHaveBeenCalledTimes(1);
    expect(pushCloudSave.mock.calls[0][1].wallet.coins).toBe(3);
  });

  it('does not sync again just because a merge changed the store', async () => {
    fetchCloudSave.mockResolvedValue(cloudWith({ historyRead: ['birka'] }));
    renderHook(() => useCloudSync());
    await signIn();
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(fetchCloudSave).toHaveBeenCalledTimes(1);
  });

  it('keeps progress on content this version does not know in the cloud, but not in the store', async () => {
    const future = {
      attempts: 1,
      bestScore: 10,
      passed: true,
      lastAttemptAt: '2026-11-20T10:00:00.000Z',
      rewardedRunsToday: 1,
      rewardedRunsDate: '2026-11-20',
      lastRunQuestionIds: [],
    };
    fetchCloudSave.mockResolvedValue(cloudWith({ lessons: { 'lesson-from-a-newer-version': future } }));
    renderHook(() => useCloudSync());
    await signIn();

    expect(pushCloudSave.mock.calls[0][1].lessons['lesson-from-a-newer-version']).toEqual(future);
    expect(useAppStore.getState().lessons['lesson-from-a-newer-version']).toBeUndefined();
  });

  it('marks the first sync done only once it has finished', async () => {
    let resolveFetch: (save: SaveFile | null) => void = () => {};
    fetchCloudSave.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
    renderHook(() => useCloudSync());
    await signIn();
    expect(useCloudSyncStatusStore.getState().initialSyncDone).toBe(false);

    await act(async () => {
      resolveFetch(null);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(useCloudSyncStatusStore.getState().initialSyncDone).toBe(true);
  });
});

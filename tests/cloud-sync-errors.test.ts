import { describe, expect, it, vi } from 'vitest';

// fetchCloudSave/pushCloudSave read the module-level `supabase` client, so the client is
// mocked at the module level rather than passed in — matching how src/store/cloudSync.ts
// itself imports it. This isolates the one regression this file exists to guard: a failed
// Supabase request must reject, never resolve as if nothing were wrong (see cloudSync.ts's
// fetchCloudSave/pushCloudSave doc comments for the exact bug this caused in production).
const maybeSingle = vi.fn();
const upsert = vi.fn();

vi.mock('@/store/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
      upsert,
    }),
  },
}));

const { fetchCloudSave, pushCloudSave } = await import('@/store/cloudSync');
const { freshSave } = await import('@/store/persist');

describe('fetchCloudSave', () => {
  it('returns null when the user genuinely has no cloud save yet', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(fetchCloudSave('u1')).resolves.toBeNull();
  });

  it('throws instead of returning null on a real Supabase error (e.g. an RLS denial)', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'permission denied' } });
    // Throwing (not resolving to null) is what stops the caller from treating a failed fetch
    // as "no save exists" and overwriting the real cloud save with an empty local one.
    await expect(fetchCloudSave('u1')).rejects.toBeTruthy();
  });

  it('returns the saved data when the row exists and parses', async () => {
    maybeSingle.mockResolvedValueOnce({ data: { data: freshSave() }, error: null });
    await expect(fetchCloudSave('u1')).resolves.toMatchObject({ version: 1 });
  });
});

describe('pushCloudSave', () => {
  it('resolves when the upsert succeeds', async () => {
    upsert.mockResolvedValueOnce({ error: null });
    await expect(pushCloudSave('u1', freshSave())).resolves.toBeUndefined();
  });

  it('throws instead of silently succeeding when the upsert is rejected server-side', async () => {
    // supabase-js resolves { data, error } on a failed request instead of throwing — this is
    // exactly how the app once reported "synced" while the write never actually landed.
    upsert.mockResolvedValueOnce({ error: { message: 'new row violates row-level security policy' } });
    await expect(pushCloudSave('u1', freshSave())).rejects.toBeTruthy();
  });
});

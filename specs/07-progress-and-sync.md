# 7. Progress, persistence and the save file

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [07-progress-and-sync_ru.md](07-progress-and-sync_ru.md) and must be kept in sync.

Everything is stored in localStorage under one versioned key: `swedish-app:v1`.

```ts
interface SaveFile {
  version: 1;
  createdAt: string;
  profile: { name?: string; language: 'ru' | 'en' };   // UI + translations, one setting
  wallet: { xp: number; coins: number; level: number };
  streak: { current: number; longest: number; lastActiveDate: string; freezesAvailable: number };
  lessons: Record<LessonId, {
    attempts: number;
    bestScore: number;
    passed: boolean;
    lastAttemptAt: string;
    rewardedRunsToday: number;
  }>;
  items: Record<ItemId, {
    box: 0|1|2|3|4|5;
    dueAt: string;
    seen: number; correct: number; wrong: number;
    lastSeenAt: string;
  }>;
  city: {
    era: EraId;
    buildings: Record<BuildingId, { level: number; builtAt: string }>;
  };
  achievements: AchievementId[];
  settings: { theme: 'system'|'light'|'dark'; tts: { voice?: string; rate: number }; sound: boolean };
}
```

Rules:

- `persist.ts` owns a `migrations` map keyed by version; a save from an older version is
  migrated forward, never dropped.
- Ids the current content no longer has — lessons, questions (SRS items and
  `lastRunQuestionIds`), buildings, history cards, dialogues — are dropped whenever a save
  is loaded: from localStorage, an imported file or the cloud (`src/store/pruneSave.ts`).
- **Export / Import** buttons in Settings download/upload this JSON. This is the backup story
  for a backend-free app and must exist in v1.
- A corrupted save must never crash the app: parse with Zod, fall back to a fresh save, and
  show a non-blocking toast.

## 7.1 Optional cloud sync — Supabase

The app is backend-free by default: everything above works with no account and no network
call. Cloud sync is a layer on top, entirely opt-in (Settings → "Cloud sync" → sign in with
Google), for a learner using more than one device. Signing out, or never signing in, leaves
the app exactly as described in §7.

**Where it's configured:**

- A Supabase project (Auth + Postgres). Its URL and anon/publishable key live in `.env.local`
  (gitignored) as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, read at build time by Vite.
  These are not secrets: for a static site the built JS bundle ships to every visitor
  regardless, so the anon key is meant to be public — the actual access boundary is the
  database's row-level security, not key secrecy. The automatic CI deploy
  (`.github/workflows/deploy.yml`) reads the same two values from GitHub Actions repository
  secrets instead, since `.env.local` never reaches CI — leaving those secrets unset there is
  the usual reason a deployed build shows no sign-in button even though it works locally.
- `supabase/schema.sql` — run once by hand in the Supabase SQL editor. One table,
  `saves(user_id uuid primary key references auth.users, data jsonb, updated_at timestamptz)`,
  with RLS policies restricting every select/insert/update to `auth.uid() = user_id`. No
  `service_role` key is used anywhere in the client.
- Google sign-in via Supabase Auth, using the **PKCE** flow
  (`src/store/supabaseClient.ts`: `createClient(url, key, { auth: { flowType: 'pkce' } })`).
  This is required, not a style choice: the app uses `HashRouter` (§9), and Supabase's default
  *implicit* flow returns the session as a URL hash fragment (`#access_token=...`), which
  collides with the router's own use of `#` for routes and never gets picked up. PKCE returns
  `?code=...` as a query parameter instead, which `HashRouter` ignores.

**Code map:**

| File | Responsibility |
|---|---|
| `src/store/supabaseClient.ts` | Builds the client from the two env vars; `null` if either is unset, so a fork with no Supabase project simply has the feature compiled out |
| `src/store/cloudSync.ts` | Sign-in/out, fetch/push of the save row, and `mergeSaves()` (below) |
| `src/store/cloudSyncStatus.ts` | A small, non-persisted Zustand store mirroring session/sync status, so any component (not just the one running the sync effect) can read it via `useCloudSyncStatus()` |
| `src/store/useCloudSync.ts` | The actual effect — mounted once in `AppShell` — driving the sequence below |
| `SettingsPage.tsx` | The "Cloud sync" card: sign in/out button, status line |

**Sequence:** on sign-in (including "already signed in" on page load), pull the cloud row,
`mergeSaves()` it with the current local `SaveFile`, write the merged result back to both
`localStorage` (via the store) and Supabase. From then on, while signed in, any local change
is pushed after a 10s debounce (long enough that one quiz run collapses into a single upsert).

**Merge scheme.** A whole-file "last write wins" would silently discard progress made on
whichever device didn't happen to sync last — e.g. finishing a lesson on a phone and a
different one on a laptop before either syncs. Instead `mergeSaves()` merges field-by-field:

| Field | Rule |
|---|---|
| `lessons[id]` | Base record = whichever side has the newer `lastAttemptAt`; `bestScore`/`attempts` = max of both, `passed` = OR of both |
| `items[id]` (SRS) | `box`/`dueAt`/`lastCorrect`/`lastSeenAt` from whichever side reviewed it more recently; `seen`/`correct`/`wrong` = max of both |
| `city.buildings[id]` | Whichever side has the higher `level` wins outright — a building already bought further on one device is never downgraded |
| `wallet.{xp,coins}` | `max` of both — earned currency only grows; the trade-off is that two independent gains made on both devices between syncs aren't summed, only the larger is kept |
| `streak` | Whole record from whichever side has the more recent `lastActiveDate` (it's a small date-driven state machine, not safe to merge field-by-field); `longest` = max of both |
| `historyRead` / `dialoguesRead` | Set union |
| `dailyIncomeClaimedOn` | The later of the two dates, so a day already claimed on one device isn't paid out again |
| `settings`, `language` | Pulled from the cloud only the first time, when the local save is still untouched (`freshSave()` defaults) — otherwise the local device's own preference always wins, since theme/voice/etc. are per-device, not per-account |

All counters merge with `max`, never sum — this keeps a repeated merge (e.g. syncing again
before the other device has moved on) idempotent instead of double-counting. Covered by
`tests/cloud-sync-merge.test.ts`.

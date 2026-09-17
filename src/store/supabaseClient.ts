import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Cloud sync is an optional feature layered on top of a fully offline-first app: without
// these env vars set (e.g. a fork without its own Supabase project) this is null and every
// function in cloudSync.ts becomes a no-op, so the rest of the app is unaffected.
// PKCE, not the default implicit flow: implicit returns the session as a URL *hash* fragment
// (#access_token=...), which collides with HashRouter's own use of the URL hash for routes and
// never gets picked up. PKCE returns a ?code=... query param instead, which HashRouter ignores.
export const supabase: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey, { auth: { flowType: 'pkce' } })
  : null;

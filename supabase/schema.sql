-- Cloud sync for the offline-first save file (see src/store/persist.ts and src/store/cloudSync.ts).
-- Run this in the Supabase SQL editor for this project; running it again is safe.
-- The project is shared with other apps (tanks, world-aviation), so every table carries its app's
-- prefix: this one is swedish_saves.

-- (until 2026-10-11 the table was called plain `saves`: rename it, keeping its rows and policies)
do $$
begin
  if to_regclass('public.saves') is not null and to_regclass('public.swedish_saves') is null then
    alter table public.saves rename to swedish_saves;
  end if;
end $$;

create table if not exists public.swedish_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.swedish_saves enable row level security;

drop policy if exists "read own save" on public.swedish_saves;
create policy "read own save" on public.swedish_saves
  for select using (auth.uid() = user_id);

drop policy if exists "insert own save" on public.swedish_saves;
create policy "insert own save" on public.swedish_saves
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own save" on public.swedish_saves;
create policy "update own save" on public.swedish_saves
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

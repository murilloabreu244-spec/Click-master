-- CLICK MASTER: execute no SQL Editor do Supabase.
-- Antes: Authentication > Sign In / Providers > habilite Anonymous Sign-Ins.
create table if not exists public.click_master_leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_name text not null default 'Jogador' check (char_length(player_name) between 1 and 20),
  score bigint not null default 0 check (score >= 0),
  clicks bigint not null default 0 check (clicks >= 0),
  updated_at timestamptz not null default now()
);
create index if not exists click_master_leaderboard_score_idx
  on public.click_master_leaderboard (score desc, updated_at asc);
alter table public.click_master_leaderboard enable row level security;
grant select on public.click_master_leaderboard to anon, authenticated;
grant insert, update on public.click_master_leaderboard to authenticated;
drop policy if exists "Anyone can read leaderboard" on public.click_master_leaderboard;
create policy "Anyone can read leaderboard" on public.click_master_leaderboard
  for select using (true);
drop policy if exists "Players can insert own score" on public.click_master_leaderboard;
create policy "Players can insert own score" on public.click_master_leaderboard
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players can update own score" on public.click_master_leaderboard;
create policy "Players can update own score" on public.click_master_leaderboard
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

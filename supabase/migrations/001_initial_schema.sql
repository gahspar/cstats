create table if not exists public.favorite_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id integer not null,
  team_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, team_id)
);

create table if not exists public.saved_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id integer not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  match_id integer,
  model_version text not null default 'v0.1',
  inputs jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.api_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.match_logs (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null,
  event_name text,
  team_1 jsonb,
  team_2 jsonb,
  maps jsonb,
  played_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.processed_statistics (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('team', 'player', 'match', 'map')),
  entity_id text not null,
  metric_key text not null,
  metric_value numeric,
  metadata jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  unique (entity_type, entity_id, metric_key)
);

alter table public.favorite_teams enable row level security;
alter table public.saved_teams enable row level security;
alter table public.analysis_history enable row level security;
alter table public.api_cache enable row level security;
alter table public.match_logs enable row level security;
alter table public.processed_statistics enable row level security;

create policy "Users can manage own favorite teams"
  on public.favorite_teams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own saved teams"
  on public.saved_teams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own analysis history"
  on public.analysis_history for select
  using (auth.uid() = user_id);

create policy "Users can create own analysis history"
  on public.analysis_history for insert
  with check (auth.uid() = user_id);

create policy "Authenticated users can read api cache"
  on public.api_cache for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can read match logs"
  on public.match_logs for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can read processed statistics"
  on public.processed_statistics for select
  using (auth.role() = 'authenticated');

create index if not exists idx_api_cache_expires_at on public.api_cache (expires_at);
create index if not exists idx_match_logs_match_id on public.match_logs (match_id);
create index if not exists idx_processed_statistics_entity on public.processed_statistics (entity_type, entity_id);

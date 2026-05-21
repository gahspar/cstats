create table if not exists public.hltv_cache (
  cache_key text primary key,
  domain text not null,
  payload jsonb not null,
  expires_at timestamptz not null,
  stale_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id integer primary key,
  name text not null,
  logo_url text,
  country text,
  rank integer,
  players jsonb not null default '[]'::jsonb,
  ranking_development jsonb not null default '[]'::jsonb,
  social jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id integer primary key,
  nickname text not null,
  full_name text,
  image_url text,
  age integer,
  country text,
  team jsonb,
  statistics jsonb not null default '{}'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id integer primary key,
  title text,
  status text not null,
  starts_at timestamptz,
  event_id integer,
  event_name text,
  team1 jsonb,
  team2 jsonb,
  format text,
  maps jsonb not null default '[]'::jsonb,
  odds jsonb not null default '[]'::jsonb,
  stars integer,
  source text not null default 'hltv',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_matches (
  id integer primary key,
  title text,
  status text not null default 'live',
  starts_at timestamptz,
  event_name text,
  team1 jsonb,
  team2 jsonb,
  format text,
  maps jsonb not null default '[]'::jsonb,
  odds jsonb not null default '[]'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  team_id integer not null,
  team jsonb not null,
  place integer not null,
  points integer not null default 0,
  change integer not null default 0,
  is_new boolean not null default false,
  provider text not null default 'hltv',
  raw jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table if not exists public.maps_stats (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('team', 'player', 'match')),
  entity_id integer not null,
  map_name text not null,
  stats jsonb not null default '{}'::jsonb,
  source text not null default 'hltv',
  captured_at timestamptz not null default now(),
  unique (entity_type, entity_id, map_name, captured_at)
);

create table if not exists public.odds_history (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null,
  provider text not null,
  team1 numeric,
  team2 numeric,
  metadata jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table if not exists public.events (
  id integer primary key,
  name text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  country text,
  prize_pool text,
  number_of_teams integer,
  featured boolean not null default false,
  provider text not null default 'hltv',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.processed_predictions (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null,
  model_version text not null default 'hltv-v0.1',
  probabilities jsonb not null,
  inputs jsonb not null default '{}'::jsonb,
  rationale jsonb not null default '[]'::jsonb,
  disclaimer text not null default 'Analise estatistica baseada em dados historicos.',
  created_at timestamptz not null default now()
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  worker text not null,
  status text not null check (status in ('started', 'success', 'error')),
  provider text not null default 'hltv',
  records_processed integer not null default 0,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.hltv_cache enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.live_matches enable row level security;
alter table public.rankings enable row level security;
alter table public.maps_stats enable row level security;
alter table public.odds_history enable row level security;
alter table public.events enable row level security;
alter table public.processed_predictions enable row level security;
alter table public.sync_logs enable row level security;

create policy "Public can read hltv cache" on public.hltv_cache for select using (true);
create policy "Public can read teams" on public.teams for select using (true);
create policy "Public can read players" on public.players for select using (true);
create policy "Public can read matches" on public.matches for select using (true);
create policy "Public can read live matches" on public.live_matches for select using (true);
create policy "Public can read rankings" on public.rankings for select using (true);
create policy "Public can read maps stats" on public.maps_stats for select using (true);
create policy "Public can read odds history" on public.odds_history for select using (true);
create policy "Public can read events" on public.events for select using (true);
create policy "Public can read processed predictions" on public.processed_predictions for select using (true);
create policy "Authenticated users can read sync logs" on public.sync_logs for select using (auth.role() = 'authenticated');

create index if not exists idx_hltv_cache_domain_expires on public.hltv_cache (domain, expires_at);
create index if not exists idx_teams_rank on public.teams (rank);
create index if not exists idx_teams_name on public.teams using gin (to_tsvector('simple', name));
create index if not exists idx_players_nickname on public.players using gin (to_tsvector('simple', nickname));
create index if not exists idx_matches_status_starts_at on public.matches (status, starts_at desc);
create index if not exists idx_live_matches_starts_at on public.live_matches (starts_at);
create index if not exists idx_rankings_place on public.rankings (place);
create index if not exists idx_rankings_team_id on public.rankings (team_id);
create index if not exists idx_maps_stats_entity on public.maps_stats (entity_type, entity_id, map_name);
create index if not exists idx_odds_history_match_captured on public.odds_history (match_id, captured_at desc);
create index if not exists idx_events_starts_at on public.events (starts_at);
create index if not exists idx_processed_predictions_match on public.processed_predictions (match_id, created_at desc);
create index if not exists idx_sync_logs_worker_created on public.sync_logs (worker, created_at desc);

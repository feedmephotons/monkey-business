-- Monkey Business tables (prefixed mb_ to avoid collisions with taskx)

-- The public wall: styled posts from anyone
create table if not exists public.mb_wall_posts (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(author) between 1 and 40),
  message text not null check (char_length(message) between 1 and 500),
  font_color text not null default '#f4c430',
  bg_color text not null default '#0a3d1f',
  font_family text not null default 'display' check (font_family in ('display','serif','mono','hand')),
  rotation numeric not null default 0 check (rotation between -8 and 8),
  created_at timestamptz not null default now()
);
create index if not exists mb_wall_posts_created_at_idx on public.mb_wall_posts (created_at desc);

alter table public.mb_wall_posts enable row level security;

drop policy if exists "mb_wall_posts_read" on public.mb_wall_posts;
create policy "mb_wall_posts_read" on public.mb_wall_posts
  for select using (true);

drop policy if exists "mb_wall_posts_insert" on public.mb_wall_posts;
create policy "mb_wall_posts_insert" on public.mb_wall_posts
  for insert with check (true);

-- Players
create table if not exists public.mb_players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  created_at timestamptz not null default now()
);

-- Freeroll entries (Mon/Tue/Thu)
create table if not exists public.mb_freeroll_entries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.mb_players(id) on delete set null,
  day text not null check (day in ('monday','tuesday','thursday')),
  finish_place integer,
  payout_cents integer not null default 0,
  extra_chips_earned boolean not null default false,
  created_at timestamptz not null default now()
);

-- Satellite tickets awarded (Friday, 11 free entries from the $110 allocation)
create table if not exists public.mb_satellite_tickets (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.mb_players(id) on delete set null,
  week_of date not null,
  redeemed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Budget ledger for the $1,210 cap
create table if not exists public.mb_budget_ledger (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'freeroll_monday','freeroll_tuesday','high_hand_wed_hour','high_hand_wed_night',
    'freeroll_thursday','splash_pot_friday','satellite_tickets','other'
  )),
  amount_cents integer not null,
  note text,
  occurred_at timestamptz not null default now()
);

-- Weekly slot payout cap (configurable)
create table if not exists public.mb_slot_config (
  id integer primary key default 1 check (id = 1),
  weekly_cap_cents integer not null default 5000,
  updated_at timestamptz not null default now()
);
insert into public.mb_slot_config (id) values (1) on conflict do nothing;

create table if not exists public.mb_slot_payouts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.mb_players(id) on delete set null,
  amount_cents integer not null,
  week_of date not null,
  created_at timestamptz not null default now()
);

-- Read-only public views for the site
alter table public.mb_budget_ledger enable row level security;
drop policy if exists "mb_budget_ledger_read" on public.mb_budget_ledger;
create policy "mb_budget_ledger_read" on public.mb_budget_ledger
  for select using (true);

alter table public.mb_freeroll_entries enable row level security;
drop policy if exists "mb_freeroll_entries_read" on public.mb_freeroll_entries;
create policy "mb_freeroll_entries_read" on public.mb_freeroll_entries
  for select using (true);

alter table public.mb_satellite_tickets enable row level security;
drop policy if exists "mb_satellite_tickets_read" on public.mb_satellite_tickets;
create policy "mb_satellite_tickets_read" on public.mb_satellite_tickets
  for select using (true);

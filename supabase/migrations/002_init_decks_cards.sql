-- 002_init_decks_cards.sql
-- Initialize decks and cards tables with RLS

create table decks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color_code text default '#3b82f6',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on decks
alter table decks enable row level security;

-- RLS Policies for decks
create policy "Users can view own decks" on decks
  for select using (auth.uid() = user_id);

create policy "Users can insert own decks" on decks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own decks" on decks
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own decks" on decks
  for delete using (auth.uid() = user_id);

-- Create indexes on decks
create index idx_decks_user_id on decks(user_id);
create index idx_decks_created_at on decks(created_at);

-- Create cards table
create table cards (
  id uuid primary key default uuid_generate_v4(),
  deck_id uuid not null references decks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on cards
alter table cards enable row level security;

-- RLS Policies for cards
create policy "Users can view own cards" on cards
  for select using (auth.uid() = user_id);

create policy "Users can insert own cards" on cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update own cards" on cards
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cards" on cards
  for delete using (auth.uid() = user_id);

-- Create indexes on cards
create index idx_cards_deck_id on cards(deck_id);
create index idx_cards_user_id on cards(user_id);
create index idx_cards_created_at on cards(created_at);

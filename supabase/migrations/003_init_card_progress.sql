-- 003_init_card_progress.sql
-- Initialize card progress tracking for SM-2 algorithm

create table card_progress (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid not null unique references cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ease_factor numeric(4, 2) not null default 2.5,
  interval_days integer not null default 1,
  repetitions integer not null default 0,
  next_review_date timestamp with time zone not null default now(),
  last_reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on card_progress
alter table card_progress enable row level security;

-- RLS Policies for card_progress
create policy "Users can view own card progress" on card_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert own card progress" on card_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update own card progress" on card_progress
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own card progress" on card_progress
  for delete using (auth.uid() = user_id);

-- Create indexes on card_progress
create index idx_card_progress_card_id on card_progress(card_id);
create index idx_card_progress_user_id on card_progress(user_id);
create index idx_card_progress_next_review_date on card_progress(next_review_date);

-- Composite index for querying "due today" cards
create index idx_card_progress_user_due_today on card_progress(user_id, next_review_date);

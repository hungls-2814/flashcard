-- 001_init_auth_profiles.sql
-- Initialize authentication and user profiles

-- Enable required extensions
create extension if not exists "uuid-ossp" with schema extensions;

-- Create profiles table (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security (RLS) on profiles
alter table profiles enable row level security;

-- RLS Policy: Users can only read their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policy: Users can insert their own profile (during signup)
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Create index on email for faster lookups
create index idx_profiles_email on profiles(email);

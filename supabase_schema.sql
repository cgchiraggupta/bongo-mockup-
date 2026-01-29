-- Simple Supabase Schema for Antigravity
-- Run this in Supabase SQL Editor (supabase.com -> SQL Editor -> + New query)

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  role text default 'customer',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Allow users to see and edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

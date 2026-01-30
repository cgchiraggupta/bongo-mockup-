-- Simple Supabase Schema for Antigravity
-- Run this in Supabase SQL Editor (supabase.com -> SQL Editor -> + New query)

-- =============================================
-- PROFILES TABLE (existing)
-- =============================================
create table if not exists public.profiles (
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
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- BOOKINGS TABLE (new)
-- =============================================
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references auth.users not null,
  driver_id uuid references auth.users,
  status text default 'pending' check (status in ('pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  pickup_address text not null,
  pickup_lat double precision not null,
  pickup_lng double precision not null,
  dropoff_address text not null,
  dropoff_lat double precision not null,
  dropoff_lng double precision not null,
  package_size text default 'small' check (package_size in ('small', 'medium', 'large', 'extra_large')),
  package_description text,
  price decimal(10,2),
  estimated_distance_km decimal(10,2),
  estimated_duration_mins integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  picked_up_at timestamp with time zone,
  delivered_at timestamp with time zone
);

-- Enable RLS for bookings
alter table public.bookings enable row level security;

-- Customers can view and create their own bookings
create policy "Customers can view own bookings" on public.bookings
  for select using (auth.uid() = customer_id);

create policy "Customers can create bookings" on public.bookings
  for insert with check (auth.uid() = customer_id);

-- Drivers can view available bookings (pending status, no driver assigned)
create policy "Drivers can view available bookings" on public.bookings
  for select using (
    status = 'pending' and driver_id is null
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and (role = 'driver' or role = 'both')
    )
  );

-- Drivers can view their assigned bookings
create policy "Drivers can view assigned bookings" on public.bookings
  for select using (auth.uid() = driver_id);

-- Drivers can update bookings they're assigned to
create policy "Drivers can update assigned bookings" on public.bookings
  for update using (auth.uid() = driver_id);

-- =============================================
-- DRIVER LOCATIONS TABLE (new - for real-time tracking)
-- =============================================
create table if not exists public.driver_locations (
  driver_id uuid references auth.users primary key,
  lat double precision not null,
  lng double precision not null,
  heading double precision,
  speed double precision,
  is_online boolean default true,
  updated_at timestamp with time zone default now()
);

-- Enable RLS for driver locations
alter table public.driver_locations enable row level security;

-- Drivers can update their own location
create policy "Drivers can update own location" on public.driver_locations
  for all using (auth.uid() = driver_id);

-- Anyone can view driver locations (for tracking)
create policy "Anyone can view driver locations" on public.driver_locations
  for select using (true);

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================
-- Enable realtime for bookings and driver_locations
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.driver_locations;

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

create trigger driver_locations_updated_at
  before update on public.driver_locations
  for each row execute procedure public.handle_updated_at();

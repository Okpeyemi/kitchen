-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Trigger for new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for user-created recipes
create table if not exists user_recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  instruction text,
  ingredients jsonb,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_recipes enable row level security;

create policy "User recipes are viewable by everyone." on user_recipes
  for select using (true);

create policy "Users can insert their own recipes." on user_recipes
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own recipes." on user_recipes
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own recipes." on user_recipes
  for delete using ((select auth.uid()) = user_id);

-- Create a table for likes (bookmarks)
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  recipe_id text not null,
  is_external boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, recipe_id)
);

alter table likes enable row level security;

create policy "Users can see their own likes." on likes
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own likes." on likes
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can delete their own likes." on likes
  for delete using ((select auth.uid()) = user_id);

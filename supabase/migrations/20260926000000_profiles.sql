-- Member profiles for Wibe. One row per auth user, private to that user (blueprint §4: members
-- cannot read other private profiles). Vibe fields hold only what the member chose in the interview.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text check (char_length(avatar_url) <= 2048),
  vibe_archetype text check (vibe_archetype in ('night_owl', 'slow_sipper', 'trailblazer', 'culture_seeker', 'connector', 'social_butterfly')),
  vibe_tags text[] not null default '{}' check (cardinality(vibe_tags) <= 8),
  intents text[] not null default '{}' check (intents <@ array['friends', 'activity', 'networking', 'exploring']),
  interests text[] not null default '{}',
  interview_answers jsonb,
  interview_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Private member profile and self-selected vibe interview results. No inferred or sensitive attributes.';

alter table public.profiles enable row level security;

create policy "Members read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Members create their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "Members update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile row as soon as someone signs up (Google or email code).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

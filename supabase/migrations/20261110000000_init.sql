create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 50),
  timezone text not null default 'Europe/Sofia',
  created_at timestamptz not null default now()
);

create table public.walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  walked_on date not null,
  minutes int check (minutes between 1 and 1440),
  distance_km numeric(5,2) check (distance_km > 0 and distance_km <= 100),
  created_at timestamptz not null default now()
);
create index walks_user_day on public.walks (user_id, walked_on);

alter table public.profiles enable row level security;
alter table public.walks enable row level security;

create policy "own profile read" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Users may change their name only; timezone is set once at signup.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- +1 day of slack: the server clock is UTC, users are ahead of it.
create policy "own walks" on public.walks for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and walked_on <= current_date + 1);

-- Profile is created with the auth user, from the signup form's metadata.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 50), ''), 'Приятел'),
    coalesce(
      (select name from pg_catalog.pg_timezone_names where name = new.raw_user_meta_data ->> 'timezone'),
      'Europe/Sofia')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

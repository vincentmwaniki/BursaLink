-- BursaLink database, part 1: user profiles, roles and safe sign-up.

-- 1. The three kinds of user
create type public.user_role as enum ('student', 'admin', 'super_admin');

-- 2. One profile for every login account
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'New user',
  phone text unique,
  email text unique,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

-- 3. Row Level Security: nobody can read or change anything
--    unless a rule below allows it
alter table public.profiles enable row level security;

-- 4. Helper: is the current user a super administrator?
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'super_admin'
  );
$$;

revoke execute on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to authenticated;

-- 5. What logged-in users may do with profiles
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "Read own profile, or super admin reads all"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id or public.is_super_admin());

create policy "Update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 6. Create the profile automatically when someone signs up.
--    The role is ALWAYS 'student', whatever the person types in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New user'),
    nullif(new.phone, ''),
    nullif(new.email, ''),
    'student'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
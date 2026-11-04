-- BursaLink database, part 3a: organizations, their administrators, bursaries.

-- 1. Types
create type public.provider_type as enum
  ('constituency', 'county', 'foundation', 'corporate', 'university', 'ngo');

-- 'national' means open to every student. The others are tied to a place.
create type public.area_level as enum
  ('national', 'county', 'constituency', 'ward');

create type public.bursary_status as enum
  ('draft', 'published', 'closed', 'archived');

-- 2. Organizations that offer bursaries
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  provider_type public.provider_type not null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Which administrators belong to which organization.
--    Only a super administrator can change this (by hand, for now).
create table public.organization_admins (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  admin_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, admin_id)
);

create index on public.organization_admins (admin_id);

alter table public.organizations enable row level security;
alter table public.organization_admins enable row level security;

-- 4. Helper: is the current user an administrator of this organization?
create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_admins oa
    join public.profiles p on p.id = oa.admin_id
    where oa.organization_id = org_id
      and oa.admin_id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke execute on function public.is_org_admin(uuid) from public, anon;
grant execute on function public.is_org_admin(uuid) to authenticated;

-- 5. Bursaries
create table public.bursaries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  title text not null,
  description text not null default '',
  area_level public.area_level not null default 'national',
  county_id bigint references public.counties (id),
  constituency_id bigint references public.constituencies (id),
  ward_id bigint references public.wards (id),
  amount_min numeric(12, 2) not null check (amount_min >= 0),
  amount_max numeric(12, 2) not null,
  education_levels text[] not null default '{}',
  opens_at timestamptz not null default now(),
  closes_at timestamptz not null,
  status public.bursary_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_max >= amount_min),
  check (closes_at > opens_at),
  -- exactly one place, matching the level (or no place when national)
  constraint bursary_area_matches_level check (
    (area_level = 'national' and county_id is null and constituency_id is null and ward_id is null)
    or (area_level = 'county' and county_id is not null and constituency_id is null and ward_id is null)
    or (area_level = 'constituency' and constituency_id is not null and county_id is null and ward_id is null)
    or (area_level = 'ward' and ward_id is not null and county_id is null and constituency_id is null)
  )
);

create index on public.bursaries (organization_id);
create index on public.bursaries (status, closes_at);
create index on public.bursaries (county_id);
create index on public.bursaries (constituency_id);
create index on public.bursaries (ward_id);

alter table public.bursaries enable row level security;

-- Keep updated_at correct
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bursaries_set_updated_at
  before update on public.bursaries
  for each row execute function public.set_updated_at();

-- 6. Who can do what
grant select on public.organizations, public.organization_admins, public.bursaries
  to authenticated;

grant insert (organization_id, title, description, area_level, county_id,
              constituency_id, ward_id, amount_min, amount_max,
              education_levels, opens_at, closes_at, status)
  on public.bursaries to authenticated;

-- (organization_id is deliberately NOT updatable)
grant update (title, description, area_level, county_id, constituency_id,
              ward_id, amount_min, amount_max, education_levels,
              opens_at, closes_at, status)
  on public.bursaries to authenticated;

-- Any logged-in user can see the organizations (names are shown in Discover)
create policy "Read organizations"
  on public.organizations for select to authenticated using (true);

-- You can see your own memberships; a super admin can see all
create policy "Read own memberships"
  on public.organization_admins for select to authenticated
  using (admin_id = (select auth.uid()) or public.is_super_admin());

-- Students see published bursaries. An organization's administrators
-- see all of their own, including drafts.
create policy "Read bursaries"
  on public.bursaries for select to authenticated
  using (
    status = 'published'
    or public.is_org_admin(organization_id)
    or public.is_super_admin()
  );

-- An organization's administrators can create bursaries for their own
-- organization. Only a VERIFIED organization can publish.
create policy "Organization admins create bursaries"
  on public.bursaries for insert to authenticated
  with check (
    public.is_org_admin(organization_id)
    and (
      status = 'draft'
      or exists (
        select 1 from public.organizations o
        where o.id = organization_id and o.is_verified
      )
    )
  );

create policy "Organization admins update their bursaries"
  on public.bursaries for update to authenticated
  using (public.is_org_admin(organization_id))
  with check (
    public.is_org_admin(organization_id)
    and (
      status = 'draft'
      or exists (
        select 1 from public.organizations o
        where o.id = organization_id and o.is_verified
      )
    )
  );

-- There is no delete rule: bursaries are archived, never deleted.
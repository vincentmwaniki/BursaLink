-- BursaLink database, part 2: places and each student's registered area.
-- The places below are FICTIONAL samples. Real counties, constituencies
-- and wards will be loaded later from the official list.

-- 1. Places: county -> constituency -> ward
create table public.counties (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table public.constituencies (
  id bigint generated always as identity primary key,
  county_id bigint not null references public.counties (id) on delete restrict,
  name text not null,
  unique (county_id, name)
);

create table public.wards (
  id bigint generated always as identity primary key,
  constituency_id bigint not null references public.constituencies (id) on delete restrict,
  name text not null,
  unique (constituency_id, name)
);

create index on public.constituencies (county_id);
create index on public.wards (constituency_id);

alter table public.counties enable row level security;
alter table public.constituencies enable row level security;
alter table public.wards enable row level security;

-- Anyone may READ the list of places. Nobody can change it through the app.
grant select on public.counties, public.constituencies, public.wards
  to anon, authenticated;

create policy "Anyone can read counties"
  on public.counties for select to anon, authenticated using (true);
create policy "Anyone can read constituencies"
  on public.constituencies for select to anon, authenticated using (true);
create policy "Anyone can read wards"
  on public.wards for select to anon, authenticated using (true);

-- 2. Sample places
insert into public.counties (name) values ('Sample County'), ('Other County');

insert into public.constituencies (county_id, name)
select c.id, v.constituency
from (values
  ('Sample County', 'Sample Constituency'),
  ('Sample County', 'Another Constituency'),
  ('Other County', 'Other Constituency')
) as v (county, constituency)
join public.counties c on c.name = v.county;

insert into public.wards (constituency_id, name)
select k.id, v.ward
from (values
  ('Sample Constituency', 'Sample Ward'),
  ('Sample Constituency', 'Second Sample Ward'),
  ('Another Constituency', 'Another Ward A'),
  ('Another Constituency', 'Another Ward B'),
  ('Other Constituency', 'Other Ward A'),
  ('Other Constituency', 'Other Ward B')
) as v (constituency, ward)
join public.constituencies k on k.name = v.constituency;

-- 3. Each student's registered area.
--    We store only the ward. The constituency and county follow from it,
--    so they can never disagree with each other.
create table public.student_areas (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  ward_id bigint not null references public.wards (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index on public.student_areas (ward_id);

alter table public.student_areas enable row level security;

grant select on public.student_areas to authenticated;
grant insert (student_id, ward_id) on public.student_areas to authenticated;

create policy "Read own area, or super admin reads all"
  on public.student_areas for select to authenticated
  using (student_id = (select auth.uid()) or public.is_super_admin());

-- A student can register their area ONCE, for themselves only.
-- There is no update or delete rule, so they cannot change it later.
-- Changes will go through an administrator's approval (a later part).
create policy "Students register their own area"
  on public.student_areas for insert to authenticated
  with check (student_id = (select auth.uid()));
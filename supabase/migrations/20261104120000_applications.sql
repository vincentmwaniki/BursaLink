-- BursaLink database, part 3b: applications and the rules for applying.

create type public.application_status as enum
  ('submitted', 'under_review', 'more_info_needed', 'shortlisted',
   'approved', 'unsuccessful', 'withdrawn');

-- Numbers for reference codes such as BL-2026-000001
create sequence public.application_ref_seq;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique default (
    'BL-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.application_ref_seq')::text, 6, '0')
  ),
  bursary_id uuid not null references public.bursaries (id) on delete restrict,
  student_id uuid not null references public.profiles (id) on delete restrict,
  status public.application_status not null default 'submitted',
  form_data jsonb not null default '{}'::jsonb,
  admin_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- RULE: one application per student per bursary
  unique (bursary_id, student_id)
);

create index on public.applications (student_id);
create index on public.applications (bursary_id, status);

alter table public.applications enable row level security;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- RULE: who may apply to what. Checked by the database on every application.
create or replace function public.check_application_allowed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.bursaries%rowtype;
  s record;
begin
  if not exists (
    select 1 from public.profiles
    where id = new.student_id and role = 'student'
  ) then
    raise exception 'Only students can apply for bursaries.';
  end if;

  select * into b from public.bursaries where id = new.bursary_id;
  if not found or b.status <> 'published'
     or now() < b.opens_at or now() > b.closes_at then
    raise exception 'This bursary is not open for applications.';
  end if;

  select w.id as ward_id, k.id as constituency_id, k.county_id as county_id
  into s
  from public.student_areas sa
  join public.wards w on w.id = sa.ward_id
  join public.constituencies k on k.id = w.constituency_id
  where sa.student_id = new.student_id;

  if not found then
    raise exception 'Please register your county, constituency and ward before applying.';
  end if;

  if b.area_level = 'county' and b.county_id <> s.county_id then
    raise exception 'This bursary is only for students registered in its county.';
  elsif b.area_level = 'constituency' and b.constituency_id <> s.constituency_id then
    raise exception 'This bursary is only for students registered in its constituency.';
  elsif b.area_level = 'ward' and b.ward_id <> s.ward_id then
    raise exception 'This bursary is only for students registered in its ward.';
  end if;

  return new;
end;
$$;

revoke execute on function public.check_application_allowed()
  from public, anon, authenticated;

create trigger applications_check_allowed
  before insert on public.applications
  for each row execute function public.check_application_allowed();

-- Helper: can the current user manage this bursary's applications?
create or replace function public.can_manage_bursary(b_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.bursaries b
    where b.id = b_id and public.is_org_admin(b.organization_id)
  );
$$;

revoke execute on function public.can_manage_bursary(uuid) from public, anon;
grant execute on function public.can_manage_bursary(uuid) to authenticated;

-- Permissions: a student can only choose the bursary and fill in the form.
-- Status, feedback and the reference number are NOT in their hands.
grant select on public.applications to authenticated;
grant insert (bursary_id, student_id, form_data) on public.applications to authenticated;
grant update (status, admin_feedback) on public.applications to authenticated;
grant usage on sequence public.application_ref_seq to authenticated;

create policy "Read own applications, or those of your bursaries"
  on public.applications for select to authenticated
  using (
    student_id = (select auth.uid())
    or public.is_super_admin()
    or public.can_manage_bursary(bursary_id)
  );

create policy "Students apply for themselves"
  on public.applications for insert to authenticated
  with check (student_id = (select auth.uid()));

-- Only the administrators of the bursary's organization can change a status.
-- Students have no update rule, so they cannot approve themselves.
create policy "Organization admins update applications"
  on public.applications for update to authenticated
  using (public.can_manage_bursary(bursary_id))
  with check (public.can_manage_bursary(bursary_id));
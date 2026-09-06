-- GHS Mbonjo Limbe. Schema, Part 3 of the specification.
-- Run this first, in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table departments (
  code       text primary key,
  name_en    text not null,
  name_fr    text not null
);

create type service_status   as enum ('active','retired','abandoned','transferred','unknown','suspended');
create type employment_type  as enum ('permanent','contract');
create type matricule_status as enum ('valid','irregular','none');

create table staff (
  id                          uuid primary key default gen_random_uuid(),
  display_name                text not null,
  former_name                 text not null default '',
  sex                         text,
  date_of_birth               date,
  place_of_birth              text,
  marital_status              text,
  ethnic_group                text,
  first_language              text,
  region_of_origin            text,
  division_of_origin          text,
  subdivision_of_origin       text,
  matricule_raw               text,
  matricule_normalised        text,
  matricule_status            matricule_status not null default 'none',
  employment_type             employment_type  not null default 'permanent',
  corps                       text,
  echelon                     text,
  salary_index                text,
  longevity                   text,
  weekly_workload             text,
  date_entered_public_service date,
  entry_certificate           text,
  last_certificate            text,
  highest_qualification       text,
  specialty                   text,
  primary_department          text references departments(code),
  date_assumed_duty_here      date,
  appointment_decision_no     text not null default 'ON DUTY',
  region_of_work              text not null default 'South West',
  division_of_work            text not null default 'Fako',
  subdivision_of_work         text not null default 'Limbe III',
  place_of_work               text not null default 'GHS Mbonjo Limbe',
  redeployed                  boolean not null default false,
  phone                       text,
  whatsapp                    text,
  email                       text,
  service_status              service_status not null default 'active',
  status_note                 text,
  photo_path                  text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index on staff (service_status);
create index on staff (primary_department);
create unique index staff_matricule_key on staff (matricule_normalised)
  where matricule_normalised is not null and matricule_normalised <> '';

-- every imported row is kept. No source is ever overwritten.
create table source_records (
  id           uuid primary key default gen_random_uuid(),
  source       text not null check (source in ('ministry','card_index','id_card','upload')),
  imported_at  timestamptz not null default now(),
  file_name    text,
  staff_id     uuid references staff(id) on delete set null,
  match_method text,
  payload      jsonb not null
);
create index on source_records (staff_id);

create table reconciliation_flags (
  id          uuid primary key default gen_random_uuid(),
  staff_id    uuid not null references staff(id) on delete cascade,
  kind        text not null,
  detail      text not null,
  resolved    boolean not null default false,
  resolved_by uuid references staff(id),
  resolved_at timestamptz
);

create type staff_role as enum (
  'principal','vice_principal','senior_discipline_master','discipline_master',
  'bursar','hod','guidance_counsellor','pedagogic_animator','staff_social_president',
  'teacher','secretary','librarian','laboratory_assistant');

create table role_assignments (
  id          uuid primary key default gen_random_uuid(),
  staff_id    uuid not null references staff(id) on delete cascade,
  role        staff_role not null,
  department  text references departments(code),
  note        text,
  starts_on   date not null,
  ends_on     date,
  assigned_by uuid references staff(id),
  created_at  timestamptz not null default now()
);
create index on role_assignments (staff_id) where ends_on is null;
create index on role_assignments (role)     where ends_on is null;
create unique index one_principal_at_a_time on role_assignments (role)
  where role = 'principal' and ends_on is null;

create table classes (
  id        uuid primary key default gen_random_uuid(),
  label     text not null unique,
  level     text not null,
  stream    text,
  arm       text,
  cycle     smallint not null default 1,
  master_id uuid references staff(id)
);

create table students (
  id             uuid primary key default gen_random_uuid(),
  school_number  text,
  matricule      text,
  display_name   text not null,
  sex            text,
  date_of_birth  date,
  place_of_birth text,
  guardian_name  text,
  guardian_phone text,
  created_at     timestamptz not null default now()
);
create index on students (matricule);

create table enrolments (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  class_id   uuid not null references classes(id) on delete cascade,
  year       text not null,
  starts_on  date not null,
  ends_on    date,
  unique (student_id, class_id, year)
);

create type document_type   as enum ('attestation','certificate','letter','report_card');
create type document_status as enum ('draft','final','cancelled');

create table settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references staff(id)
);

create table reference_counters (
  scope_key  text primary key,
  next_value integer not null
);

create table documents (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null,
  reference_manual   boolean not null default false,
  type               document_type not null,
  status             document_status not null default 'final',
  subject_staff_id   uuid references staff(id),
  subject_student_id uuid references students(id),
  issued_on          date not null default current_date,
  issued_by          uuid references staff(id),
  cancelled_reason   text,
  snapshot           jsonb not null,
  created_at         timestamptz not null default now()
);
create index on documents (reference);
create index on documents (issued_on desc);

create type approval_status as enum ('draft','pending','approved','rejected');

create table notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  department  text references departments(code),
  class_id    uuid references classes(id),
  body        text,
  file_path   text,
  status      approval_status not null default 'draft',
  uploaded_by uuid references staff(id),
  approved_by uuid references staff(id),
  remark      text,
  created_at  timestamptz not null default now()
);

create table assignments (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  department text references departments(code),
  class_id   uuid references classes(id),
  body       text,
  due_on     date,
  out_of     smallint not null default 20,
  set_by     uuid references staff(id),
  created_at timestamptz not null default now()
);

create table submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id    uuid not null references students(id) on delete cascade,
  body          text,
  file_path     text,
  submitted_at  timestamptz not null default now(),
  mark          numeric(5,2),
  marked_by     uuid references staff(id),
  unique (assignment_id, student_id)
);

create table quizzes (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  department text references departments(code),
  class_id   uuid references classes(id),
  questions  jsonb not null,
  set_by     uuid references staff(id),
  created_at timestamptz not null default now()
);

create table quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  quiz_id    uuid not null references quizzes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  answers    jsonb not null,
  score      smallint not null,
  out_of     smallint not null,
  taken_at   timestamptz not null default now(),
  unique (quiz_id, student_id)
);

create table marks (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  department  text not null references departments(code),
  sequence    smallint not null check (sequence between 1 and 6),
  year        text not null,
  score       numeric(5,2) not null check (score >= 0 and score <= 20),
  recorded_by uuid references staff(id),
  recorded_at timestamptz not null default now(),
  unique (student_id, department, sequence, year)
);

create table report_remarks (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  sequence      smallint not null,
  year          text not null,
  remark        text not null,
  drafted_by_ai boolean not null default false,
  approved_by   uuid references staff(id),
  unique (student_id, sequence, year)
);

create table attendance (
  id        uuid primary key default gen_random_uuid(),
  class_id  uuid not null references classes(id) on delete cascade,
  on_date   date not null,
  absent    uuid[] not null default '{}',
  marked_by uuid references staff(id),
  marked_at timestamptz not null default now(),
  unique (class_id, on_date)
);

create table discipline_records (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  on_date     date not null,
  offence     text not null,
  sanction    text,
  recorded_by uuid references staff(id),
  created_at  timestamptz not null default now()
);

create table news_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  body         text,
  image_path   text,
  published_on date,
  status       text not null default 'draft' check (status in ('draft','published')),
  author_id    uuid references staff(id),
  created_at   timestamptz not null default now()
);

create table events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  starts_on   date not null,
  ends_on     date,
  location    text,
  description text,
  created_by  uuid references staff(id)
);

create table clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  meets       text,
  description text,
  patron_id   uuid references staff(id)
);

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  staff_id     uuid references staff(id)    on delete set null,
  student_id   uuid references students(id) on delete set null,
  account_role text not null check (account_role in
    ('principal','vice_principal','senior_discipline_master','bursar','hod',
     'teacher','secretary','student','parent')),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table audit_log (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  actor_id   uuid references profiles(id),
  actor_name text,
  actor_role text,
  action     text not null,
  entity     text,
  detail     text
);
create index on audit_log (at desc);

create table ai_providers (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  base_url          text not null,
  model             text not null,
  adapter           text not null check (adapter in ('openai_compatible','gemini')),
  api_key_encrypted text,
  priority          smallint not null default 100,
  enabled           boolean not null default true,
  failures          smallint not null default 0,
  paused_until      timestamptz
);

create table ai_calls (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  provider_id uuid references ai_providers(id),
  purpose     text,
  latency_ms  integer,
  outcome     text
);

create table wake_log (
  id     bigserial primary key,
  at     timestamptz not null default now(),
  source text
);

create or replace function touch_updated_at() returns trigger
  language plpgsql as $fn$ begin new.updated_at = now(); return new; end $fn$;
create trigger staff_touch before update on staff
  for each row execute function touch_updated_at();

-- allocates the next reference number without two people ever taking the same one
create or replace function next_reference(p_scope text, p_start integer default 1)
returns integer language plpgsql security definer as $fn$
declare v integer;
begin
  insert into reference_counters (scope_key, next_value)
  values (p_scope, p_start)
  on conflict (scope_key) do nothing;
  update reference_counters set next_value = next_value + 1
   where scope_key = p_scope returning next_value - 1 into v;
  return v;
end $fn$;

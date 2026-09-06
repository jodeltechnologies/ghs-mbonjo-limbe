-- Row level security. Part 10.3 of the specification:
-- "so that a leaked key does not open the whole register".
-- Run after 01-schema.sql.

-- ---------------------------------------------------------------- helpers
create or replace function auth_role() returns text
  language sql stable security definer as $fn$
  select account_role from profiles where id = auth.uid() and active
$fn$;

create or replace function auth_staff_id() returns uuid
  language sql stable security definer as $fn$
  select staff_id from profiles where id = auth.uid() and active
$fn$;

create or replace function auth_student_id() returns uuid
  language sql stable security definer as $fn$
  select student_id from profiles where id = auth.uid() and active
$fn$;

-- the departments named in this person's role assignments.
-- A Vice Principal responsible for Chemistry sees Chemistry, and nothing else.
create or replace function auth_scope() returns text[]
  language sql stable security definer as $fn$
  select coalesce(array_agg(distinct department) filter (where department is not null), '{}')
  from role_assignments
  where staff_id = auth_staff_id() and ends_on is null
$fn$;

create or replace function is_admin() returns boolean
  language sql stable as $fn$ select auth_role() = 'principal' $fn$;

create or replace function is_office() returns boolean
  language sql stable as $fn$ select auth_role() in ('principal','secretary') $fn$;

create or replace function is_staff() returns boolean
  language sql stable as $fn$ select auth_staff_id() is not null $fn$;

-- ---------------------------------------------------------------- enable
alter table departments          enable row level security;
alter table staff                enable row level security;
alter table source_records       enable row level security;
alter table reconciliation_flags enable row level security;
alter table role_assignments     enable row level security;
alter table classes              enable row level security;
alter table students             enable row level security;
alter table enrolments           enable row level security;
alter table settings             enable row level security;
alter table reference_counters   enable row level security;
alter table documents            enable row level security;
alter table notes                enable row level security;
alter table assignments          enable row level security;
alter table submissions          enable row level security;
alter table quizzes              enable row level security;
alter table quiz_attempts        enable row level security;
alter table marks                enable row level security;
alter table report_remarks       enable row level security;
alter table attendance           enable row level security;
alter table discipline_records   enable row level security;
alter table news_posts           enable row level security;
alter table events               enable row level security;
alter table clubs                enable row level security;
alter table profiles             enable row level security;
alter table audit_log            enable row level security;
alter table ai_providers         enable row level security;
alter table ai_calls             enable row level security;
alter table wake_log             enable row level security;

-- ---------------------------------------------------------------- public
-- The public site reads these with the anon key and nothing else.
create policy public_read on departments for select using (true);
create policy public_read on news_posts  for select using (status = 'published');
create policy public_read on events      for select using (true);
create policy public_read on clubs       for select using (true);

-- Verify answers only whether a reference is genuine. It reads no personal data,
-- so it runs through a security definer function rather than a table policy.
create or replace function verify_reference(p_ref text)
returns table (found boolean, kind text, reference text, issued_on date, status text, concerning text)
language sql stable security definer as $fn$
  select true,
         d.type::text,
         d.reference,
         d.issued_on,
         d.status::text,
         coalesce(s.display_name, st.display_name, '')
  from documents d
  left join staff s     on s.id  = d.subject_staff_id
  left join students st on st.id = d.subject_student_id
  where upper(regexp_replace(d.reference, '[^0-9A-Za-z]', '', 'g'))
      = upper(regexp_replace(p_ref,       '[^0-9A-Za-z]', '', 'g'))
  limit 1
$fn$;
revoke all on function verify_reference(text) from public;
grant execute on function verify_reference(text) to anon, authenticated;

create or replace function verify_staff(p_matricule text)
returns table (found boolean, name text, serving boolean)
language sql stable security definer as $fn$
  select true, s.display_name, s.service_status = 'active'
  from staff s
  where upper(regexp_replace(coalesce(s.matricule_normalised, s.matricule_raw, ''),
                             '[^0-9A-Za-z]', '', 'g'))
      = upper(regexp_replace(p_matricule, '[^0-9A-Za-z]', '', 'g'))
  limit 1
$fn$;
revoke all on function verify_staff(text) from public;
grant execute on function verify_staff(text) to anon, authenticated;

-- ---------------------------------------------------------------- staff table
-- Part 4. Principal and Secretary see every record. A Vice Principal or Head of
-- Department sees the departments named in their assignment. A teacher sees only
-- their own. Nobody else sees anything.
create policy staff_select on staff for select to authenticated using (
  is_office()
  or id = auth_staff_id()
  or (auth_role() in ('vice_principal','hod') and primary_department = any (auth_scope()))
);
create policy staff_update on staff for update to authenticated
  using (is_admin()) with check (is_admin());
create policy staff_insert on staff for insert to authenticated with check (is_admin());

create policy sources_select on source_records for select to authenticated using (is_admin());
create policy sources_write  on source_records for all    to authenticated
  using (is_admin()) with check (is_admin());
create policy flags_select on reconciliation_flags for select to authenticated using (is_admin());
create policy flags_write  on reconciliation_flags for all    to authenticated
  using (is_admin()) with check (is_admin());

create policy roles_select on role_assignments for select to authenticated using (is_staff());
create policy roles_write  on role_assignments for all    to authenticated
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- pupils
create policy classes_select on classes for select to authenticated using (is_staff());
create policy classes_write  on classes for all    to authenticated
  using (auth_role() in ('principal','vice_principal'))
  with check (auth_role() in ('principal','vice_principal'));

-- A parent or pupil sees one child. Staff see the pupils they teach.
create policy students_select on students for select to authenticated using (
  is_staff() or id = auth_student_id()
);
create policy students_write on students for all to authenticated
  using (auth_role() in ('principal','vice_principal','secretary'))
  with check (auth_role() in ('principal','vice_principal','secretary'));

create policy enrolments_select on enrolments for select to authenticated using (
  is_staff() or student_id = auth_student_id()
);
create policy enrolments_write on enrolments for all to authenticated
  using (auth_role() in ('principal','vice_principal','secretary'))
  with check (auth_role() in ('principal','vice_principal','secretary'));

-- ---------------------------------------------------------------- documents
create policy settings_select on settings for select to authenticated using (is_staff());
create policy settings_write  on settings for all    to authenticated
  using (is_admin()) with check (is_admin());

create policy counters_select on reference_counters for select to authenticated using (is_staff());
create policy counters_write  on reference_counters for all    to authenticated
  using (auth_role() in ('principal','vice_principal','secretary'))
  with check (auth_role() in ('principal','vice_principal','secretary'));

create policy documents_select on documents for select to authenticated using (
  auth_role() in ('principal','vice_principal','secretary')
  or subject_staff_id = auth_staff_id()
  or subject_student_id = auth_student_id()
);
create policy documents_insert on documents for insert to authenticated with check (
  auth_role() in ('principal','vice_principal','secretary')
);
-- only the Principal may cancel, and no document may ever be deleted
create policy documents_update on documents for update to authenticated
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- teaching
create policy notes_select on notes for select to authenticated using (
  status = 'approved'
  or uploaded_by = auth_staff_id()
  or is_admin()
  or (auth_role() in ('vice_principal','hod') and department = any (auth_scope()))
);
create policy notes_insert on notes for insert to authenticated with check (
  uploaded_by = auth_staff_id()
);
create policy notes_update on notes for update to authenticated using (
  uploaded_by = auth_staff_id()
  or is_admin()
  or (auth_role() in ('vice_principal','hod') and department = any (auth_scope()))
);

create policy assignments_select on assignments for select to authenticated using (
  is_staff() or auth_student_id() is not null
);
create policy assignments_write on assignments for all to authenticated
  using (is_staff()) with check (is_staff());

create policy submissions_select on submissions for select to authenticated using (
  is_staff() or student_id = auth_student_id()
);
create policy submissions_insert on submissions for insert to authenticated with check (
  student_id = auth_student_id()
);
create policy submissions_update on submissions for update to authenticated using (is_staff());

create policy quizzes_select on quizzes for select to authenticated using (true);
create policy quizzes_write  on quizzes for all to authenticated
  using (is_staff()) with check (is_staff());

create policy attempts_select on quiz_attempts for select to authenticated using (
  is_staff() or student_id = auth_student_id()
);
create policy attempts_insert on quiz_attempts for insert to authenticated with check (
  student_id = auth_student_id()
);

create policy marks_select on marks for select to authenticated using (
  is_staff() or student_id = auth_student_id()
);
create policy marks_write on marks for all to authenticated
  using (is_staff()) with check (is_staff());

create policy remarks_select on report_remarks for select to authenticated using (
  is_staff() or student_id = auth_student_id()
);
create policy remarks_write on report_remarks for all to authenticated
  using (is_staff()) with check (is_staff());

create policy attendance_select on attendance for select to authenticated using (is_staff());
create policy attendance_write  on attendance for all to authenticated
  using (auth_role() in ('principal','vice_principal','senior_discipline_master','teacher'))
  with check (auth_role() in ('principal','vice_principal','senior_discipline_master','teacher'));

-- discipline is never visible to the pupil's own account
create policy discipline_select on discipline_records for select to authenticated using (
  auth_role() in ('principal','vice_principal','senior_discipline_master')
);
create policy discipline_write on discipline_records for all to authenticated
  using (auth_role() in ('principal','vice_principal','senior_discipline_master'))
  with check (auth_role() in ('principal','vice_principal','senior_discipline_master'));

-- ---------------------------------------------------------------- content
create policy news_staff_select on news_posts for select to authenticated using (is_staff());
create policy news_write on news_posts for all to authenticated
  using (auth_role() in ('principal','vice_principal','secretary'))
  with check (auth_role() in ('principal','vice_principal','secretary'));
create policy events_write on events for all to authenticated
  using (auth_role() in ('principal','vice_principal','secretary'))
  with check (auth_role() in ('principal','vice_principal','secretary'));
create policy clubs_write on clubs for all to authenticated
  using (auth_role() in ('principal','vice_principal'))
  with check (auth_role() in ('principal','vice_principal'));

-- ---------------------------------------------------------------- accounts
create policy profiles_self on profiles for select to authenticated using (
  id = auth.uid() or is_admin()
);
create policy profiles_admin on profiles for all to authenticated
  using (is_admin()) with check (is_admin());

create policy audit_select on audit_log for select to authenticated using (is_admin());
create policy audit_insert on audit_log for insert to authenticated with check (true);

-- keys are never readable from the browser
create policy providers_admin on ai_providers for all to authenticated
  using (is_admin()) with check (is_admin());
create policy ai_calls_admin  on ai_calls     for select to authenticated using (is_admin());
create policy wake_admin      on wake_log     for select to authenticated using (is_admin());

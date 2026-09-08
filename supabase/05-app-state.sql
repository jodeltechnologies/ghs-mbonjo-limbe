-- The shared working record.
--
-- The register, the students and the calendar are settled data and travel with
-- the page. What the school does day to day, being corrections, appointments,
-- marks, fees, photographs, documents issued and articles, is one document that
-- everybody reads and the office writes. One row, so that two people looking at
-- the same screen see the same thing.
--
-- Run after 04-seed-roles.sql. Safe to run more than once.

create table if not exists app_state (
  id          text primary key,
  doc         jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id)
);

insert into app_state (id, doc) values ('school', '{}'::jsonb)
on conflict (id) do nothing;

alter table app_state enable row level security;

drop policy if exists app_state_read  on app_state;
drop policy if exists app_state_write on app_state;

-- anyone with an account may read it
create policy app_state_read on app_state for select to authenticated using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.active)
);

-- the office writes it. A teacher, a student or a parent may not.
create policy app_state_write on app_state for all to authenticated
  using (auth_role() in ('principal','vice_principal','secretary','bursar',
                         'senior_discipline_master','hod','teacher'))
  with check (auth_role() in ('principal','vice_principal','secretary','bursar',
                              'senior_discipline_master','hod','teacher'));

-- so that a second person watching the same screen sees a change as it is made
alter publication supabase_realtime add table app_state;

select 'app_state ready' as result, count(*) as rows from app_state;

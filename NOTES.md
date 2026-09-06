# Notes on how this differs from the specification

Three decisions were taken during the build that depart from the document, each
for a reason. The Principal should accept or reject them.

## 1. Prisma owns the schema. Reads go through Supabase.

Part 2 names Prisma for data access. Prisma connects to PostgreSQL as the
database owner, and a connection made that way bypasses row level security.
Part 10.3 asks for row level security "so that a leaked key does not open the
whole register", and those two things cannot both be true at once.

So Prisma holds the schema and can generate migrations, while every read and
write in the application goes through the Supabase client carrying the signed
in person's own session. The policies in `supabase/02-policies.sql` are
therefore actually in force, and a Vice Principal responsible for Chemistry
receives Chemistry rows from the database itself, not merely from a filter in
the application that a mistake could remove.

The cost is that queries are written against Supabase's query builder rather
than Prisma's typed client.

## 2. The register holds 92 people, not 71.

Part 6 arrives at 71 by taking the 87 ministry records and subtracting the
retired, those who have abandoned post, the unknown, one duplicate and two
transfers. That arithmetic is right for the ministry export.

It leaves out the six people who appear on the school's own card index or
identity cards and are absent from the ministry file, which Part 6 itself
notes. Adding them gives 92 distinct people, of whom **77 are in service**.

The specification's own principle decides this. The school's record is the
truth, and the ministry database lags behind reality.

## 3. Ten Heads of Department, not twelve.

Part 12 says twelve Heads are marked in the card index without a department
named. Matching the card index against the other two sources, after the six
duplicated names are merged, gives ten such people, plus Maureen Eduke Ngwese
who is named in the specification as Head of Guidance and Counselling. They are
imported unassigned, as Part 12 asks.

## What is not built

Phases 4 and 5 of Part 11, being notes with approval, assignments, quizzes,
marks, attendance, discipline, report cards and parent access. The tables for
all of them are in `supabase/01-schema.sql` and the policies are in
`supabase/02-policies.sql`, so the database is ready and only the screens are
missing. The working prototype covers them, and the screens port across.

## One thing to check before trusting this repository

It was written but never installed or built, because the machine it was written
on had no network access. The SQL was checked structurally and the application
follows conventional Next.js patterns, but the first `npm install` and the first
Vercel deployment are the first real test. Expect to fix a version or an import
path. The prototype, which was tested, is the thing to fall back on.

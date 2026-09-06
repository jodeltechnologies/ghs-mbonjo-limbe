# GHS Mbonjo Limbe

Website and administration system for Government High School Mbonjo, Limbe.
Lycée de Mbonjo, Limbe. Fako Division, South West Region, Cameroon.

Built to "Website and Administration System, Version 1.0, Prepared for the
Principal".

## The stack, as Part 2 names it

| Layer | Choice |
|---|---|
| Framework | Next.js with TypeScript, App Router |
| Hosting | Vercel |
| Database | Supabase, PostgreSQL |
| Schema | Prisma, with the SQL you actually run in `supabase/` |
| Styling | Tailwind CSS |
| Files | Supabase Storage |
| Documents | Server-rendered HTML at fixed A4 |
| Source control | GitHub, which also runs the wake service |

`NOTES.md` records three places where this build departs from the specification,
and why. Read it before the first deployment.

## Putting it online

`DEPLOYMENT.md`. GitHub, Vercel and Supabase, in a browser, no command line.

## What is here

```
supabase/01-schema.sql     the tables, Part 3
supabase/02-policies.sql   row level security, Part 10.3
supabase/03-seed-data.sql  92 staff, 92 pupils, 14 departments, settings
supabase/04-seed-roles.sql the appointments derived from the identity cards
prisma/schema.prisma       the same schema, for migrations
src/lib/permissions.ts     the capability table from Part 4
src/lib/references.ts      reference numbers from the token pattern, Part 3.6
src/lib/ai.ts              the provider chain, Part 8
src/components/DocumentSheet.tsx  the attestation at fixed A4, Part 7.2
src/app/api/health/route.ts       what the wake service calls, Part 10.1
.github/workflows/wake.yml        every six days, Part 10.1
```

## Built

Phases 1 to 3 of Part 11: the foundation, the public pages that matter, the
staff register with scope, departments and the naming of heads, the attestation
and the certificate, and the reference register.

## Not built

Phases 4 and 5: notes with approval, assignments, quizzes, marks, attendance,
discipline, report cards and parent access. **The tables and the policies for all
of them are already in `supabase/`,** so the database is complete and only the
screens are missing.

The tested prototype covers those screens and is the thing to work from when
porting them.

## The data

92 distinct people, 77 in service, merged from three sources that do not agree.
Six names appear twice in the school card index. One matricule is transposed
between two sources. Two people are recorded as transferred out while holding
current identity cards. Every one of those differences is carried into
`reconciliation_flags` and shown in the portal rather than smoothed over.

No source is overwritten. `source_records` keeps every imported row as it was
read.

Version 1.0. Prepared for the Principal.

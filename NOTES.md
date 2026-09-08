# Notes on the build

## Why this is not a Next.js application any more

Version 1.0 of this repository was Next.js with TypeScript, Prisma and Tailwind,
because that is what Part 2 of the specification names. It was replaced for two
reasons.

The first is that the Principal preferred the standalone page. That is not a
small thing. A system that the person in charge finds legible is a system that
gets used.

The second is reliability. A framework build has a hundred ways to fail on a
machine that is not the one it was written on, and this one was written on a
machine with no network, so it was never installed or built before being handed
over. A single HTML file and one serverless function have almost none.

What is lost: server rendering, typed data access, and the per-page routing that
Next.js gives for nothing. What is kept: the whole database, the row level
security, the seed data, the reference numbering, the wake service and the
provider chain.

## Row level security still does the work

Reads and writes go through the Supabase client carrying the signed-in person's
own session, so the policies in `supabase/02-policies.sql` are in force in the
database and not merely in the interface. The anon key in `config.js` is meant to
be public. What it can reach is decided by those policies.

## The shared record

The register, the students, the subjects and the calendar are settled and travel
inside the page. The school's daily work is one JSONB row, `app_state`. That is a
simplification, and an honest one: it makes the whole system work today with one
table and one policy, and it is where a school of this size actually is. If the
school outgrows it, the tables for every part of it already exist in
`01-schema.sql` and the work is moving reads across, not designing anything new.

The trade is that two people editing different screens at the same second can
overwrite one another, last write winning. With an office of three or four people
this is not a real risk, and realtime keeps everyone's screen current.

## Where the register differs from the specification

- **92 people, not 71.** Part 6 counts only the ministry export. Six people exist
  on the school's own records and not in that file. 77 are in service.
- **Ten unassigned Heads, not twelve**, after the six duplicated card index names
  are merged, plus Maureen Eduke Ngwese who the specification names.
- **Sixteen departments, not fourteen.** The identity cards yielded fourteen; the
  school's own website lists sixteen, adding Logic and Religious Studies.

## The obfuscated build

The published page has its comments stripped and its script encoded, so the
source does not read as source when the page is inspected. That is not security
and does not pretend to be. Anyone determined undoes it in minutes. It stops
casual copying. `app/source-readable.js` in the package is the plain version,
kept so the school is never locked out of its own system.

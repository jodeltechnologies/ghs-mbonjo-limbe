# GHS Mbonjo Limbe

Website and administration system for Government High School Mbonjo, Limbe.
Lycée de Mbonjo, Limbe. Bimbia, Limbe III, Fako Division, South West Region.
Founded 3 November 1975.

## What this is

One page, `index.html`, holding the whole system. It is the same file the
Principal can open from a memory stick, and the same file the school serves from
its own address. There is no build step, no framework and nothing to install.

That is deliberate. The earlier version of this repository was a Next.js
application, and every deployment was a chance for a version pin or an import
path to fail. A static page cannot fail to build.

```
index.html      the system. Open it, or serve it.
config.js       two lines the school edits. The only file that changes per school.
api/health.js   what the wake service calls. A plain serverless function.
vercel.json     headers. No build configuration, because there is no build.
supabase/       the database: schema, security, seed data, shared record.
```

## Two ways it runs

**Without `config.js` filled in**, everything works and is saved in the browser
of whoever is using it. Good for showing the Principal, and for a school with one
computer.

**With `config.js` filled in**, sign in is by school account and the working
record is shared: what the Principal corrects, the Secretary sees. The register,
the students and the calendar travel with the page; the day to day work lives in
one row of `app_state`, guarded by the policies in `supabase/02-policies.sql`.

## Putting it online

`EASY-DEPLOY.md` in the package above this folder. Browser only, no command line.

## The data

92 distinct people, 77 in service, merged from the ministry export of 22 March
2026, the school card index and the 63 professional identity cards. Six names
appear twice in the card index; one matricule is transposed between two sources;
two people are recorded as transferred out while holding current identity cards.
Every difference is carried into `reconciliation_flags` and shown on the record
rather than smoothed over. No source is ever overwritten.

92 students in Form 1A and 1B. Two of them share a name and are two different
girls, which is why enrolments key on the school number.

## Still outstanding

- The department of each of the ten remaining Heads. The portal asks for this
  on the dashboard and stops asking once they are named.
- Confirmation of the Vice Principals and what each supervises.
- The shield in vector form, or at a thousand pixels or more.
- A photograph for the home page taken in better light.
- Whether the school wants fees and receipting used in earnest.

Version 1.2. Prepared for the Principal.

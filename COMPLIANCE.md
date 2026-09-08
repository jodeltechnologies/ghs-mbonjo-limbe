# Where the build stands against the specification

Version 1.4. Checked part by part against "Website and Administration System,
Version 1.0, Prepared for the Principal".

## Built and working

**Part 1, principles.** The school roster is authoritative. No source is
overwritten. Every difference is shown rather than smoothed over.

**Part 3, schema.** All twenty eight tables in `supabase/01-schema.sql`,
including the ones for parts not yet built, so the database is ahead of the
screens rather than behind them.

**Part 4, roles.** The capability table, scope, and the post holders **as the
document names them**: one Principal, six Vice Principals including Ashu Nelson
Eyongechaw as newly promoted, four Senior Discipline Masters, the Bursar, the
Head of Guidance and Counselling, two Guidance Counsellors, the Pedagogic
Animator and the Staff Social President. The remaining Heads are seeded
unassigned.

**Part 5.1, public website.** All twelve screens, with the school's own history,
mission, vision and GCE record.

**Part 5.2, Principal.** Dashboard, staff register, reconciliation, departments,
role assignments, students, documents, content approval, providers, settings,
audit log.

**Part 5.4, Head of Department.** Department dashboard, staff of the department,
notes awaiting approval, scheme of work, departmental report with assistance,
marks overview.

**Part 5.5, Teacher.** Own record with changes submitted for approval, notes,
assignments, quizzes, marks.

**Part 6, import and reconciliation.** Four groups: new, matched and identical,
matched with differences, ambiguous. Field by field, existing against incoming,
with a choice on each. Decisions are remembered so the same conflict is not
raised again. Nothing is written until Apply. Every import is recorded and can be
reversed for twenty four hours. Student import has the column mapping step, and
a student whose age falls outside the range for the class is flagged, not
refused.

**Part 7, documents.** The letterhead from settings. Attestation of Effective
Service. Certificate of Assumption of Duty and Certificate of Resumption of Duty
as separate documents. Free letterhead with drafting. Reference register with
tokens, padding, reset rule and scope. Batch generation. Signatures available and
off by default, as 7.7 asks.

**Part 8, assisted writing.** Ordered providers, one adapter for
OpenAI-compatible services and one for Gemini, three failures sets a provider
aside for fifteen minutes, every call logged, and the editor opens empty when all
fail. Used on the letterhead, news, questions from a note, summaries for
revision, translation both ways, departmental reports and report card comments.
The writing rules are in settings and sent with every request.

**Part 9, presentation.** Single column widening at 768 and 1024. Touch targets
at 44 pixels. Registers show name, function and department below 768 with the
record opening on tap. Wide tables scroll inside their frame. Documents at fixed
A4. Icons at 32, 180 and 512 with a manifest. Titles read "Section — GHS Mbonjo
Limbe". Open Graph and Twitter cards at 1200 by 630.

**Part 10, operation.** Health route with a real database read, the six-day
workflow with its monthly self-commit, backup and restore, row level security,
and the audit log.

## Not built, and named honestly

- **Timetable.** Named in 5.3, 5.5 and 5.6. Not built.
- **Quizzes** are single-answer multiple choice. The schema in 3.5 also has
  multiple, true or false, and short answer, with opening and closing times,
  duration, attempts and shuffling. Not built.
- **Answer keys** are in the page, because the app runs in the browser. 3.5 asks
  that they never reach the browser before a quiz closes. That needs a server.
- **Student screens** cover assignments, quizzes and marks. Notes by subject and
  announcements are not built.
- **Media albums** for the gallery. The gallery shows staff by department and the
  campus photograph; albums are not built.
- **Editable static pages** in the portal, from 3.7.
- **Nightly database dump.** Backup is manual, to the computer.
- **French writing rules** are not held separately, as 8.3 asks. The English
  rules are sent for French drafting.
- **Ten unassigned Heads**, where Part 12 expects twelve. Ten is what the card
  index yields once the six duplicated names are merged.

import { supabaseServer } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import { getSession } from '@/lib/session';
import { compose, scopeKey } from '@/lib/references';
import { DocumentSheet } from '@/components/DocumentSheet';
import { issueDocument } from './actions';

export const metadata = { title: 'Generate a document' };
export const dynamic = 'force-dynamic';

// The function printed is the one held on the date of issue, not whatever the
// person holds today. Part 7.2.
async function functionOn(staffId: string, on: string) {
  const db = supabaseServer();
  const { data } = await db.from('role_assignments')
    .select('role, department, starts_on, ends_on')
    .eq('staff_id', staffId).lte('starts_on', on);
  const live = (data ?? []).filter(r => !r.ends_on || r.ends_on >= on);
  const order = ['principal', 'vice_principal', 'bursar', 'senior_discipline_master',
                 'hod', 'guidance_counsellor', 'pedagogic_animator', 'staff_social_president'];
  live.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
  const top = live.find(r => order.includes(r.role));
  if (!top) return 'TEACHER';
  if (top.role === 'hod' && top.department) return `HEAD OF DEPARTMENT, ${top.department}`;
  return top.role.replace(/_/g, ' ').toUpperCase();
}

export default async function Documents({
  searchParams,
}: { searchParams: { staff?: string; type?: string } }) {
  const session = await getSession();
  const db = supabaseServer();
  const { school, reference } = await getSettings();

  const type = (searchParams.type as 'attestation' | 'certificate') ?? 'attestation';
  const today = new Date().toISOString().slice(0, 10);

  const { data: people } = await db.from('staff')
    .select('id, display_name').eq('service_status', 'active').order('display_name');

  const staffId = searchParams.staff ?? '';
  const { data: staff } = staffId
    ? await db.from('staff').select('*').eq('id', staffId).single()
    : { data: null };

  // Shown while drafting. The number is taken only on issue.
  const { data: counter } = await db.from('reference_counters')
    .select('next_value').eq('scope_key', scopeKey(reference, type, school.academic_year)).maybeSingle();
  const preview = compose(reference, type, counter?.next_value ?? reference.start ?? 1, school.academic_year);

  const { data: principalRow } = await db.from('role_assignments')
    .select('staff:staff_id (display_name, corps)').eq('role', 'principal').is('ends_on', null).maybeSingle();
  const principal = (principalRow as any)?.staff ?? { display_name: '', corps: '' };

  return (
    <>
      <div className="pb-4 mb-5 border-b-[1.5px] border-ink noprint">
        <h1 className="text-2xl">Generate a document</h1>
        <p className="text-sm text-ink2 mt-1 max-w-[70ch]">
          The reference is allocated when you issue, not while you draft.
        </p>
      </div>

      <form action={issueDocument}>
        <input type="hidden" name="type" value={type} />
        <div className="flex flex-wrap gap-2 mb-4 noprint">
          <select name="staff_id" defaultValue={staffId}
                  className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper min-w-[220px]">
            <option value="">Choose a member of staff</option>
            {(people ?? []).map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
          <input name="issued_on" type="date" defaultValue={today}
                 className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper" />
          <input name="reference" defaultValue="" placeholder={preview}
                 className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper flex-1 min-w-[280px]" />
        </div>

        {staff ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4 noprint">
              <input name="function_text" defaultValue={await functionOn(staff.id, today)}
                     className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper flex-1 min-w-[280px]" />
              <input name="decision_no" defaultValue={staff.appointment_decision_no ?? 'ON DUTY'}
                     className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper w-[170px]" />
              <input name="assumed_on" type="date" defaultValue={staff.date_assumed_duty_here ?? ''}
                     className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper" />
            </div>

            <div className="bg-surface-2 p-5 overflow-x-auto border border-rule">
              <DocumentSheet
                type={type}
                cfg={school}
                reference={preview}
                issuedOn={today}
                principalName={principal.display_name}
                principalCorps={principal.corps}
                staffName={staff.display_name}
                corps={staff.corps ?? ''}
                matricule={staff.matricule_raw ?? ''}
                matriculeLabel={staff.matricule_status === 'none' ? 'School number' : 'Matricule Number'}
                salaryIndex={staff.salary_index ?? ''}
                decisionNo={staff.appointment_decision_no ?? 'ON DUTY'}
                assumedOn={staff.date_assumed_duty_here ?? ''}
                functionText={await functionOn(staff.id, today)}
                academicYear={school.academic_year}
              />
            </div>

            <div className="mt-4 flex gap-2 noprint">
              <button className="min-h-[44px] px-4 rounded-sm bg-green text-white font-semibold">
                Issue and record
              </button>
            </div>
            <p className="text-sm text-ink2 mt-2 noprint">
              Documents print unsigned, for wet signature and stamp.
            </p>
          </>
        ) : (
          <div className="border border-dashed border-rule p-6 text-center text-sm text-ink2">
            <b className="block font-serif text-lg text-ink mb-1">Choose a member of staff</b>
            The form fills itself from the register, and you may correct any line before issuing.
          </div>
        )}
      </form>
    </>
  );
}

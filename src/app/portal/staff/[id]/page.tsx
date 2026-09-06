import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const GROUPS: Array<[string, Array<[string, string]>]> = [
  ['Identity', [
    ['display_name', 'Name'], ['former_name', 'Former name'], ['sex', 'Sex'],
    ['date_of_birth', 'Date of birth'], ['place_of_birth', 'Place of birth'],
    ['marital_status', 'Marital status'], ['region_of_origin', 'Region of origin'],
    ['division_of_origin', 'Division of origin'],
  ]],
  ['Service', [
    ['matricule_raw', 'Matricule'], ['matricule_status', 'Matricule status'],
    ['corps', 'Corps'], ['employment_type', 'Employment'], ['echelon', 'Echelon'],
    ['salary_index', 'Salary index'], ['specialty', 'Specialty'],
    ['date_entered_public_service', 'Entered public service'],
    ['highest_qualification', 'Highest qualification'],
    ['date_assumed_duty_here', 'Assumed duty here'],
    ['appointment_decision_no', 'Appointment decision'],
  ]],
  ['Posting and contact', [
    ['place_of_work', 'Place of work'], ['phone', 'Telephone'], ['whatsapp', 'WhatsApp'],
  ]],
];

// Dates of birth, salary indices and telephone numbers appear only to those
// entitled to see them. Part 10.3.
const SENSITIVE = ['date_of_birth', 'salary_index', 'phone', 'whatsapp', 'echelon'];

export default async function StaffRecord({ params }: { params: { id: string } }) {
  const session = await getSession();
  const db = supabaseServer();

  const { data: staff } = await db.from('staff').select('*').eq('id', params.id).single();
  if (!staff) notFound();

  const [{ data: roles }, { data: flags }, { data: sources }] = await Promise.all([
    db.from('role_assignments').select('role, department, note, starts_on')
      .eq('staff_id', params.id).is('ends_on', null),
    db.from('reconciliation_flags').select('kind, detail').eq('staff_id', params.id).eq('resolved', false),
    db.from('source_records').select('source').eq('staff_id', params.id),
  ]);

  const sensitiveOk = can(session!.role, 'staff.view.all') || session!.staffId === params.id;
  const counted = (sources ?? []).reduce<Record<string, number>>(
    (a, r) => ({ ...a, [r.source]: (a[r.source] ?? 0) + 1 }), {});

  return (
    <>
      <p className="text-sm mb-2"><Link href="/portal/staff">Staff register</Link></p>
      <div className="pb-4 mb-5 border-b-[1.5px] border-ink">
        <h1 className="text-2xl">{staff.display_name}</h1>
        <p className="text-sm text-ink2 mt-1">
          {staff.corps} · {staff.service_status}
          {staff.primary_department ? ` · ${staff.primary_department}` : ' · no department'}
        </p>
      </div>

      {(flags ?? []).map((f, i) => (
        <div key={i} className="border-l-[3px] border-amber-600 bg-amber-50 text-amber-800 px-3 py-2 mb-2 text-sm">
          {f.detail}.
        </div>
      ))}
      {staff.status_note && (
        <p className="text-sm text-ink2 mb-4">{staff.status_note}.</p>
      )}

      <h2 className="text-lg mb-2">Roles held</h2>
      {roles?.length ? (
        <ul className="text-sm mb-6">
          {roles.map((r, i) => (
            <li key={i} className="border-b border-rule/60 py-1.5">
              {r.role.replace(/_/g, ' ')}{r.department ? `, ${r.department}` : ''}
              <span className="text-ink2"> from {r.starts_on}{r.note ? `. ${r.note}` : ''}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-ink2 mb-6">Teaching only.</p>}

      {GROUPS.map(([group, fields]) => {
        const rows = fields.filter(([k]) => sensitiveOk || !SENSITIVE.includes(k));
        if (!rows.length) return null;
        return (
          <section key={group} className="mb-6">
            <h2 className="text-lg mb-2">{group}</h2>
            <dl className="grid grid-cols-[minmax(140px,38%)_1fr] text-sm">
              {rows.map(([k, label]) => (
                <div key={k} className="contents">
                  <dt className="text-ink2 py-1.5 pr-3 border-b border-rule/60">{label}</dt>
                  <dd className="py-1.5 border-b border-rule/60 break-words">
                    {(staff as Record<string, unknown>)[k] as string || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}

      <h2 className="text-lg mb-2">Where this record came from</h2>
      <p className="text-sm text-ink2">
        Ministry export: {counted.ministry ?? 0} rows. School card index: {counted.card_index ?? 0} rows.
        Identity card: {counted.id_card ? 'yes' : 'none'}. No source is ever overwritten;
        corrections are kept on top of them.
      </p>

      {can(session!.role, 'document.generate') && (
        <div className="mt-6 flex gap-2 flex-wrap">
          <Link href={`/portal/documents?staff=${staff.id}&type=attestation`}
                className="min-h-[40px] px-4 inline-flex items-center rounded-sm bg-green text-white font-semibold text-sm">
            Attestation of service
          </Link>
          <Link href={`/portal/documents?staff=${staff.id}&type=certificate`}
                className="min-h-[40px] px-4 inline-flex items-center rounded-sm border-[1.5px] border-green text-green font-semibold text-sm">
            Certificate of assumption
          </Link>
        </div>
      )}
    </>
  );
}

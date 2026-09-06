import Link from 'next/link';
import { getSession } from '@/lib/session';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Staff register' };
export const dynamic = 'force-dynamic';

// Row level security already limits what comes back. A Vice Principal
// responsible for Chemistry receives Chemistry and her own record, and no
// filtering here is what keeps that true.
export default async function StaffRegister({
  searchParams,
}: { searchParams: { q?: string; status?: string; dept?: string } }) {
  const session = await getSession();
  const db = supabaseServer();

  let query = db.from('staff')
    .select('id, display_name, matricule_raw, corps, primary_department, service_status, specialty')
    .order('display_name');

  const status = searchParams.status ?? 'active';
  if (status) query = query.eq('service_status', status);
  if (searchParams.dept) query = query.eq('primary_department', searchParams.dept);
  if (searchParams.q) query = query.ilike('display_name', `%${searchParams.q}%`);

  const { data: staff, error } = await query;
  const { data: depts } = await db.from('departments').select('code, name_en').order('name_en');
  const deptName = Object.fromEntries((depts ?? []).map(d => [d.code, d.name_en]));

  return (
    <>
      <div className="pb-4 mb-5 border-b-[1.5px] border-ink">
        <h1 className="text-2xl">Staff register</h1>
        <p className="text-sm text-ink2 mt-1 max-w-[70ch]">
          {session!.scope.length
            ? 'Limited to the departments named in your role assignment.'
            : 'The school\u2019s own record, assembled from the ministry export, the card index and the identity cards.'}
        </p>
      </div>

      <form className="flex flex-wrap gap-2 mb-4">
        <input name="q" defaultValue={searchParams.q ?? ''} type="search" placeholder="Search by name"
               className="min-h-[40px] px-3 border-[1.5px] border-rule rounded-sm bg-paper flex-1 min-w-[200px]" />
        <select name="status" defaultValue={status}
                className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper">
          <option value="active">In service</option>
          <option value="retired">Retired</option>
          <option value="abandoned">Abandoned post</option>
          <option value="transferred">Transferred out</option>
          <option value="unknown">Unknown</option>
          <option value="">Every status</option>
        </select>
        <select name="dept" defaultValue={searchParams.dept ?? ''}
                className="min-h-[40px] px-2 border-[1.5px] border-rule rounded-sm bg-paper">
          <option value="">All departments</option>
          {(depts ?? []).map(d => <option key={d.code} value={d.code}>{d.name_en}</option>)}
        </select>
        <button className="min-h-[40px] px-4 rounded-sm bg-green text-white font-semibold text-sm">Search</button>
      </form>

      {error && <p className="text-brick text-sm">The register could not be read. {error.message}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-ink text-left text-xs text-ink2">
              <th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Matricule</th>
              <th className="py-2 pr-3">Corps</th><th className="py-2 pr-3">Department</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(staff ?? []).map(s => (
              <tr key={s.id} className="border-b border-rule/60">
                <td className="py-2 pr-3">
                  <Link href={`/portal/staff/${s.id}`} className="font-semibold">{s.display_name}</Link>
                </td>
                <td className="py-2 pr-3 tabular-nums">{s.matricule_raw ?? '—'}</td>
                <td className="py-2 pr-3">{s.corps ?? '—'}</td>
                <td className="py-2 pr-3">{s.primary_department ? deptName[s.primary_department] : '—'}</td>
                <td className="py-2 pr-3">{s.service_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!staff?.length && (
        <div className="border border-dashed border-rule p-6 text-center text-sm text-ink2 mt-4">
          <b className="block font-serif text-lg text-ink mb-1">No one matches</b>
          Widen the filters above.
        </div>
      )}
    </>
  );
}

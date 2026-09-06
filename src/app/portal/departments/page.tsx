import { supabaseServer } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/permissions';
import { setHead } from './actions';

export const metadata = { title: 'Departments' };
export const dynamic = 'force-dynamic';

export default async function PortalDepartments() {
  const session = await getSession();
  const db = supabaseServer();

  const [{ data: depts }, { data: staff }, { data: heads }] = await Promise.all([
    db.from('departments').select('code, name_en, name_fr').order('name_en'),
    db.from('staff').select('id, display_name, primary_department').eq('service_status', 'active').order('display_name'),
    db.from('role_assignments').select('id, staff_id, department').eq('role', 'hod').is('ends_on', null),
  ]);

  const headOf = Object.fromEntries((heads ?? []).filter(h => h.department).map(h => [h.department, h.staff_id]));
  const nameOf = Object.fromEntries((staff ?? []).map(s => [s.id, s.display_name]));
  const unassigned = (heads ?? []).filter(h => !h.department);

  return (
    <>
      <div className="pb-4 mb-5 border-b-[1.5px] border-ink">
        <h1 className="text-2xl">Departments</h1>
        <p className="text-sm text-ink2 mt-1 max-w-[70ch]">
          Fourteen departments, taken from the school&rsquo;s own identity cards. Department
          is independent of corps.
        </p>
      </div>

      {unassigned.length > 0 && (
        <div className="border-l-[3px] border-amber-600 bg-amber-50 text-amber-800 px-3 py-2 mb-4 text-sm">
          {unassigned.length} people are recorded as Heads of Department without a department
          named: {unassigned.map(h => nameOf[h.staff_id]).filter(Boolean).join(', ')}.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-ink text-left text-xs text-ink2">
              <th className="py-2 pr-3">Department</th><th className="py-2 pr-3">Head</th>
              <th className="py-2 pr-3">Teachers</th>
            </tr>
          </thead>
          <tbody>
            {(depts ?? []).map(d => {
              const members = (staff ?? []).filter(s => s.primary_department === d.code);
              return (
                <tr key={d.code} className="border-b border-rule/60">
                  <td className="py-2 pr-3">
                    <b>{d.name_en}</b><br /><span className="text-ink2 text-xs">{d.name_fr}</span>
                  </td>
                  <td className="py-2 pr-3">
                    {can(session!.role, 'roles.assign') ? (
                      <form action={setHead} className="flex gap-1">
                        <input type="hidden" name="code" value={d.code} />
                        <select name="staff_id" defaultValue={headOf[d.code] ?? ''}
                                className="min-h-[36px] px-2 border border-rule rounded-sm bg-paper max-w-[220px]">
                          <option value="">Not yet appointed</option>
                          {(staff ?? []).map(s => (
                            <option key={s.id} value={s.id}>{s.display_name}</option>
                          ))}
                        </select>
                        <button className="min-h-[36px] px-2 border border-green text-green rounded-sm text-xs">
                          Save
                        </button>
                      </form>
                    ) : (headOf[d.code] ? nameOf[headOf[d.code]] : 'Not yet appointed')}
                  </td>
                  <td className="py-2 pr-3">{members.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

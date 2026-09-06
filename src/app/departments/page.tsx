import { Masthead } from '@/components/Masthead';
import { getSettings } from '@/lib/settings';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Departments' };
export const revalidate = 600;

export default async function Departments() {
  const { school } = await getSettings();
  const db = supabaseServer();
  const { data: depts } = await db.from('departments').select('code, name_en, name_fr').order('name_en');

  return (
    <>
      <Masthead cfg={school} />
      <div className="mx-auto max-w-[1120px] px-5 py-11">
        <h1 className="text-4xl">Departments</h1>
        <p className="font-serif text-[1.18rem] text-ink2 mt-3">
          Fourteen departments, taken from the school&rsquo;s own identity cards.
        </p>
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-[1.5px] border-ink text-left text-xs text-ink2">
                <th className="py-2 pr-3">Department</th><th className="py-2 pr-3">Département</th>
              </tr>
            </thead>
            <tbody>
              {(depts ?? []).map(d => (
                <tr key={d.code} className="border-b border-rule/60">
                  <td className="py-2 pr-3 font-semibold">{d.name_en}</td>
                  <td className="py-2 pr-3 text-ink2">{d.name_fr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-ink2 mt-4">
          Heads of department are named by the Principal in the portal. The public page
          never shows dates of birth, salary indices or telephone numbers.
        </p>
      </div>
    </>
  );
}

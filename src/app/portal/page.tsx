import Link from 'next/link';
import { getSession } from '@/lib/session';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await getSession();
  const db = supabaseServer();

  const [{ count: inService }, { count: pupils }, { count: issued }, { data: flags }, { data: hodsNoDept }] =
    await Promise.all([
      db.from('staff').select('id', { count: 'exact', head: true }).eq('service_status', 'active'),
      db.from('students').select('id', { count: 'exact', head: true }),
      db.from('documents').select('id', { count: 'exact', head: true }).neq('status', 'cancelled'),
      db.from('reconciliation_flags').select('kind, detail').eq('resolved', false).limit(50),
      db.from('role_assignments').select('id').eq('role', 'hod').is('department', null).is('ends_on', null),
    ]);

  const tiles = [
    [inService ?? 0, 'In service'],
    [pupils ?? 0, 'Pupils'],
    [issued ?? 0, 'Documents issued'],
    [flags?.length ?? 0, 'Differences to review'],
  ] as const;

  return (
    <>
      <div className="pb-4 mb-5 border-b-[1.5px] border-ink">
        <h1 className="text-2xl">Dashboard</h1>
        <p className="text-sm text-ink2 mt-1">Good day, {session!.name}.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border border-rule bg-paper mb-6">
        {tiles.map(([n, label]) => (
          <div key={label} className="p-4 border-r border-b border-rule last:border-r-0">
            <b className="block font-serif text-3xl leading-none">{n}</b>
            <span className="text-xs text-ink2">{label}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl mb-2">Outstanding</h2>
      {hodsNoDept && hodsNoDept.length > 0 && (
        <div className="border-l-[3px] border-amber-600 bg-amber-50 text-amber-800 px-3 py-2 mb-2 text-sm">
          {hodsNoDept.length} Heads of Department have no department named.{' '}
          <Link href="/portal/departments" className="font-semibold">Assign them</Link>.
        </div>
      )}
      {(flags ?? []).slice(0, 8).map((f, i) => (
        <div key={i} className="border-l-[3px] border-amber-600 bg-amber-50 text-amber-800 px-3 py-2 mb-2 text-sm">
          {f.detail}.
        </div>
      ))}
      {!hodsNoDept?.length && !flags?.length && (
        <p className="text-sm text-ink2">Nothing outstanding.</p>
      )}
    </>
  );
}

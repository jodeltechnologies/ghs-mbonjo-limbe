import { supabaseServer } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import { getSession } from '@/lib/session';
import { can } from '@/lib/permissions';
import { cancelDocument } from '../actions';

export const metadata = { title: 'Reference register' };
export const dynamic = 'force-dynamic';

export default async function ReferenceRegister({
  searchParams,
}: { searchParams: { issued?: string } }) {
  const session = await getSession();
  const db = supabaseServer();
  const { reference } = await getSettings();
  const { data: docs } = await db
    .from('documents')
    .select('id, reference, reference_manual, type, status, issued_on, cancelled_reason, staff:subject_staff_id (display_name)')
    .order('issued_on', { ascending: false }).limit(200);

  return (
    <>
      <div className="pb-4 mb-5 border-b-[1.5px] border-ink">
        <h1 className="text-2xl">Reference register</h1>
        <p className="text-sm text-ink2 mt-1 max-w-[70ch]">
          A running log of every document this school has issued. A cancelled document
          keeps its number, so the register has no gaps.
        </p>
      </div>

      {searchParams.issued && (
        <div className="border-l-[3px] border-green text-green px-3 py-2 mb-4 text-sm">
          Issued as {searchParams.issued}.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-ink text-left text-xs text-ink2">
              <th className="py-2 pr-3">Reference</th><th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Concerning</th>
              <th className="py-2 pr-3">Status</th><th />
            </tr>
          </thead>
          <tbody>
            {(docs ?? []).map((d: any) => (
              <tr key={d.id} className="border-b border-rule/60">
                <td className="py-2 pr-3 font-semibold tabular-nums">
                  {d.reference}{d.reference_manual && <span className="ml-1 text-xs text-ink2">typed</span>}
                </td>
                <td className="py-2 pr-3">{d.issued_on}</td>
                <td className="py-2 pr-3">{d.type}</td>
                <td className="py-2 pr-3">{d.staff?.display_name ?? '—'}</td>
                <td className="py-2 pr-3">
                  {d.status === 'cancelled'
                    ? <span className="text-brick">Cancelled. {d.cancelled_reason}</span>
                    : <span className="text-green">Issued</span>}
                </td>
                <td className="py-2">
                  {d.status !== 'cancelled' && can(session!.role, 'document.sign') && (
                    <form action={cancelDocument} className="flex gap-1">
                      <input type="hidden" name="id" value={d.id} />
                      <input name="reason" placeholder="Reason" required
                             className="min-h-[32px] px-2 border border-rule rounded-sm text-xs w-32" />
                      <button className="min-h-[32px] px-2 border border-green text-green rounded-sm text-xs">
                        Cancel
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!docs?.length && (
        <div className="border border-dashed border-rule p-6 text-center text-sm text-ink2 mt-4">
          <b className="block font-serif text-lg text-ink mb-1">The register is empty</b>
          Issue a document and it is recorded here with its number, the date, the person
          concerned and who generated it.
        </div>
      )}

      <p className="text-sm text-ink2 mt-4">
        Format in use: <b>{reference.pattern}</b>, padded to {reference.padding} figures,{' '}
        {reference.scope === 'shared' ? 'one counter shared by every type' : 'a separate counter for each type'},
        reset {String(reference.reset).replace('_', ' ')}.
      </p>
    </>
  );
}

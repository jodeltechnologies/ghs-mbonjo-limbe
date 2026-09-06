import { Masthead } from '@/components/Masthead';
import { getSettings } from '@/lib/settings';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Verify' };
export const dynamic = 'force-dynamic';

// Reads a reference and answers whether it is genuine. No personal detail is
// shown, and the lookup runs through a security definer function so that the
// public site never reads the staff table. Part 5.1.
export default async function Verify({ searchParams }: { searchParams: { q?: string } }) {
  const { school } = await getSettings();
  const q = (searchParams.q ?? '').trim();
  let answer: { tone: 'ok' | 'bad' | 'plain'; text: string } | null = null;

  if (q) {
    const db = supabaseServer();
    const { data: doc } = await db.rpc('verify_reference', { p_ref: q });
    const row = Array.isArray(doc) ? doc[0] : null;
    if (row) {
      answer = row.status === 'cancelled'
        ? { tone: 'bad',  text: `Reference ${row.reference} was issued on ${row.issued_on} and has since been cancelled. It should not be accepted.` }
        : { tone: 'ok',   text: `Reference ${row.reference} is a genuine document of this school, issued on ${row.issued_on}, concerning ${row.concerning}.` };
    } else {
      const { data: st } = await db.rpc('verify_staff', { p_matricule: q });
      const s = Array.isArray(st) ? st[0] : null;
      answer = s
        ? (s.serving
            ? { tone: 'ok',    text: `${s.name} is serving in this institution.` }
            : { tone: 'plain', text: `${s.name} appears in the school record but is not in active service. Telephone the school on ${school.phone}.` })
        : { tone: 'bad', text: `Nothing found for "${q}". Check the reference and try again, or telephone the school on ${school.phone}.` };
    }
  }

  const tone = answer?.tone === 'ok'  ? 'border-green text-green'
             : answer?.tone === 'bad' ? 'border-brick text-brick'
             : 'border-rule text-ink2';

  return (
    <>
      <Masthead cfg={school} />
      <div className="mx-auto max-w-[660px] px-5 py-11">
        <h1 className="text-4xl">Verify</h1>
        <p className="font-serif text-[1.18rem] text-ink2 mt-3">
          Enter the reference number printed on an attestation, or the matricule of a
          member of staff, and the school will confirm whether it is genuine.
        </p>
        <form className="mt-6">
          <label className="block text-sm font-semibold mb-1" htmlFor="q">Reference or matricule</label>
          <input id="q" name="q" defaultValue={q}
                 className="w-full min-h-[44px] px-3 border-[1.5px] border-rule rounded-sm bg-paper"
                 placeholder="001/MINESEC/RDSE-SW/DDSE-FAKO/GHSM" />
          <button className="mt-3 min-h-[44px] px-4 rounded-sm bg-green text-white font-semibold">
            Check this reference
          </button>
        </form>
        {answer && <div className={`mt-6 border-l-[3px] pl-3 py-2 ${tone}`}>{answer.text}</div>}
        <p className="text-sm text-ink2 mt-6">
          The check answers only whether the document or the person is on the school&rsquo;s record.
        </p>
      </div>
    </>
  );
}

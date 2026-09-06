import { Masthead } from '@/components/Masthead';
import { getSettings } from '@/lib/settings';
import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 300;

export default async function Home() {
  const { school } = await getSettings();
  const db = supabaseServer();
  const { data: posts } = await db
    .from('news_posts').select('slug, title, excerpt, published_on')
    .eq('status', 'published').order('published_on', { ascending: false }).limit(3);
  const { count: departments } = await db
    .from('departments').select('code', { count: 'exact', head: true });

  return (
    <>
      <Masthead cfg={school} />
      <section className="relative bg-green-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/campus.webp" alt="Classroom blocks at Government High School Mbonjo, Limbe"
             className="w-full h-[clamp(240px,42vw,440px)] object-cover opacity-55" />
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-green-deep/90 to-transparent">
          <div className="mx-auto max-w-[1120px] text-white">
            <h1 className="text-[clamp(1.9rem,4.4vw,3rem)] max-w-[16ch]">
              Government High School Mbonjo, Limbe
            </h1>
            <p className="font-serif italic text-gold text-[clamp(1rem,2vw,1.3rem)] mt-1">
              Discipline, Hardwork &amp; Success
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-5 py-11">
        <p className="font-serif text-[1.18rem] leading-relaxed text-ink2 max-w-[62ch]">
          A public secondary school of the South West Region, at Bonjo in Limbe III,
          teaching the first and second cycles of the general and technical streams.
          The school keeps its own record of staff and pupils, and issues its
          attestations from it.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl mb-2">News</h2>
            {posts && posts.length ? posts.map(p => (
              <p key={p.slug} className="mb-3">
                <Link href={`/news/${p.slug}`} className="font-semibold">{p.title}</Link>
                <br /><span className="text-sm text-ink2">{p.excerpt}</span>
              </p>
            )) : (
              <p className="text-sm text-ink2">
                Nothing published yet. The Principal and Vice Principals publish news
                from the portal, and anything published there appears here.
              </p>
            )}
          </div>
          <div>
            <h2 className="text-2xl mb-2">The school</h2>
            <ul className="text-sm space-y-1">
              <li><Link href="/departments">The {departments ?? 14} departments</Link></li>
              <li><Link href="/verify">Verify an attestation</Link></li>
              <li><Link href="/signin">Staff portal</Link></li>
            </ul>
            <p className="text-sm text-ink2 mt-4">Telephone {school.phone}</p>
          </div>
        </div>
      </div>
    </>
  );
}

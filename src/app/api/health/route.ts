import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The wake service calls this. It must perform a real database read and touch
// storage. A ping that reaches only the web server does not count as database
// activity, which is a common and expensive mistake.
export async function GET(request: Request) {
  const secret = process.env.WAKE_SECRET;
  const given  = request.headers.get('x-wake-secret');
  if (secret && given !== secret) {
    return NextResponse.json({ error: 'not permitted' }, { status: 401 });
  }

  const db = supabaseAdmin();
  const out: Record<string, unknown> = { at: new Date().toISOString() };

  try {
    const { count, error } = await db
      .from('staff').select('id', { count: 'exact', head: true });
    if (error) throw error;
    out.database = 'ok';
    out.staff = count;
    await db.from('wake_log').insert({ source: given ? 'workflow' : 'manual' });
  } catch (e) {
    out.database = 'failed';
    out.error = (e as Error).message;
    return NextResponse.json(out, { status: 500 });
  }

  try {
    await db.storage.listBuckets();
    out.storage = 'ok';
  } catch {
    out.storage = 'failed';
  }

  return NextResponse.json(out, { headers: { 'cache-control': 'no-store' } });
}

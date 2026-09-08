// The wake service calls this. It performs a real database read, because a ping
// that reaches only the web server does not count as database activity, and a
// Supabase project on the free plan is suspended after seven days without any.
//
// A plain serverless function in CommonJS, so that it runs on Vercel with no
// package.json and no build step at all. fetch is built into Node 18 and later.

module.exports = async function handler(req, res) {
  const secret = process.env.WAKE_SECRET;
  if (secret && req.headers['x-wake-secret'] !== secret) {
    return res.status(401).json({ error: 'not permitted' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set' });
  }

  const out = { at: new Date().toISOString() };

  try {
    const r = await fetch(`${url}/rest/v1/staff?select=id&limit=1`, {
      headers: { apikey: key, authorization: `Bearer ${key}`, prefer: 'count=exact' },
    });
    if (!r.ok) throw new Error(`the database answered ${r.status}`);
    out.database = 'ok';
    out.staff = (r.headers.get('content-range') || '').split('/')[1] || null;

    await fetch(`${url}/rest/v1/wake_log`, {
      method: 'POST',
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ source: req.headers['x-wake-secret'] ? 'workflow' : 'manual' }),
    });
  } catch (e) {
    out.database = 'failed';
    out.error = e.message;
    return res.status(500).json(out);
  }

  try {
    const s = await fetch(`${url}/storage/v1/bucket`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
    });
    out.storage = s.ok ? 'ok' : 'failed';
  } catch { out.storage = 'failed'; }

  res.setHeader('cache-control', 'no-store');
  return res.status(200).json(out);
};

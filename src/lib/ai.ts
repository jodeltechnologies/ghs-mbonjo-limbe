// Part 8. Providers are held in an ordered list. One adapter serves every
// provider offering an OpenAI-compatible interface, which covers most of the
// free services worth using. Gemini takes a second adapter.
//
// On a timeout, a rate limit or a server error the request falls through to the
// next provider. A provider that fails three times in succession is set aside
// for fifteen minutes rather than retried on every request. If every provider
// fails, the caller is told plainly and the editor opens empty, so that work is
// never blocked by an interface being unavailable.

import { supabaseAdmin } from '@/lib/supabase/server';

type Provider = {
  name: string; baseUrl: string; model: string;
  key: string; adapter: 'openai_compatible' | 'gemini'; priority: number;
};

const failures = new Map<string, { count: number; pausedUntil: number }>();
const PAUSE_MS = 15 * 60 * 1000;

function providers(): Provider[] {
  const out: Provider[] = [];
  for (let i = 1; i <= 5; i++) {
    const name = process.env[`AI_PROVIDER_${i}_NAME`];
    const key  = process.env[`AI_PROVIDER_${i}_KEY`];
    if (!name || !key) continue;
    out.push({
      name,
      baseUrl: process.env[`AI_PROVIDER_${i}_BASE_URL`] ?? '',
      model:   process.env[`AI_PROVIDER_${i}_MODEL`] ?? '',
      key,
      adapter: (process.env[`AI_PROVIDER_${i}_ADAPTER`] as Provider['adapter']) ?? 'openai_compatible',
      priority: i,
    });
  }
  return out.sort((a, b) => a.priority - b.priority);
}

export function providerHealth() {
  return providers().map(p => {
    const f = failures.get(p.name);
    return {
      name: p.name,
      healthy: !f || f.pausedUntil < Date.now(),
      failures: f?.count ?? 0,
      pausedUntil: f && f.pausedUntil > Date.now() ? new Date(f.pausedUntil).toISOString() : null,
    };
  });
}

async function callOpenAICompatible(p: Provider, system: string, user: string, signal: AbortSignal) {
  const r = await fetch(`${p.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${p.key}` },
    body: JSON.stringify({
      model: p.model, temperature: 0.6,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!r.ok) throw new Error(`${p.name} answered ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? '';
}

async function callGemini(p: Provider, system: string, user: string, signal: AbortSignal) {
  const url = `${p.baseUrl.replace(/\/$/, '')}/models/${p.model}:generateContent?key=${p.key}`;
  const r = await fetch(url, {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
    }),
  });
  if (!r.ok) throw new Error(`${p.name} answered ${r.status}`);
  const j = await r.json();
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function draft(purpose: string, system: string, user: string): Promise<string | null> {
  const db = supabaseAdmin();
  for (const p of providers()) {
    const f = failures.get(p.name);
    if (f && f.pausedUntil > Date.now()) continue;

    const started = Date.now();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 30000);
    try {
      const text = p.adapter === 'gemini'
        ? await callGemini(p, system, user, ac.signal)
        : await callOpenAICompatible(p, system, user, ac.signal);
      clearTimeout(timer);
      failures.delete(p.name);
      await db.from('ai_calls').insert({
        purpose, latency_ms: Date.now() - started, outcome: 'ok',
      });
      return text;
    } catch (e) {
      clearTimeout(timer);
      const count = (failures.get(p.name)?.count ?? 0) + 1;
      failures.set(p.name, { count, pausedUntil: count >= 3 ? Date.now() + PAUSE_MS : 0 });
      await db.from('ai_calls').insert({
        purpose, latency_ms: Date.now() - started,
        outcome: `${p.name}: ${(e as Error).message}`,
      });
    }
  }
  return null;   // every provider failed. The caller opens the editor empty.
}

export async function writingRules(): Promise<string> {
  const db = supabaseAdmin();
  const { data } = await db.from('settings').select('value').eq('key', 'writing_rules').single();
  return (data?.value as string) ?? '';
}

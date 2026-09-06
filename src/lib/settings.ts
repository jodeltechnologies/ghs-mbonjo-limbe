import { supabaseServer } from '@/lib/supabase/server';
import type { ReferenceSettings } from '@/lib/references';

export async function getSettings() {
  const db = supabaseServer();
  const { data } = await db.from('settings').select('key, value');
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return {
    school: (map.school ?? {}) as Record<string, string>,
    reference: (map.reference ?? {}) as ReferenceSettings,
    writingRules: (map.writing_rules ?? '') as string,
  };
}

import { supabaseServer } from '@/lib/supabase/server';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export type ReferenceSettings = {
  pattern: string; padding: number; start: number;
  reset: 'never' | 'calendar_year' | 'academic_year';
  scope: 'shared' | 'per_type';
};

export function scopeKey(cfg: ReferenceSettings, type: string, academicYear: string) {
  let k = cfg.scope === 'per_type' ? type : 'shared';
  if (cfg.reset === 'academic_year') k += '|' + academicYear;
  if (cfg.reset === 'calendar_year') k += '|' + new Date().getFullYear();
  return k;
}

export function compose(cfg: ReferenceSettings, type: string, n: number, academicYear: string) {
  const short = type === 'attestation' ? 'ATT' : type === 'certificate' ? 'CERT' : 'LTR';
  return cfg.pattern
    .replace(/\{SEQ\}/g, String(n).padStart(cfg.padding || 1, '0'))
    .replace(/\{YEAR\}/g, String(new Date().getFullYear()))
    .replace(/\{ACADEMIC_YEAR\}/g, academicYear)
    .replace(/\{TYPE\}/g, short)
    .replace(/\{MONTH\}/g, MONTHS[new Date().getMonth()]);
}

/** Allocated at the moment of issue, never while drafting, and through a
 *  database function so that two people cannot take the same number. */
export async function takeReference(type: string, cfg: ReferenceSettings, academicYear: string) {
  const db = supabaseServer();
  const { data, error } = await db.rpc('next_reference', {
    p_scope: scopeKey(cfg, type, academicYear),
    p_start: cfg.start ?? 1,
  });
  if (error) throw error;
  return compose(cfg, type, data as number, academicYear);
}

export async function referenceInUse(ref: string) {
  const db = supabaseServer();
  const { data } = await db.from('documents')
    .select('id').eq('reference', ref).neq('status', 'cancelled').limit(1);
  return !!(data && data.length);
}
